import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteMap } from '@/components/maps/RouteMap';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, ArrowLeft, MapPin, Clock, Calendar } from 'lucide-react';
import { formatDistance, format } from 'date-fns';

interface TrackingMapProps {}

type LatLngLiteral = {
  lat: number;
  lng: number;
};

// Define expected API response types
interface Booking {
  id: number;
  userId: string;
  vanListingId: number;
  vanListing: {
    id: number;
    userId: string;
    title: string;
    vanSize: string;
    hourlyRate: number;
  };
  bookingDate: string;
  duration: number;
  fromLocation: string;
  toLocation: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

interface TrackingPoint {
  bookingId: string;
  vanPosition: {
    lat: number;
    lng: number;
  };
  timestamp: string;
}

const TrackingMap: React.FC<TrackingMapProps> = () => {
  const { bookingId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [vanPosition, setVanPosition] = useState<LatLngLiteral | undefined>();
  
  // Fetch booking details
  const { data: booking, isLoading: isLoadingBooking, error: bookingError } = useQuery({
    queryKey: ['/api/bookings', bookingId],
    queryFn: () => apiRequest(`/api/bookings/${bookingId}`),
    enabled: !!bookingId,
    staleTime: 60000, // 1 minute
  });

  // Fetch van's current position
  const { data: currentPosition, isLoading: isLoadingPosition } = useQuery({
    queryKey: ['/api/van-tracking', bookingId, 'current'],
    queryFn: () => apiRequest(`/api/van-tracking/${bookingId}/current`),
    enabled: !!bookingId,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
    onSuccess: (data) => {
      if (data && data.lat && data.lng) {
        setVanPosition(data);
      }
    }
  });

  // Fetch van's tracking history
  const { data: trackingHistory } = useQuery({
    queryKey: ['/api/van-tracking', bookingId, 'history'],
    queryFn: () => apiRequest(`/api/van-tracking/${bookingId}/history`),
    enabled: !!bookingId,
  });

  // Mutation to update the van's position (for van owners)
  const updatePositionMutation = useMutation({
    mutationFn: (position: LatLngLiteral) => apiRequest('/api/van-tracking/update', {
      method: 'POST',
      body: JSON.stringify({
        bookingId,
        position
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/van-tracking', bookingId, 'current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/van-tracking', bookingId, 'history'] });
    }
  });

  // Handle van position updates
  const handleVanPositionUpdate = (position: LatLngLiteral) => {
    setVanPosition(position);
    
    // Only van owners can update the position
    if (user?.isVanOwner && booking?.vanListing.userId === user?.id) {
      updatePositionMutation.mutate(position);
    }
  };

  // Go back to booking details
  const handleBackToBooking = () => {
    if (user?.isVanOwner) {
      setLocation('/manage-bookings');
    } else {
      setLocation('/my-bookings');
    }
  };

  if (isLoadingBooking) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Unable to load booking details. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBackToBooking}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isVanOwner = user?.isVanOwner && booking.vanListing.userId === user?.id;
  const bookingDate = new Date(booking.bookingDate);
  const formattedDate = format(bookingDate, 'PPP'); // Format: April 29, 2023
  const formattedTime = format(bookingDate, 'p'); // Format: 12:00 PM

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handleBackToBooking}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RouteMap
            origin={booking.fromLocation}
            destination={booking.toLocation}
            vanPosition={vanPosition}
            bookingId={parseInt(bookingId as string)}
            isVanOwner={isVanOwner}
            onVanPositionUpdate={handleVanPositionUpdate}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                Booking Details
              </CardTitle>
              <CardDescription>
                Booking #{booking.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium">Route</h3>
                </div>
                <div className="ml-7 text-sm">
                  <p className="mb-1"><strong>From:</strong> {booking.fromLocation}</p>
                  <p><strong>To:</strong> {booking.toLocation}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium">Date & Time</h3>
                </div>
                <div className="ml-7 text-sm">
                  <p><strong>Date:</strong> {formattedDate}</p>
                  <p><strong>Time:</strong> {formattedTime}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium">Duration & Cost</h3>
                </div>
                <div className="ml-7 text-sm">
                  <p><strong>Duration:</strong> {booking.duration} hours</p>
                  <p><strong>Total Price:</strong> £{booking.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                Tracking Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {vanPosition ? 'Van is on the move' : 'Waiting for van to start'}
                  </span>
                </div>
                
                {vanPosition && (
                  <div className="flex items-center justify-between">
                    <span>Current Position:</span>
                    <span className="font-mono text-xs">
                      {vanPosition.lat.toFixed(6)}, {vanPosition.lng.toFixed(6)}
                    </span>
                  </div>
                )}

                {trackingHistory && trackingHistory.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Last updated:</span>
                    <span className="text-xs text-gray-500">
                      {formatDistance(new Date(trackingHistory[trackingHistory.length - 1].timestamp), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {isVanOwner && (
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                  onClick={() => navigator.geolocation && navigator.geolocation.getCurrentPosition(
                    (position) => handleVanPositionUpdate({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    }),
                    (error) => console.error("Error getting location:", error)
                  )}
                  disabled={updatePositionMutation.isPending}
                >
                  {updatePositionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update My Position'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
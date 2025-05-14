import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking, VanListing } from "@/lib/types";
import { CheckCircle, ChevronLeft, MapPin, Calendar, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isLoading: isLoadingAuth } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      navigate("/login?redirect=/booking-confirmation/" + id);
    }
  }, [user, isLoadingAuth, navigate, id]);
  
  // Fetch booking details
  const { data: booking, isLoading: isLoadingBooking } = useQuery<Booking>({
    queryKey: [`/api/bookings/${id}`],
    enabled: !!user,
  });
  
  // Fetch van listing details if booking is loaded
  const { data: vanListing, isLoading: isLoadingListing } = useQuery<VanListing>({
    queryKey: [`/api/van-listings/${booking?.vanListingId}`],
    enabled: !!booking,
  });
  
  const isLoading = isLoadingAuth || isLoadingBooking || isLoadingListing;
  
  if (isLoadingAuth) {
    return null; // Will redirect to login if needed
  }
  
  return (
    <>
      <Helmet>
        <title>Booking Confirmation - Man and Van</title>
        <meta name="description" content="Your van service booking has been confirmed. View your booking details." />
      </Helmet>
      
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Button 
              variant="outline" 
              className="mb-6" 
              onClick={() => navigate("/")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
            
            <Card>
              <CardHeader className="text-center border-b pb-6">
                {isLoading ? (
                  <Skeleton className="h-8 w-2/3 mx-auto mb-2" />
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
                  </>
                )}
              </CardHeader>
              
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : booking && vanListing ? (
                  <div className="space-y-6">
                    <div className="text-center text-slate-600 mb-6">
                      <p className="mb-2">
                        Your booking with <span className="font-semibold">{vanListing.title}</span> has been confirmed.
                      </p>
                      <p>
                        Booking reference: <span className="font-mono font-semibold">{booking.id}</span>
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-md">
                      <h3 className="font-semibold mb-3">Booking Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Date & Time</p>
                            <p className="text-slate-600">
                              {new Date(booking.bookingDate).toLocaleDateString()}, {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Duration</p>
                            <p className="text-slate-600">
                              {booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Pickup Location</p>
                            <p className="text-slate-600">{booking.fromLocation}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Destination</p>
                            <p className="text-slate-600">{booking.toLocation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-md">
                      <h3 className="font-semibold mb-3">Payment Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Rate per hour</span>
                          <span>£{vanListing.hourlyRate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Duration</span>
                          <span>{booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}</span>
                        </div>
                        <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>£{booking.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button className="w-full" asChild>
                        <a href="/profile?tab=bookings">View All Bookings</a>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`/van-listing/${vanListing.id}`}>View Service Details</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">
                      Booking information not found. Please check your bookings in your profile.
                    </p>
                    <Button className="mt-2" asChild>
                      <a href="/profile?tab=bookings">Go to My Bookings</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingConfirmation;

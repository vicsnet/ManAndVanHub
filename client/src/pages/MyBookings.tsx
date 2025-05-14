import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Booking } from "@shared/schema";

// Define a type for booking with van listing details
interface BookingWithDetails extends Booking {
  vanListing: {
    id: number;
    title: string;
    vanSize: string;
    hourlyRate: number;
    user: {
      fullName: string;
    };
  };
}

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your bookings",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch user's bookings
  const { data: bookings, isLoading, error } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/my-bookings"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please login to view your bookings</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-red-500">Error loading bookings. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <Button asChild>
            <Link href="/search">Find Van Services</Link>
          </Button>
        </div>
        
        <Separator />
        
        {bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.vanListing.title}</CardTitle>
                      <CardDescription>
                        {booking.vanListing.vanSize} van • by {booking.vanListing.user.fullName}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date & Time</p>
                      <p className="font-medium">
                        {format(new Date(booking.bookingDate), "MMMM d, yyyy")} • {booking.duration} hour{booking.duration > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Locations</p>
                      <p className="font-medium">
                        From: {booking.fromLocation}<br />
                        To: {booking.toLocation}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-slate-500 mb-1">Price</p>
                    <p className="font-medium">
                      £{booking.totalPrice} (£{booking.vanListing.hourlyRate}/hour × {booking.duration} hours)
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4">
                  <Button variant="outline" asChild>
                    <Link href={`/van-listing/${booking.vanListingId}`}>View Listing</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No bookings yet</h3>
            <p className="text-slate-500 mb-6">
              Browse available services and make your first booking
            </p>
            <Button asChild>
              <Link href="/search">Find Van Services</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
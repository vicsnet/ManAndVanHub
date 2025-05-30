import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import {
  Button,
  buttonVariants
} from "@/components/ui/button";
import { ChatButton } from "@/components/chat";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Booking } from "@shared/schema";
import { CheckCircle, XCircle, Clock, Calendar, MapPin, User } from "lucide-react";

// Define a type for booking with van listing details
interface BookingWithListing extends Booking {
  vanListing: {
    id: number;
    title: string;
    vanSize: string;
    hourlyRate: number;
  };
  user?: {
    fullName: string;
    email: string;
  };
}

const ManageBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithListing | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to manage bookings",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch bookings for vans owned by the user
  const { data: bookings, isLoading, error } = useQuery<BookingWithListing[]>({
    queryKey: ["/api/my-van-bookings"],
    enabled: !!user,
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string | number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both booking queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/my-van-bookings"] });
      toast({
        title: "Status updated",
        description: `Booking status has been updated to ${newStatus}`,
      });
      setStatusDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update booking status",
      });
    },
  });

  // Filter bookings by status
  const getFilteredBookings = () => {
    if (!bookings) return [];
    if (selectedTab === "all") return bookings;
    return bookings.filter(booking => booking.status === selectedTab);
  };

  // Open confirmation dialog to update booking status
  const confirmStatusChange = (booking: BookingWithListing, status: string) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  // Update booking status
  const updateStatus = () => {
    if (selectedBooking && newStatus) {
      const bookingId = (selectedBooking as any)._id || selectedBooking.id;
      updateStatusMutation.mutate({ id: bookingId, status: newStatus });
    }
  };

  // Get status badge
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please login to manage your bookings</p>
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
          <h1 className="text-2xl font-bold">Manage Bookings</h1>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Manage Bookings</h1>
          <p className="text-red-500">Error loading bookings. Please try again later.</p>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  
  return (
    <>
      <Helmet>
        <title>Manage Bookings - Man and Van</title>
        <meta name="description" content="Manage and respond to booking requests for your van services." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manage Bookings</h1>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/my-listings">My Listings</Link>
              </Button>
              <Button asChild>
                <Link href="/create-listing">Add New Listing</Link>
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <Tabs defaultValue="pending" onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab}>
              {filteredBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{booking.vanListing.title}</CardTitle>
                            <CardDescription>
                              {booking.vanListing.vanSize} van • Booking #{booking.id}
                            </CardDescription>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <User className="h-5 w-5 text-primary mr-3 mt-0.5" />
                              <div>
                                <p className="text-sm text-slate-500 mb-1">Customer</p>
                                <p className="font-medium">
                                  {booking.user?.fullName || `Customer #${booking.userId}`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5" />
                              <div>
                                <p className="text-sm text-slate-500 mb-1">Date & Time</p>
                                <p className="font-medium">
                                  {(() => {
                                    try {
                                      const date = new Date(booking.bookingDate);
                                      return isNaN(date.getTime()) ? "Invalid date" : format(date, "MMMM d, yyyy");
                                    } catch {
                                      return "Invalid date";
                                    }
                                  })()} • {booking.duration} hour{booking.duration > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                              <div>
                                <p className="text-sm text-slate-500 mb-1">Locations</p>
                                <p className="font-medium">
                                  From: {booking.fromLocation}<br />
                                  To: {booking.toLocation}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                              <div>
                                <p className="text-sm text-slate-500 mb-1">Price</p>
                                <p className="font-medium">
                                  £{booking.totalPrice} (£{booking.vanListing.hourlyRate}/hour × {booking.duration} hours)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-end gap-2 border-t pt-4">
                        {booking.status === "pending" && (
                          <>
                            <Button 
                              variant="outline" 
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => confirmStatusChange(booking, "cancelled")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Decline
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={() => confirmStatusChange(booking, "confirmed")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                          </>
                        )}
                        
                        {booking.status === "confirmed" && (
                          <Button 
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => confirmStatusChange(booking, "completed")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </Button>
                        )}
                        
                        <ChatButton 
                          bookingId={booking.id} 
                          variant="outline"
                          label={booking.status === "cancelled" ? "View Messages" : "Messages"}
                        />
                        <Button variant="outline" asChild>
                          <Link href={`/van-listing/${booking.vanListingId}`}>View Listing</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No {selectedTab === "all" ? "" : selectedTab} bookings found</h3>
                  <p className="text-slate-500 mb-6">
                    {selectedTab === "pending" 
                      ? "You don't have any pending booking requests at the moment."
                      : `You don't have any ${selectedTab === "all" ? "" : selectedTab} bookings.`}
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href="/my-listings" className={buttonVariants({ variant: "outline" })}>
                      View My Listings
                    </Link>
                    <Link href="/" className={buttonVariants()}>
                      Go to Home
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Confirm status change dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus === "confirmed" ? "Accept Booking Request" : 
               newStatus === "cancelled" ? "Decline Booking Request" : 
               "Update Booking Status"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "confirmed" ? 
                "Are you sure you want to accept this booking? The customer will be notified about the confirmation." :
               newStatus === "cancelled" ? 
                "Are you sure you want to decline this booking? This action cannot be undone." :
               newStatus === "completed" ?
                "Mark this booking as completed? This will indicate that the service has been successfully delivered." :
                "Are you sure you want to update the status of this booking?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={updateStatus} 
              className={
                newStatus === "confirmed" ? "bg-green-600 hover:bg-green-700" :
                newStatus === "cancelled" ? "bg-red-600 hover:bg-red-700" :
                newStatus === "completed" ? "bg-blue-600 hover:bg-blue-700" :
                ""
              }
            >
              {newStatus === "confirmed" ? "Accept" : 
               newStatus === "cancelled" ? "Decline" : 
               newStatus === "completed" ? "Complete" :
               "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageBookings;
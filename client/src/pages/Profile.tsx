import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking, VanListingWithServices } from "@/lib/types";
import ListingCard from "@/components/listings/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Truck, Calendar, Star, Settings } from "lucide-react";

const Profile = () => {
  const { user, isLoading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("account");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login?redirect=/profile");
    }
  }, [user, isLoading, navigate]);
  
  // Fetch user's van listings if they're a van owner
  const { 
    data: userListings, 
    isLoading: isLoadingListings 
  } = useQuery<VanListingWithServices[]>({
    queryKey: ["/api/my-listings"],
    enabled: !!user?.isVanOwner,
  });
  
  // Fetch user's bookings
  const { 
    data: userBookings, 
    isLoading: isLoadingBookings 
  } = useQuery<Booking[]>({
    queryKey: ["/api/my-bookings"],
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <>
      <Helmet>
        <title>Your Profile - Man and Van</title>
        <meta name="description" content="Manage your account, bookings, and listings." />
      </Helmet>
      
      <div className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-secondary mb-2">Your Profile</h1>
                <p className="text-slate-600">
                  Manage your account details, bookings, and {user.isVanOwner ? "van listings" : "preferences"}
                </p>
              </div>
              <Button variant="outline" onClick={() => logout()}>
                Log Out
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="account" className="flex gap-2 items-center">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </TabsTrigger>
                
                <TabsTrigger value="bookings" className="flex gap-2 items-center">
                  <Calendar className="h-4 w-4" />
                  <span>Bookings</span>
                </TabsTrigger>
                
                {user.isVanOwner && (
                  <TabsTrigger value="listings" className="flex gap-2 items-center">
                    <Truck className="h-4 w-4" />
                    <span>My Listings</span>
                  </TabsTrigger>
                )}
                
                <TabsTrigger value="settings" className="flex gap-2 items-center">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Account Tab */}
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p className="text-lg">{user.fullName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="text-lg">{user.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                          <p className="text-lg">{user.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                          <p className="text-lg">{user.isVanOwner ? "Van Owner" : "Customer"}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex gap-4">
                        <Button variant="outline">Edit Profile</Button>
                        {!user.isVanOwner && (
                          <Button onClick={() => navigate("/create-listing")}>
                            Become a Van Owner
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBookings ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="p-4 border rounded-md">
                            <div className="flex justify-between mb-2">
                              <Skeleton className="h-6 w-48" />
                              <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ))}
                      </div>
                    ) : userBookings && userBookings.length > 0 ? (
                      <div className="space-y-4">
                        {userBookings.map((booking) => (
                          <div key={booking.id} className="p-4 border rounded-md">
                            <div className="flex justify-between mb-2">
                              <h3 className="font-semibold">
                                Booking #{booking.id}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>From:</strong> {booking.fromLocation}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>To:</strong> {booking.toLocation}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Duration:</strong> {booking.duration} hour(s)
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Total:</strong> £{booking.totalPrice.toFixed(2)}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <a href={`/van-listing/${booking.vanListingId}`}>
                                  View Service
                                </a>
                              </Button>
                              {booking.status === 'pending' && (
                                <Button size="sm" variant="destructive">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-slate-500 mb-4">You haven't made any bookings yet.</p>
                        <Button asChild>
                          <a href="/search">Find a Van Service</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Listings Tab (for van owners) */}
              {user.isVanOwner && (
                <TabsContent value="listings">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Your Van Listings</CardTitle>
                      <Button onClick={() => navigate("/create-listing")}>
                        Add New Listing
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isLoadingListings ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="border border-slate-200 rounded-lg overflow-hidden shadow-md">
                              <Skeleton className="w-full h-48" />
                              <div className="p-4">
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-36 mb-2" />
                                <Skeleton className="h-4 w-24 mb-4" />
                                <div className="flex gap-2 mb-4">
                                  <Skeleton className="h-6 w-20 rounded-full" />
                                  <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : userListings && userListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {userListings.map((listing) => (
                            <div key={listing.id} className="relative">
                              <ListingCard listing={listing} />
                              <div className="absolute top-2 right-2 space-x-2">
                                <Button size="sm" variant="outline" className="bg-white">
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-slate-500 mb-4">You haven't created any listings yet.</p>
                          <Button onClick={() => navigate("/create-listing")}>
                            Create Your First Listing
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-3">Password</h3>
                        <Button variant="outline">Change Password</Button>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Notifications</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <span>Email Notifications</span>
                            <Button variant="outline" size="sm">On</Button>
                          </div>
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <span>SMS Notifications</span>
                            <Button variant="outline" size="sm">Off</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Account Actions</h3>
                        <div className="space-y-2">
                          <Button variant="destructive">Delete Account</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

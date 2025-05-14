import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { VanListingWithServices } from "@shared/schema";

const MyListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your listings",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch user's van listings
  const { data: listings, isLoading, error } = useQuery<VanListingWithServices[]>({
    queryKey: ["/api/my-listings"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please login to view your listings</p>
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
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p>Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-red-500">Error loading listings. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <Button asChild>
            <Link href="/create-listing">Create New Listing</Link>
          </Button>
        </div>
        
        <Separator />
        
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{listing.title}</CardTitle>
                  <CardDescription>
                    {listing.location} • {listing.vanSize} van
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Rate</p>
                      <p className="font-medium">£{listing.hourlyRate}/hour</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Services</p>
                      <div className="flex flex-wrap gap-1">
                        {listing.services.map((service) => (
                          <span
                            key={service.id}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {service.serviceName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{listing.averageRating || "No ratings yet"}</span>
                    <span className="mx-1">•</span>
                    <span>{listing.reviewCount || 0} reviews</span>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/van-listing/${listing.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No listings yet</h3>
            <p className="text-slate-500 mb-6">
              Create your first listing to start offering your van services
            </p>
            <Button asChild>
              <Link href="/create-listing">Create a Listing</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VanListingWithDetails } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import BookingForm from "@/components/forms/BookingForm";
import ReviewForm from "@/components/listings/ReviewForm";
import AvatarWithInitials from "@/components/ui/avatar-with-initials";
import { useAuth } from "@/lib/auth";

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const { data: listing, isLoading, error } = useQuery<VanListingWithDetails>({
    queryKey: [`/api/van-listings/${id}`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-96 w-full rounded-lg mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-10 w-2/3 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <Skeleton className="h-40 w-full mb-6" />
            </div>
            <div>
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Listing</h2>
          <p>Sorry, we couldn't load the details for this listing. Please try again later.</p>
          <Button className="mt-4" variant="outline" asChild>
            <a href="/search">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <a href="/search">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </a>
          </Button>
          <div className="relative rounded-lg overflow-hidden">
            {listing.imageData ? (
              <img
                src={listing.imageData}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚐</div>
                  <p className="text-gray-500">No image available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-secondary mb-2">{listing.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center">
                <Star className="text-accent mr-1 h-4 w-4 fill-accent" />
                <span className="font-medium">
                  {listing.averageRating ? listing.averageRating.toFixed(1) : "New"}
                </span>
                {listing.reviewCount && listing.reviewCount > 0 ? (
                  <span className="text-gray-500 text-sm ml-1">
                    ({listing.reviewCount} {listing.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                ) : null}
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{listing.location}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="mr-1 h-4 w-4" />
                <span>£{listing.hourlyRate}/hour</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="mr-1 h-4 w-4" />
                <span>{listing.helpersCount} {listing.helpersCount === 1 ? "helper" : "helpers"}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="bg-blue-100 text-primary border-none">
                {listing.vanSize.charAt(0).toUpperCase() + listing.vanSize.slice(1)} Van
              </Badge>
              
              {listing.services.map((service, index) => (
                <Badge key={index} variant="outline" className="bg-blue-100 text-primary border-none">
                  {service.serviceName}
                </Badge>
              ))}
            </div>
            
            <Tabs defaultValue="description" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="text-slate-600">
                <Card>
                  <CardContent className="pt-6">
                    <p>{listing.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="pt-6">
                    {listing.reviews && listing.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {listing.reviews.map((review, index) => (
                          <div key={index}>
                            <div className="flex items-start mb-2">
                              <AvatarWithInitials 
                                initials={review.user.fullName.split(' ').map(n => n[0]).join('')}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">{review.user.fullName}</div>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < review.rating ? 'text-accent fill-accent' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                  <span className="ml-2 text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-slate-600 ml-12">{review.comment}</p>
                            {index < listing.reviews.length - 1 && <Separator className="my-4" />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-center py-4">No reviews yet</p>
                    )}
                    
                    {user && user.id !== listing.userId && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4">Leave a Review</h3>
                        <ReviewForm vanListingId={listing.id} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Book this service</h3>
                <BookingForm 
                  vanListing={listing} 
                  open={bookingModalOpen} 
                  setOpen={setBookingModalOpen} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;

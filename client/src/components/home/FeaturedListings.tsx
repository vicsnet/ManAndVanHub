import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { VanListingWithServices } from "@/lib/types";
import ListingCard from "../listings/ListingCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedListings = () => {
  const { data: listings, isLoading } = useQuery<VanListingWithServices[]>({
    queryKey: ["/api/van-listings"],
  });

  // Get only first 3 listings to display as featured
  const featuredListings = listings?.slice(0, 3) || [];

  return (
    <section className="py-12 md:py-16 bg-white" id="featured-listings">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary">
            Featured Van Services
          </h2>
          <Link href="/search" className="text-primary hover:text-blue-700 font-medium flex items-center">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-slate-200 rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-4 w-36 mb-3" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.length > 0 ? (
              featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500 mb-4">No van listings available yet.</p>
                <Button asChild>
                  <Link href="/create-listing">List Your Van</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedListings;

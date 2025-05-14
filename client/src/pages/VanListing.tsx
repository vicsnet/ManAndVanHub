import { useEffect } from "react";
import { useParams } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import ListingDetails from "@/components/listings/ListingDetails";
import { VanListingWithDetails } from "@/lib/types";

const VanListing = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: listing, isLoading, error } = useQuery<VanListingWithDetails>({
    queryKey: [`/api/van-listings/${id}`],
  });
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>
          {isLoading 
            ? "Loading Van Service..." 
            : error 
              ? "Service Not Found" 
              : `${listing?.title} - Man and Van`}
        </title>
        <meta 
          name="description" 
          content={listing?.description || "View details about this van service, including rates, reviews, and booking options."}
        />
      </Helmet>
      
      <div className="bg-slate-50 py-6">
        <ListingDetails />
      </div>
    </>
  );
};

export default VanListing;

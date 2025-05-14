import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SlidersHorizontal, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import ListingCard from "@/components/listings/ListingCard";
import SearchForm from "@/components/listings/SearchForm";
import FilterOptions, { FilterState } from "@/components/listings/FilterOptions";
import { VanListingWithServices } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Search = () => {
  const [, params] = useLocation();
  const searchParams = new URLSearchParams(params);
  
  const location = searchParams.get("location") || "";
  const date = searchParams.get("date") || "";
  const vanSize = searchParams.get("vanSize") || "";
  
  const [filters, setFilters] = useState<FilterState>({
    vanSizes: vanSize && vanSize !== "any" ? [vanSize] : [],
    serviceTypes: [],
    minHelpers: 0,
    maxPrice: 50,
    availableToday: false,
  });
  
  // Query van listings
  const { data: listings, isLoading } = useQuery<VanListingWithServices[]>({
    queryKey: location ? [`/api/van-listings/search`, location, date, vanSize] : ["/api/van-listings"],
    queryFn: async ({ queryKey }) => {
      const endpoint = location 
        ? `/api/van-listings/search?location=${encodeURIComponent(location)}${date ? `&date=${date}` : ''}${vanSize && vanSize !== "any" ? `&vanSize=${vanSize}` : ''}`
        : "/api/van-listings";
      
      const response = await fetch(endpoint, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      
      return await response.json();
    },
  });
  
  // Apply filters
  const filteredListings = listings?.filter((listing) => {
    // Filter by van size if selected
    if (filters.vanSizes.length > 0 && !filters.vanSizes.includes(listing.vanSize)) {
      return false;
    }
    
    // Filter by service type if selected
    if (filters.serviceTypes.length > 0) {
      const listingServiceNames = listing.services.map(s => s.serviceName);
      if (!filters.serviceTypes.some(type => listingServiceNames.includes(type))) {
        return false;
      }
    }
    
    // Filter by price
    if (listing.hourlyRate > filters.maxPrice) {
      return false;
    }
    
    // Filter by helpers count
    if (listing.helpersCount < filters.minHelpers) {
      return false;
    }
    
    // Filter by availability today
    if (filters.availableToday && !listing.isAvailableToday) {
      return false;
    }
    
    return true;
  });
  
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  
  return (
    <>
      <Helmet>
        <title>Search for Van Services - Man and Van</title>
        <meta 
          name="description" 
          content="Search for reliable van and driver services in your area for moving, deliveries, and transportation."
        />
      </Helmet>
      
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-secondary mb-2">
              {location ? `Van Services in ${location}` : "Find Van Services"}
            </h1>
            <p className="text-slate-600">
              {filteredListings?.length || 0} {(filteredListings?.length === 1) ? 'service' : 'services'} available
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters - Desktop */}
            <div className="hidden lg:block space-y-6">
              <SearchForm 
                initialLocation={location} 
                initialDate={date} 
                initialVanSize={vanSize} 
              />
              
              <FilterOptions onFilterChange={handleFilterChange} />
            </div>
            
            {/* Mobile Filters */}
            <div className="lg:hidden flex flex-wrap gap-4 mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <SearchIcon className="h-4 w-4" />
                    Search
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="py-4">
                    <h3 className="text-lg font-semibold mb-4">Search</h3>
                    <SearchForm 
                      initialLocation={location} 
                      initialDate={date} 
                      initialVanSize={vanSize} 
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="py-4">
                    <h3 className="text-lg font-semibold mb-4">Filters</h3>
                    <FilterOptions onFilterChange={handleFilterChange} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Listings */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
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
                        </div>
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-9 w-24 rounded-md" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredListings && filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                  <h2 className="text-2xl font-semibold mb-2">No van services found</h2>
                  <p className="text-slate-600 mb-6">
                    {location 
                      ? `We couldn't find any van services in ${location}. Try broadening your search.`
                      : "Try searching with different criteria or browse all available services."}
                  </p>
                  <Button asChild>
                    <a href="/">Return to Home</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;

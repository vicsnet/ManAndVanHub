import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VanListingWithServices } from "@/lib/types";

interface ListingCardProps {
  listing: VanListingWithServices;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow duration-300">
      <Link href={`/van-listing/${listing.id}`}>
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-48 object-cover cursor-pointer"
        />
      </Link>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/van-listing/${listing.id}`}>
            <h3 className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </Link>
          <div className="flex items-center">
            <span className="text-accent font-bold">£{listing.hourlyRate}</span>
            <span className="text-gray-500 text-sm">/hour</span>
          </div>
        </div>

        <div className="flex items-center mb-3">
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

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="mr-2 h-4 w-4" />
          <span>{listing.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-blue-100 text-primary border-none">
            {listing.vanSize.charAt(0).toUpperCase() + listing.vanSize.slice(1)} Van
          </Badge>
          
          {listing.services.slice(0, 2).map((service, index) => (
            <Badge key={index} variant="outline" className="bg-blue-100 text-primary border-none">
              {service.serviceName}
            </Badge>
          ))}
          
          {listing.helpersCount > 0 && (
            <Badge variant="outline" className="bg-blue-100 text-primary border-none">
              {listing.helpersCount} {listing.helpersCount === 1 ? "Helper" : "Helpers"}
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {listing.isAvailableToday ? "Available today" : "Available from tomorrow"}
          </span>
          <Button asChild size="sm">
            <Link href={`/van-listing/${listing.id}`}>Book Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;

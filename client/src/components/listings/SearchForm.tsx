import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, MapPinIcon, SearchIcon, TruckIcon } from "lucide-react";

interface SearchFormProps {
  initialLocation?: string;
  initialDate?: string;
  initialVanSize?: string;
  className?: string;
}

const SearchForm = ({
  initialLocation = "",
  initialDate = "",
  initialVanSize = "",
  className = "",
}: SearchFormProps) => {
  const [, navigate] = useLocation();
  const [location, setLocation] = useState(initialLocation);
  const [date, setDate] = useState(initialDate);
  const [vanSize, setVanSize] = useState(initialVanSize);

  // Update state when props change
  useEffect(() => {
    setLocation(initialLocation);
    setDate(initialDate);
    setVanSize(initialVanSize);
  }, [initialLocation, initialDate, initialVanSize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (location) queryParams.append("location", location);
    if (date) queryParams.append("date", date);
    if (vanSize) queryParams.append("vanSize", vanSize);
    
    navigate(`/search?${queryParams.toString()}`);
  };

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter postcode or area"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vanSize" className="block text-sm font-medium text-gray-700 mb-1">
                Van Size
              </label>
              <div className="relative">
                <TruckIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select value={vanSize} onValueChange={setVanSize}>
                  <SelectTrigger className="pl-10" id="vanSize">
                    <SelectValue placeholder="Any size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any size</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              Search
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;

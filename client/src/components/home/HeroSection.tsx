import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, MapPinIcon, CalendarIcon, TruckIcon } from "lucide-react";

const HeroSection = () => {
  const [, navigate] = useLocation();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [vanSize, setVanSize] = useState("");

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
    <section
      className="relative bg-cover bg-center py-16 md:py-24"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1486006920555-c77dcf18193c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')",
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Find Reliable Van & Driver Services Near You
        </h1>
        <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
          Connect with trusted local drivers for moving, delivery, and transport services at
          competitive rates.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
          <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSubmit}>
            <div className="flex-1">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 text-left mb-1">
                Location
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your postcode"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 text-left mb-1">
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

            <div className="flex-1">
              <label htmlFor="vanSize" className="block text-sm font-medium text-gray-700 text-left mb-1">
                Van Size
              </label>
              <div className="relative">
                <TruckIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select value={vanSize} onValueChange={setVanSize}>
                  <SelectTrigger className="pl-10">
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

            <div className="mt-6 md:mt-0 md:self-end">
              <Button type="submit" className="w-full" size="lg">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface FilterOptionsProps {
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  vanSizes: string[];
  serviceTypes: string[];
  minHelpers: number;
  maxPrice: number;
  availableToday: boolean;
}

const FilterOptions = ({ onFilterChange, className = "" }: FilterOptionsProps) => {
  const [filters, setFilters] = useState<FilterState>({
    vanSizes: [],
    serviceTypes: [],
    minHelpers: 0,
    maxPrice: 50,
    availableToday: false,
  });

  const handleVanSizeChange = (size: string) => {
    const updatedSizes = filters.vanSizes.includes(size)
      ? filters.vanSizes.filter((s) => s !== size)
      : [...filters.vanSizes, size];
    
    const updatedFilters = { ...filters, vanSizes: updatedSizes };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleServiceTypeChange = (type: string) => {
    const updatedTypes = filters.serviceTypes.includes(type)
      ? filters.serviceTypes.filter((t) => t !== type)
      : [...filters.serviceTypes, type];
    
    const updatedFilters = { ...filters, serviceTypes: updatedTypes };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleMaxPriceChange = (value: number[]) => {
    const updatedFilters = { ...filters, maxPrice: value[0] };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleAvailableTodayChange = (checked: boolean) => {
    const updatedFilters = { ...filters, availableToday: checked };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleHelpersChange = (value: number[]) => {
    const updatedFilters = { ...filters, minHelpers: value[0] };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Van Size</h3>
            <div className="space-y-2">
              {["small", "medium", "large", "xl"].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={filters.vanSizes.includes(size)}
                    onCheckedChange={() => handleVanSizeChange(size)}
                  />
                  <Label htmlFor={`size-${size}`} className="capitalize">
                    {size === "xl" ? "Extra Large" : size}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">Service Type</h3>
            <div className="space-y-2">
              {["Furniture", "House Moves", "Office Moves", "Single Item"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.serviceTypes.includes(type)}
                    onCheckedChange={() => handleServiceTypeChange(type)}
                  />
                  <Label htmlFor={`type-${type}`}>{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Maximum Hourly Rate</h3>
              <span className="text-sm font-medium">£{filters.maxPrice}</span>
            </div>
            <Slider
              defaultValue={[50]}
              max={100}
              step={5}
              value={[filters.maxPrice]}
              onValueChange={handleMaxPriceChange}
            />
          </div>

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Minimum Helpers</h3>
              <span className="text-sm font-medium">{filters.minHelpers}</span>
            </div>
            <Slider
              defaultValue={[0]}
              max={5}
              step={1}
              value={[filters.minHelpers]}
              onValueChange={handleHelpersChange}
            />
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="available-today"
              checked={filters.availableToday}
              onCheckedChange={(checked) => 
                handleAvailableTodayChange(checked as boolean)
              }
            />
            <Label htmlFor="available-today">Available Today</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterOptions;

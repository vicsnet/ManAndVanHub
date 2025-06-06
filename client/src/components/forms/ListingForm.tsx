import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { insertVanListingSchema } from "@shared/schema";

// Extend the schema with additional validation and form-specific fields
const listingFormSchema = insertVanListingSchema.extend({
  services: z.array(z.string()).min(1, "Please select at least one service"),
  imageData: z.string().optional(),
}).omit({ userId: true });

type ListingFormValues = z.infer<typeof listingFormSchema>;

const serviceLabelMap: Record<string, string> = {
  'Furniture': 'Furniture Delivery',
  'House Moves': 'House & Flat Moves',
  'Office Moves': 'Office Relocations', 
  'Single Item': 'Single Item Transport'
};

const ListingForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Function to convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle image file selection
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image under 5MB",
      });
      return;
    }

    try {
      const base64String = await convertImageToBase64(file);
      form.setValue('imageData', base64String);
      setImagePreview(base64String);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error processing image",
        description: "Failed to process the selected image",
      });
    }
  };
  
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      vanSize: "medium",
      hourlyRate: 25,
      location: "",
      postcode: "",
      imageData: "",
      helpersCount: 1,
      isAvailableToday: true,
      services: [],
    },
  });
  
  const createListingMutation = useMutation({
    mutationFn: async (data: ListingFormValues & { userId: number }) => {
      const { services, ...listingData } = data;
      return await apiRequest("/api/van-listings", {
        method: "POST",
        body: JSON.stringify({
          ...listingData,
          services: services
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Van listing created",
        description: "Your van service has been successfully listed.",
      });
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/van-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-listings"] });
      
      // Navigate to profile page
      navigate("/profile?tab=listings");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create listing",
        description: error.message || "Please try again later",
      });
      setIsSubmitting(false);
    },
  });
  
  const onSubmit = (data: ListingFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to create a listing",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Add the user ID to the data
    const listingData = {
      ...data,
      userId: user.id,
    };
    
    createListingMutation.mutate(listingData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dave's Reliable Transport" {...field} />
                </FormControl>
                <FormDescription>
                  A catchy title that describes your service
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your service, experience, and what you offer..." 
                    className="min-h-32"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide details about your service, your experience, and what makes you stand out
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. North London, N1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your general service area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. N1 9AB" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your primary postcode for search results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Van Details</h2>
          
          <FormField
            control={form.control}
            name="vanSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Van Size</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="small" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Small Van (e.g. Ford Transit Connect)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="medium" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Medium Van (e.g. Volkswagen Transporter)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="large" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Large Van (e.g. Ford Transit, Mercedes Sprinter)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="xl" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Extra Large Van (e.g. Luton van with tail lift)
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="helpersCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Helpers</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={5} 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))} 
                  />
                </FormControl>
                <FormDescription>
                  Including yourself, how many people will help with loading/unloading
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Van Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Van preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            form.setValue('imageData', '');
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Upload an image to showcase your van (Max 5MB, optional but recommended)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Service Details</h2>
          
          <FormField
            control={form.control}
            name="services"
            render={() => (
              <FormItem>
                <FormLabel>Services Offered</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(serviceLabelMap).map(([value, label]) => (
                    <FormField
                      key={value}
                      control={form.control}
                      name="services"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={value}
                            className="flex items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, value])
                                    : field.onChange(
                                        field.value?.filter(
                                          (val) => val !== value
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate (£)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={10} 
                    step={0.5}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormDescription>
                  Your hourly rate in GBP (minimum £10)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isAvailableToday"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Available Today</FormLabel>
                  <FormDescription>
                    Check this if you're available for bookings today
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating listing..." : "Create Listing"}
        </Button>
      </form>
    </Form>
  );
};

export default ListingForm;

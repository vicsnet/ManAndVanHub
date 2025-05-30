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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { VanListingWithDetails, BookingFormData } from "@/lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, CheckCircle } from "lucide-react";
import { format, addHours } from "date-fns";

interface BookingFormProps {
  vanListing: VanListingWithDetails;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const bookingFormSchema = z.object({
  bookingDate: z.date({
    required_error: "Please select a date and time for your booking",
  }),
  duration: z.number().min(1, "Duration must be at least 1 hour").max(12, "Duration cannot exceed 12 hours"),
  fromLocation: z.string().min(5, "Please enter a valid pickup location"),
  toLocation: z.string().min(5, "Please enter a valid destination"),
});

const BookingForm = ({ vanListing, open = false, setOpen }: BookingFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingFormData | null>(null);
  
  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      bookingDate: new Date(),
      duration: 2,
      fromLocation: "",
      toLocation: "",
    },
  });
  
  const calculateTotalPrice = (duration: number) => {
    return duration * vanListing.hourlyRate;
  };
  
  // Watch the duration field to update the total price
  const duration = form.watch("duration");
  const totalPrice = calculateTotalPrice(duration);
  
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      return await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Appointment booked",
        description: "Your appointment has been successfully scheduled. The van owner will contact you shortly to confirm details."
      });
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
      
      // Navigate to booking confirmation page
      const bookingId = (data as any)._id || data.id;
      navigate(`/booking-confirmation/${bookingId}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.message || "Please try again later",
      });
      setIsConfirmationOpen(false);
    },
  });
  
  const onSubmit = (data: z.infer<typeof bookingFormSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to make a booking",
      });
      navigate(`/login?redirect=/van-listing/${vanListing.id}`);
      return;
    }
    
    const bookingData: BookingFormData = {
      vanListingId: (vanListing as any)._id || vanListing.id,
      bookingDate: data.bookingDate,
      duration: data.duration,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      totalPrice: totalPrice,
    };
    
    setBookingDetails(bookingData);
    setIsConfirmationOpen(true);
  };
  
  const confirmBooking = () => {
    if (bookingDetails) {
      createBookingMutation.mutate(bookingDetails);
    }
  };
  
  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600 mb-2">
          Please log in to book this service.
        </p>
        <Button className="w-full" asChild>
          <a href={`/login?redirect=/van-listing/${vanListing.id}`}>Log In</a>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <a href={`/register?redirect=/van-listing/${vanListing.id}`}>Sign Up</a>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md mb-3">
            <span className="text-slate-600">Hourly Rate</span>
            <span className="font-semibold">£{vanListing.hourlyRate.toFixed(2)}</span>
          </div>
          
          <FormField
            control={form.control}
            name="bookingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Booking Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP HH:mm")
                          ) : (
                            <span>Select date and time</span>
                          )}
                        </div>
                        <div></div>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          // Set the current time to the selected date
                          const now = new Date();
                          date.setHours(now.getHours());
                          date.setMinutes(now.getMinutes());
                          field.onChange(date);
                        }
                      }}
                      disabled={(date) => {
                        // Disable dates in the past
                        return date < new Date();
                      }}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <label className="text-sm font-medium mb-2 block">Time</label>
                      <Input
                        type="time"
                        value={format(field.value, "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(hours));
                          newDate.setMinutes(parseInt(minutes));
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (hours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fromLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="toLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <div className="flex justify-between items-center font-semibold text-lg mb-4">
              <span>Estimated Cost:</span>
              <span>£{totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              This is an estimated cost. Payment will be collected directly by the van owner after the service is completed.
            </p>
            
            <Button type="submit" className="w-full">
              Schedule Appointment
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Booking Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Appointment</DialogTitle>
            <DialogDescription>
              Please check the details of your appointment before scheduling. The van owner will contact you to confirm these details.
            </DialogDescription>
          </DialogHeader>
          
          {bookingDetails && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-slate-600">
                      {format(bookingDetails.bookingDate, "PPP")} at {format(bookingDetails.bookingDate, "HH:mm")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-slate-600">
                      {bookingDetails.duration} {bookingDetails.duration === 1 ? 'hour' : 'hours'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Pickup</p>
                    <p className="text-slate-600">{bookingDetails.fromLocation}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Destination</p>
                    <p className="text-slate-600">{bookingDetails.toLocation}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-semibold">
                  <span>Estimated Cost:</span>
                  <span>£{bookingDetails.totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Payment will be collected directly by the van owner after the service.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setIsConfirmationOpen(false)}>
                  Back
                </Button>
                <Button 
                  onClick={confirmBooking}
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingForm;

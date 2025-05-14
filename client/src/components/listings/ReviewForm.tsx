import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { StarIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface ReviewFormProps {
  vanListingId: number;
}

const reviewSchema = z.object({
  vanListingId: z.number(),
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const ReviewForm = ({ vanListingId }: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      vanListingId,
      rating: 0,
      comment: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const response = await apiRequest("POST", "/api/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      form.reset({
        vanListingId,
        rating: 0,
        comment: "",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/van-listings/${vanListingId}`] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: error.message || "Please try again later",
      });
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to submit a review",
      });
      return;
    }
    
    createReviewMutation.mutate(data);
  };

  const handleStarHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleStarClick = (rating: number) => {
    form.setValue("rating", rating);
  };

  const renderStars = () => {
    const rating = form.watch("rating");
    
    return (
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-6 w-6 cursor-pointer ${
              (hoveredRating > 0 ? star <= hoveredRating : star <= rating)
                ? "text-accent fill-accent"
                : "text-gray-300"
            }`}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            onClick={() => handleStarClick(star)}
          />
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-md">
        <p>Please log in to leave a review</p>
        <Button variant="outline" className="mt-2" asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={() => (
            <FormItem>
              <FormControl>
                {renderStars()}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Share your experience with this service..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={createReviewMutation.isPending}
        >
          {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Form>
  );
};

export default ReviewForm;

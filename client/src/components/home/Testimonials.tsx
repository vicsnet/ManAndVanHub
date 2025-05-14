import AvatarWithInitials from "@/components/ui/avatar-with-initials";
import { StarIcon } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "John Davies",
      initials: "JD",
      rating: 5,
      text: "Fantastic service! Dave arrived on time, was incredibly helpful with my furniture move, and made the whole process stress-free. Would definitely use again.",
    },
    {
      name: "Sarah Parker",
      initials: "SP",
      rating: 4.5,
      text: "I needed to move my office equipment across London on short notice. Found James on Man & Van and he was excellent - professional, careful with my items, and reasonably priced.",
    },
    {
      name: "Michael Thompson",
      initials: "MT",
      rating: 5,
      text: "Used Man & Van for a full house move. The team was amazing - they worked efficiently, took great care with our belongings, and made what could have been a stressful day run smoothly.",
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`star-${i}`} className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg
          key="half-star"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4 text-yellow-400"
          fill="none"
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clipRule="evenodd"
            fill="url(#grad)"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      );
    }

    // Add empty stars to reach 5
    const emptyStarsCount = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStarsCount; i++) {
      stars.push(
        <StarIcon key={`empty-star-${i}`} className="text-gray-300 h-4 w-4" />
      );
    }

    return stars;
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary-foreground mb-4">What Our Customers Say</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Real experiences from people who have used Man & Van services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-slate-100">
              <div className="flex items-center mb-4">
                <AvatarWithInitials initials={testimonial.initials} className="mr-3" />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                </div>
              </div>
              <p className="text-slate-600">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqSection = () => {
  const faqs = [
    {
      question: "How does pricing work?",
      answer:
        "Van drivers set their own hourly rates which are clearly displayed on their profiles. Some may have minimum booking times (usually 2 hours). Additional charges may apply for extra services, long distances, or after-hours work. All pricing is transparent and agreed upon before booking.",
    },
    {
      question: "Are the drivers insured?",
      answer:
        "Yes, all drivers on our platform are required to have appropriate insurance coverage, including goods-in-transit insurance and public liability insurance. You can view insurance details on each driver's profile before booking.",
    },
    {
      question: "What if I need to cancel my booking?",
      answer:
        "Our cancellation policy allows free cancellation up to 24 hours before your scheduled booking time. Cancellations made less than 24 hours in advance may incur a fee of up to 50% of the booking total, depending on the driver's policy.",
    },
    {
      question: "How do I become a van driver on the platform?",
      answer:
        "To join as a driver, you'll need to register an account, provide information about your van (size, capacity), submit proof of insurance and relevant licenses, and complete our verification process. Once approved, you can create your profile, set your rates, and start accepting bookings.",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions about using Man & Van services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="bg-white rounded-lg shadow-sm">
                <AccordionTrigger className="text-lg font-semibold text-secondary-foreground p-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="p-5 pt-0 text-slate-600 border-t border-slate-100">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;

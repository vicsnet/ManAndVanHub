import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PoundSterling, CalendarIcon, MapPinIcon } from "lucide-react";

const ListYourVanCta = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    vanType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVanTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      vanType: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      navigate("/create-listing");
    } else {
      // Store form data in session storage
      sessionStorage.setItem("driverSignupData", JSON.stringify(formData));
      
      // Show toast and redirect to registration
      toast({
        title: "Let's create your account first",
        description: "We'll need you to register before listing your van.",
      });
      
      navigate("/register?fromDriver=true");
    }
  };

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-4">
              Own a van? Start earning with Man & Van
            </h2>
            <p className="text-white opacity-90 text-lg mb-6">
              Join our network of trusted drivers and connect with customers in your area looking for
              reliable van services.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                  <PoundSterling className="text-primary" />
                </div>
                <span className="text-white">Set your own rates</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                  <CalendarIcon className="text-primary" />
                </div>
                <span className="text-white">Choose your schedule</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                  <MapPinIcon className="text-primary" />
                </div>
                <span className="text-white">Work in your area</span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-blue-50"
              asChild
            >
              <Link href="/create-listing">List Your Van Service</Link>
            </Button>
          </div>

          <div className="md:w-2/5">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-secondary">
                Join our driver network
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="vanType" className="block text-sm font-medium text-gray-700 mb-1">
                    Van Type
                  </label>
                  <Select
                    value={formData.vanType}
                    onValueChange={handleVanTypeChange}
                  >
                    <SelectTrigger id="vanType">
                      <SelectValue placeholder="Select van type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small Van</SelectItem>
                      <SelectItem value="medium">Medium Van</SelectItem>
                      <SelectItem value="large">Large Van</SelectItem>
                      <SelectItem value="xl">Extra Large Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Get Started
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListYourVanCta;

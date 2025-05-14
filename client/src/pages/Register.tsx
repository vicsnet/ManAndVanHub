import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { InsertUser } from "@/lib/types";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  isVanOwner: z.boolean().default(false),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Register = () => {
  const { user, register: registerUser, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Get the redirect URL and fromDriver flag from query parameters
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const redirectUrl = searchParams.get("redirect") || "/";
  const fromDriver = searchParams.get("fromDriver") === "true";
  
  // Try to get driver form data from session storage
  const driverFormData = fromDriver 
    ? JSON.parse(sessionStorage.getItem("driverSignupData") || "{}") 
    : {};
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectUrl);
    }
  }, [user, navigate, redirectUrl]);
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: driverFormData.fullName || "",
      email: driverFormData.email || "",
      phone: driverFormData.phone || "",
      username: "",
      password: "",
      confirmPassword: "",
      isVanOwner: fromDriver || false,
      termsAccepted: false,
    },
  });
  
  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      setRegisterError(null);
      
      const userData: InsertUser = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || "",
        username: data.username,
        password: data.password,
        isVanOwner: data.isVanOwner,
      };
      
      await registerUser(userData);
      // The auth provider will handle navigation on success
      
      // Clear driver form data from session storage
      if (fromDriver) {
        sessionStorage.removeItem("driverSignupData");
      }
    } catch (error) {
      setRegisterError("Failed to create account. Please try again.");
    }
  };
  
  // If already authenticated, don't render the form
  if (user) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Sign Up - Man and Van</title>
        <meta name="description" content="Create a new account to book van services or list your van for hire." />
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="space-y-1 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
              <CardDescription className="text-slate-100">
                {fromDriver 
                  ? "Sign up to list your van and start earning" 
                  : "Enter your details to create a new account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your phone number" 
                            type="tel" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a username" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Create a password" 
                            type="password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Confirm your password" 
                            type="password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isVanOwner"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            I want to register as a van owner
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Check this box if you want to list your van for hire
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            I agree to the Terms of Service and Privacy Policy
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {registerError && (
                    <div className="text-sm text-red-500">{registerError}</div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <a 
                    href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Log in
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Register;

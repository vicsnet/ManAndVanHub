import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
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
import { Login as LoginType } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const Login = () => {
  const { user, login, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Get the redirect URL from query parameters if it exists
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const redirectUrl = searchParams.get("redirect") || "/";
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectUrl);
    }
  }, [user, navigate, redirectUrl]);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setLoginError(null);
      
      const loginData: LoginType = {
        email: data.email,
        password: data.password,
      };
      
      await login(loginData);
      // The auth provider will handle navigation on success
    } catch (error) {
      setLoginError("Failed to log in. Please check your credentials and try again.");
    }
  };
  
  // If already authenticated, don't render the form
  if (user) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Log In - Man and Van</title>
        <meta name="description" content="Log in to your Man and Van account to book services or manage your listings." />
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="space-y-1 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Log In</CardTitle>
              <CardDescription className="text-slate-100">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your password" 
                            type="password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  
                  {loginError && (
                    <div className="text-sm text-red-500">{loginError}</div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
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
                  Don't have an account?{" "}
                  <a 
                    href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
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

export default Login;

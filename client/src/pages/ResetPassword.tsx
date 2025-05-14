import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: "",
    },
  });

  useEffect(() => {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    
    if (urlToken) {
      setToken(urlToken);
      form.setValue("token", urlToken);
      
      // Verify token validity
      const verifyToken = async () => {
        try {
          await apiRequest("GET", `/api/verify-reset-token?token=${urlToken}`);
          setTokenValid(true);
        } catch (error) {
          setTokenValid(false);
          toast({
            title: "Invalid Token",
            description: "The password reset link is invalid or has expired.",
            variant: "destructive",
          });
        } finally {
          setTokenChecked(true);
        }
      };
      
      verifyToken();
    } else {
      setTokenValid(false);
      setTokenChecked(true);
    }
  }, [form, toast]);

  async function onSubmit(data: ResetPasswordForm) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/reset-password", data);
      
      setResetSuccess(true);
      toast({
        title: "Password Reset Successfully",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. Please try again or request a new reset link.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!tokenChecked) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="space-y-1 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4 flex justify-center">
            <div className="text-center">
              <p>Verifying reset token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <Helmet>
        <title>Reset Password | Man and Van</title>
        <meta name="description" content="Reset your password for the Man and Van application" />
      </Helmet>
      
      <Card className="w-full shadow-lg border-0">
        <CardHeader className="space-y-1 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-slate-100">
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          {!tokenValid ? (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertDescription>
                The password reset link is invalid or has expired. Please request a new password reset link.
              </AlertDescription>
            </Alert>
          ) : resetSuccess ? (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>
                Your password has been reset successfully. You will be redirected to the login page shortly.
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          autoComplete="new-password"
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
                          placeholder="••••••••"
                          type="password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <div className="text-sm text-center">
            <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
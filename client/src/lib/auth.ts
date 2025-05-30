import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Login, InsertUser } from "@/lib/types";

// Define the Auth context types
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: Login) => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
}

// Create a context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Query the current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/me"],
    // Using a custom query function to handle 401 responses
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: Login) => {
      const response = await apiRequest("POST", "/api/login", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/me"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      // Redirect to home page or previous requested page
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/register", data);
      return await response.json();
    },
    onSuccess: (data) => {
      // Handle the new response format: { message: "Registration successful", user: ... }
      const userData = data.user || data;
      queryClient.setQueryData(["/api/me"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Account created",
        description: "Your account has been successfully created. Please log in to continue.",
      });
      
      // Redirect to login page since auto-login is disabled
      navigate("/login");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Could not create your account.",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout", {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to home page
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "Could not log you out.",
      });
    },
  });

  // Provide the authentication functions and state
  const authValue: AuthContextType = {
    user: user || null,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };

  return React.createElement(AuthContext.Provider, { value: authValue }, children);
};

// Create a hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

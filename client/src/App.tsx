import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import VanListing from "@/pages/VanListing";
import CreateListing from "@/pages/CreateListing";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import BookingConfirmation from "@/pages/BookingConfirmation";
import MyListings from "@/pages/MyListings";
import MyBookings from "@/pages/MyBookings";
import ManageBookings from "@/pages/ManageBookings";
import TrackingMap from "@/pages/TrackingMap";
import AdminDashboard from "@/pages/AdminDashboard";
import TermsAndConditions from "@/pages/TermsAndConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { AuthProvider } from "@/lib/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/van-listing/:id" component={VanListing} />
      <Route path="/create-listing" component={CreateListing} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/booking-confirmation/:id" component={BookingConfirmation} />
      <Route path="/my-listings" component={MyListings} />
      <Route path="/my-bookings" component={MyBookings} />
      <Route path="/manage-bookings" component={ManageBookings} />
      <Route path="/tracking/:bookingId" component={TrackingMap} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/terms" component={TermsAndConditions} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="manandvan-theme">
        <AuthProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

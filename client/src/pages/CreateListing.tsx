import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import ListingForm from "@/components/forms/ListingForm";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CreateListing = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login?redirect=/create-listing");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <>
      <Helmet>
        <title>List Your Van Service - Man and Van</title>
        <meta 
          name="description" 
          content="Join our network of trusted drivers and start earning by listing your van service to customers in your area."
        />
      </Helmet>
      
      <div className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-secondary mb-6">List Your Van Service</h1>
            
            {user && user.isVanOwner ? (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <Alert variant="info" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Your are already registered as a van owner</AlertTitle>
                  <AlertDescription>
                    You can create a new listing or manage your existing listings from your profile.
                  </AlertDescription>
                </Alert>
                
                <ListingForm />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <Alert variant="info" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Register as a Van Owner</AlertTitle>
                    <AlertDescription>
                      We'll need to update your account before you can list your van service.
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={() => {
                    // Update user to be a van owner (this would be handled via API in a real application)
                    // For now, just reload the page
                    window.location.reload();
                  }} className="w-full">
                    Register as a Van Owner
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">What you'll need to provide:</h2>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600">
                    <li>Details about your van (size, capacity)</li>
                    <li>Your hourly rate and availability</li>
                    <li>The services you offer (furniture moving, house moves, etc.)</li>
                    <li>Your service area and location</li>
                    <li>A photo of your van (optional but recommended)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateListing;

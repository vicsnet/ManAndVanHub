import React from "react";
import { Helmet } from "react-helmet";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>Terms and Conditions | Man and Van</title>
        <meta name="description" content="Terms and conditions for using the Man and Van service platform." />
      </Helmet>
      
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardTitle className="text-2xl md:text-3xl">Terms and Conditions</CardTitle>
          <CardDescription className="text-slate-200">
            Please read these terms carefully before using our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[60vh] md:h-[70vh] pr-4">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">1. Introduction</h2>
                <p className="text-gray-700">
                  Welcome to Man and Van ("we," "our," or "us"). By accessing or using our platform, you agree to be bound by these Terms and Conditions. 
                  If you do not agree to these terms, please do not use our platform.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">2. Definitions</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li><strong>Platform:</strong> The Man and Van website, application, and services.</li>
                  <li><strong>User:</strong> Any individual who accesses or uses our Platform.</li>
                  <li><strong>Van Owner:</strong> A User who offers transportation services through our Platform.</li>
                  <li><strong>Customer:</strong> A User who books transportation services through our Platform.</li>
                  <li><strong>Service:</strong> The transportation services offered by Van Owners through our Platform.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">3. Account Registration</h2>
                <p className="text-gray-700">
                  To access certain features of our Platform, you may need to create an account. You agree to provide accurate, current, 
                  and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                <p className="text-gray-700 mt-2">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. 
                  You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">4. Platform Use</h2>
                <h3 className="text-lg font-medium mb-2 text-gray-800">4.1 General Use</h3>
                <p className="text-gray-700">
                  You agree to use our Platform only for lawful purposes and in accordance with these Terms. You agree not to use our Platform:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                  <li>In any way that violates any applicable law or regulation.</li>
                  <li>To transmit any material that is defamatory, offensive, or otherwise objectionable.</li>
                  <li>To impersonate or attempt to impersonate any person or entity.</li>
                  <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Platform.</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2 mt-4 text-gray-800">4.2 User Content</h3>
                <p className="text-gray-700">
                  Our Platform may allow you to post, link, store, share, and otherwise make available certain information, text, graphics, 
                  or other material. You are responsible for the content you post on or through our Platform.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">5. Booking and Payments</h2>
                <p className="text-gray-700">
                  Our Platform facilitates the booking of transportation services between Van Owners and Customers. 
                  We do not provide transportation services directly.
                </p>
                <p className="text-gray-700 mt-2">
                  When you book a Service through our Platform, you agree to pay the specified rates. Payments are processed through our 
                  third-party payment processors. By providing payment information, you represent and warrant that you are authorized to use 
                  the payment method.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">6. Van Owner Obligations</h2>
                <p className="text-gray-700">
                  Van Owners agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                  <li>Provide accurate information about their services, rates, and availability.</li>
                  <li>Maintain appropriate insurance and licenses required for their services.</li>
                  <li>Provide the services as described and agreed upon at the time of booking.</li>
                  <li>Communicate promptly with Customers regarding bookings and services.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">7. Customer Obligations</h2>
                <p className="text-gray-700">
                  Customers agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                  <li>Provide accurate information when making a booking.</li>
                  <li>Be present at the agreed-upon time and location for the service.</li>
                  <li>Pay the agreed-upon rates for the services.</li>
                  <li>Communicate promptly with Van Owners regarding bookings and services.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">8. Limitation of Liability</h2>
                <p className="text-gray-700">
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, 
                  resulting from:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                  <li>Your use of or inability to use our Platform.</li>
                  <li>Any conduct or content of any third party on the Platform.</li>
                  <li>Any unauthorized access to or use of our servers and/or any personal information stored therein.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">9. Indemnification</h2>
                <p className="text-gray-700">
                  You agree to defend, indemnify, and hold harmless our company, its affiliates, licensors, and service providers, 
                  and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, 
                  and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees 
                  (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Platform.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">10. Termination</h2>
                <p className="text-gray-700">
                  We reserve the right to terminate or suspend your account and access to our Platform at our sole discretion, 
                  without notice, for conduct that we believe violates these Terms or is harmful to other users of the Platform, us, 
                  or third parties, or for any other reason.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">11. Changes to Terms</h2>
                <p className="text-gray-700">
                  We may revise these Terms at any time by updating this page. By continuing to use our Platform after those revisions 
                  become effective, you agree to be bound by the revised terms.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">12. Governing Law</h2>
                <p className="text-gray-700">
                  These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, 
                  without regard to its conflict of law provisions.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">13. Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about these Terms, please contact us at support@manandvan.uk.
                </p>
              </section>
              
              <p className="text-gray-600 italic pt-4">
                Last Updated: May 22, 2025
              </p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;
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

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>Privacy Policy | Man and Van</title>
        <meta name="description" content="Privacy policy for the Man and Van service platform." />
      </Helmet>
      
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardTitle className="text-2xl md:text-3xl">Privacy Policy</CardTitle>
          <CardDescription className="text-slate-200">
            How we collect, use, and protect your information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[60vh] md:h-[70vh] pr-4">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">1. Introduction</h2>
                <p className="text-gray-700">
                  At Man and Van, we respect your privacy and are committed to protecting your personal data. 
                  This Privacy Policy explains how we collect, use, process, and share your information when you use our platform.
                </p>
                <p className="text-gray-700 mt-2">
                  Please read this Privacy Policy carefully to understand our practices regarding your personal data. 
                  By using our platform, you acknowledge that you have read and understood this Privacy Policy.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">2. Information We Collect</h2>
                <p className="text-gray-700">
                  We collect several types of information from and about users of our platform, including:
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4 text-gray-800">2.1 Personal Information</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Contact information (name, email address, phone number)</li>
                  <li>Account information (username, password)</li>
                  <li>Profile information (profile picture, bio)</li>
                  <li>For Van Owners: vehicle information, service offerings, rates</li>
                  <li>Payment information (processed through secure third-party payment processors)</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2 mt-4 text-gray-800">2.2 Usage Information</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Log data (IP address, browser type, pages visited, time spent)</li>
                  <li>Device information (device type, operating system)</li>
                  <li>Location data (with your consent)</li>
                  <li>Booking history and preferences</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">3. How We Use Your Information</h2>
                <p className="text-gray-700">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                  <li>Providing and improving our platform</li>
                  <li>Processing bookings and payments</li>
                  <li>Facilitating communication between Van Owners and Customers</li>
                  <li>Sending service updates and notifications</li>
                  <li>Customizing your experience</li>
                  <li>Analyzing usage patterns to improve our services</li>
                  <li>Preventing fraud and ensuring platform security</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">4. Information Sharing and Disclosure</h2>
                <p className="text-gray-700">
                  We may share your information in the following circumstances:
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4 text-gray-800">4.1 Service Providers</h3>
                <p className="text-gray-700">
                  We share information with third-party service providers who help us operate our platform, 
                  such as cloud storage providers, payment processors, and analytics services.
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4 text-gray-800">4.2 Between Users</h3>
                <p className="text-gray-700">
                  When you make a booking, certain information will be shared between the Customer and the Van Owner 
                  to facilitate the service (e.g., contact information, booking details, location).
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4 text-gray-800">4.3 Legal Requirements</h3>
                <p className="text-gray-700">
                  We may disclose your information if required by law, regulation, legal process, or governmental request.
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4 text-gray-800">4.4 Business Transfers</h3>
                <p className="text-gray-700">
                  If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information 
                  may be transferred as part of that transaction.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">5. Data Security</h2>
                <p className="text-gray-700">
                  We implement appropriate technical and organizational measures to protect your personal data against 
                  unauthorized or unlawful processing, accidental loss, destruction, or damage.
                </p>
                <p className="text-gray-700 mt-2">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. 
                  While we strive to protect your personal data, we cannot guarantee its absolute security.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">6. Data Retention</h2>
                <p className="text-gray-700">
                  We retain your personal data for as long as necessary to fulfill the purposes for which we collected it, 
                  including for the purposes of satisfying any legal, accounting, or reporting requirements.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">7. Your Rights</h2>
                <p className="text-gray-700">
                  Depending on your location, you may have certain rights regarding your personal data, including:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                  <li>The right to access your personal data</li>
                  <li>The right to rectify inaccurate personal data</li>
                  <li>The right to erasure (the "right to be forgotten")</li>
                  <li>The right to restrict processing of your personal data</li>
                  <li>The right to data portability</li>
                  <li>The right to object to processing of your personal data</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  To exercise these rights, please contact us using the details provided in the "Contact Us" section.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">8. Cookies and Tracking Technologies</h2>
                <p className="text-gray-700">
                  We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
                  Cookies are files with a small amount of data that may include an anonymous unique identifier.
                </p>
                <p className="text-gray-700 mt-2">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                  However, if you do not accept cookies, you may not be able to use some portions of our platform.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">9. Children's Privacy</h2>
                <p className="text-gray-700">
                  Our platform is not intended for children under 18 years of age. We do not knowingly collect personal data from children under 18. 
                  If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">10. Changes to This Privacy Policy</h2>
                <p className="text-gray-700">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
                  and updating the "Last Updated" date.
                </p>
                <p className="text-gray-700 mt-2">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they 
                  are posted on this page.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-indigo-700">11. Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-gray-700 mt-2">
                  Email: privacy@manandvan.uk<br />
                  Address: 123 Van Street, London, UK
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

export default PrivacyPolicy;
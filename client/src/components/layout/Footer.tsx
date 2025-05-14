import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <i className="fas fa-truck text-white text-2xl mr-2"></i>
              <span className="text-xl font-bold">
                Man<span className="text-primary">&</span>Van
              </span>
            </div>
            <p className="text-slate-300 mb-6">
              Connecting van owners with people who need moving services across the UK.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-slate-300 hover:text-white transition-colors">
                  Search Services
                </Link>
              </li>
              <li>
                <Link href="/create-listing" className="text-slate-300 hover:text-white transition-colors">
                  List Your Van
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-slate-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Safety Information
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Cancellation Options
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Report an Issue
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-slate-300 mb-4">
              Subscribe to our newsletter for updates and promotions.
            </p>
            <form className="mb-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 rounded-l-md w-full focus:outline-none text-slate-800"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
            <p className="text-slate-300 text-sm">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center md:flex md:justify-between md:text-left">
          <p className="text-slate-300 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Man & Van. All rights reserved.
          </p>
          <div className="space-x-4">
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Menu } from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <i className="fas fa-truck text-primary text-2xl"></i>
              <span className="text-xl font-bold text-secondary">
                Man<span className="text-primary">&</span>Van
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/#how-it-works" className="text-slate-600 hover:text-primary font-medium">
              How It Works
            </Link>
            <Link href="/#services" className="text-slate-600 hover:text-primary font-medium">
              Services
            </Link>
            {user?.isVanOwner ? (
              <Link href="/my-listings" className="text-slate-600 hover:text-primary font-medium">
                My Listings
              </Link>
            ) : (
              <Link href="/create-listing" className="text-slate-600 hover:text-primary font-medium">
                List Your Van
              </Link>
            )}

            <div className="flex items-center space-x-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-bookings">My Bookings</Link>
                    </DropdownMenuItem>
                    {user.isVanOwner && (
                      <DropdownMenuItem asChild>
                        <Link href="/my-listings">My Listings</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMobileMenu}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              href="/#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
              onClick={closeMobileMenu}
            >
              How It Works
            </Link>
            <Link
              href="/#services"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
              onClick={closeMobileMenu}
            >
              Services
            </Link>
            <Link
              href="/create-listing"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
              onClick={closeMobileMenu}
            >
              List Your Van
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <Link
                  href="/my-bookings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
                  onClick={closeMobileMenu}
                >
                  My Bookings
                </Link>
                {user.isVanOwner && (
                  <Link
                    href="/my-listings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
                    onClick={closeMobileMenu}
                  >
                    My Listings
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-blue-700"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

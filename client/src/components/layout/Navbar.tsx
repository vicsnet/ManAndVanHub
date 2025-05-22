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
import { User, Menu, MessageSquare, TruckIcon } from "lucide-react";
import { UnreadMessagesIndicator } from "@/components/chat";

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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                <TruckIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">Man&Van</span>
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
                    <DropdownMenuItem asChild className="relative">
                      <Link href="/my-bookings" className="flex items-center">
                        <span className="mr-1">My Bookings</span>
                        <MessageSquare className="h-3.5 w-3.5 ml-1 opacity-70" />
                        <UnreadMessagesIndicator className="absolute -right-1 -top-1" />
                      </Link>
                    </DropdownMenuItem>
                    {user.isVanOwner && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/my-listings">My Listings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="relative">
                          <Link href="/manage-bookings" className="flex items-center">
                            <span className="mr-1">Manage Bookings</span>
                            <MessageSquare className="h-3.5 w-3.5 ml-1 opacity-70" />
                            <UnreadMessagesIndicator className="absolute -right-1 -top-1" />
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild className="hover:text-blue-600">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
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
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100 relative"
                  onClick={closeMobileMenu}
                >
                  <div className="flex items-center">
                    <span>My Bookings</span>
                    <MessageSquare className="h-3.5 w-3.5 ml-1 opacity-70" />
                    <UnreadMessagesIndicator className="absolute top-1 right-10" />
                  </div>
                </Link>
                {user.isVanOwner && (
                  <>
                    <Link
                      href="/my-listings"
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
                      onClick={closeMobileMenu}
                    >
                      My Listings
                    </Link>
                    <Link
                      href="/manage-bookings"
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100 relative"
                      onClick={closeMobileMenu}
                    >
                      <div className="flex items-center">
                        <span>Manage Bookings</span>
                        <MessageSquare className="h-3.5 w-3.5 ml-1 opacity-70" />
                        <UnreadMessagesIndicator className="absolute top-1 right-10" />
                      </div>
                    </Link>
                  </>
                )}
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-100"
                    onClick={closeMobileMenu}
                  >
                    Admin Dashboard
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
                  className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800"
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

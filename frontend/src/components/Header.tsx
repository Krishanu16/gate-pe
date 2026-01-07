import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, LayoutDashboard, UserPlus } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;

  const handleLoginClick = () => {
    navigate({ to: '/login' });
  };
  
  const handleSignupClick = () => {
    navigate({ to: '/signup' });
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-teal-800 font-handwritten">
          <span>GATE Petro '26</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
            <Link to="/enroll" className="hover:text-teal-600 transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 border-red-200 hover:bg-red-50 text-red-700">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleLoginClick} variant="ghost" className="text-gray-600 hover:text-teal-700">
                   Log In
                </Button>
                {/* FIX: Points to Signup Page now */}
                <Button onClick={handleSignupClick} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>

        {/* MOBILE NAV */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-10">
                <Link to="/" className="text-lg font-bold">Home</Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="text-lg font-bold text-teal-700">Dashboard</Link>
                    <button onClick={handleLogout} className="text-lg font-bold text-left text-red-600">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-lg font-bold text-gray-700">Log In</Link>
                    <Link to="/signup" className="text-lg font-bold text-teal-700">Sign Up</Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
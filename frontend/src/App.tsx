import React, { useEffect } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { SecurityLayer } from './components/SecurityLayer';

import  LandingPage from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { EnrollPage } from './pages/EnrollPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage'; // Import the new page
import { TestPage } from './pages/TestPage';
import { LegalPage } from './pages/LegalPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ExplorePage } from './pages/ExplorePage'; // Import

const rootRoute = createRootRoute({
  component: () => (
    <SecurityLayer>
      <Outlet />
      <Toaster />
    </SecurityLayer>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const enrollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/enroll',
  component: EnrollPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Define the Signup Route
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
});

const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test/$testId', // Dynamic param
  component: TestPage,
});

const legalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal',
  component: LegalPage,
});

const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/settings', component: SettingsPage });

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: ExplorePage,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/landing',
  component: LandingPage,
});

// Add signupRoute to the tree
const routeTree = rootRoute.addChildren(  
  [indexRoute, dashboardRoute, adminRoute, enrollRoute, loginRoute,
     signupRoute, testRoute, legalRoute, settingsRoute,
       onboardingRoute, exploreRoute, landingRoute]);

const router = createRouter({ routeTree });

export default function App() {
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: Event) => e.preventDefault();
    
    // 2. Disable Keyboard Shortcuts (Ctrl+S, Ctrl+P, Ctrl+Shift+I)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) || 
        (e.ctrlKey && e.shiftKey && e.key === 'i') || // Inspect Element
        e.key === 'F12'
      ) {
        e.preventDefault();
        alert("Protected Content");
      }
    };

    // 3. Blur on Tab Switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "🚫 Locked";
      } else {
        document.title = "PETRO ELITE";
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <RouterProvider router={router} />;
}
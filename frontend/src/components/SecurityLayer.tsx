import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SecurityLayer = ({ children }: { children: React.ReactNode }) => {
  const { isLocked, logout } = useAuth();

  // If the account is locked, BLOCK EVERYTHING and show this screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 z-[9999] relative">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md border-2 border-red-100">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
             <Lock className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-handwritten">Access Denied</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Security Alert: This account is bound to another device.
            <br/>
            <span className="text-sm text-gray-400 mt-2 block">ID Mismatch detected</span>
          </p>
          <Button onClick={logout} variant="destructive" className="w-full font-bold">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // If not locked, render the website normally
  return <>{children}</>;
};
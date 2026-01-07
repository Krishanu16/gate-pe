import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

interface InternetIdentityContextType {
  identity: Identity | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // Added this
  login: () => void;
  logout: () => void;
  authClient: AuthClient | null;
}

const InternetIdentityContext = createContext<InternetIdentityContextType | null>(null);

export const InternetIdentityProvider = ({ children }: { children: React.ReactNode }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // Added this

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const isAuth = await client.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        setIdentity(client.getIdentity());
      }
      setIsInitializing(false); // Done initializing
    });
  }, []);

  const login = async () => {
    if (!authClient) return;
    await authClient.login({
      identityProvider: process.env.DFX_NETWORK === 'ic' 
        ? 'https://identity.ic0.app' 
        : `http://127.0.0.1:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`,
      onSuccess: () => {
        setIsAuthenticated(true);
        setIdentity(authClient.getIdentity());
        window.location.reload();
      },
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    window.location.reload();
  };

  return (
    <InternetIdentityContext.Provider value={{ identity, isAuthenticated, isInitializing, login, logout, authClient }}>
      {children}
    </InternetIdentityContext.Provider>
  );
};

export const useInternetIdentity = () => {
  const context = useContext(InternetIdentityContext);
  if (!context) {
    throw new Error("useInternetIdentity must be used within an InternetIdentityProvider");
  }
  return context;
};
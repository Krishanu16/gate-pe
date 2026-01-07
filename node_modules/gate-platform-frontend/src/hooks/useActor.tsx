import { Actor, HttpAgent } from '@dfinity/agent';
import { useMemo } from 'react';
import { idlFactory } from '../../../src/declarations/backend'; 

const canisterId = process.env.CANISTER_ID_BACKEND as string;

export function useActor<T>() {
  const actor = useMemo(() => {
    // Create an agent with an Anonymous Identity (default)
    const agent = new HttpAgent({
      host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://127.0.0.1:4943',
    });

    // Fetch root key for local development
    if (process.env.DFX_NETWORK !== 'ic') {
      agent.fetchRootKey().catch((err) => {
        console.warn("Unable to fetch root key:", err);
      });
    }

    if (!canisterId) {
        console.warn("CANISTER_ID_BACKEND is missing.");
        return null;
    }

    return Actor.createActor<T>(idlFactory, {
      agent,
      canisterId,
    });
  }, []);

  return { actor };
}
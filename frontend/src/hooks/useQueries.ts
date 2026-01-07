import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuth } from './useAuth';
import { Principal } from '@dfinity/principal';
import type { ContentModule } from '../../../src/declarations/backend/backend.did';
import { _SERVICE as BackendActor } from '../../../src/declarations/backend/backend.did';

// --- QUERIES ---

export const useUserProfile = () => {
  const { actor } = useActor<BackendActor>();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: async () => {
      if (!actor || !isAuthenticated) return null;
      const result = await actor.getCallerUserProfile();
      if (result.length === 0) return null;
      return result[0];
    },
    enabled: !!actor && isAuthenticated,
  });
};

export const useIsAdmin = () => {
  const { actor } = useActor<BackendActor>();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: ['isAdmin', user?.uid],
    queryFn: async () => {
      if (!actor || !isAuthenticated) return false;
      return await actor.isCallerAdmin();
    },
    enabled: !!actor && isAuthenticated,
  });
};

export const useContentModules = () => {
  const { actor } = useActor<BackendActor>();
  const { data: userProfile } = useUserProfile();

  return useQuery({
    queryKey: ['contentModules'],
    queryFn: async () => {
      if (!actor || !userProfile) return [];
      return await actor.getContentModules(userProfile.sessionToken);
    },
    enabled: !!actor && !!userProfile,
  });
};

export const useAllUsers = () => {
  const { actor } = useActor<BackendActor>();
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor || !isAdmin) return [];
      return await actor.getAllUsers();
    },
    enabled: !!actor && !!isAdmin,
  });
};

export const useActiveSessions = () => {
  const { actor } = useActor<BackendActor>();
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      if (!actor || !isAdmin) return [];
      return await actor.getActiveSessions();
    },
    enabled: !!actor && !!isAdmin,
  });
};

export const useExpiryDate = (user: Principal | undefined) => {
    const { actor } = useActor<BackendActor>();
  
    return useQuery({
      queryKey: ['expiryDate', user?.toText()],
      queryFn: async () => {
        if (!actor || !user) return null;
        const result = await actor.getExpiryDate(user);
        if (result.length === 0) return null;
        return result[0];
      },
      enabled: !!actor && !!user,
    });
};

// --- MUTATIONS ---

export const useRegister = () => {
  const { actor } = useActor<BackendActor>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.register(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useSimulatePayment = () => {
  const { actor } = useActor<BackendActor>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionToken: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.simulatePayment(sessionToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useUpdateProgress = () => {
  const { actor } = useActor<BackendActor>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, progress, sessionToken }: { moduleId: string; progress: bigint; sessionToken: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.updateProgress(moduleId, progress, sessionToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useRevokeSession = () => {
  const { actor } = useActor<BackendActor>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.revokeUserSession(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const { actor } = useActor<BackendActor>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, isPaid }: { principal: Principal; isPaid: boolean }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.updateUserPaymentStatus(principal, isPaid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
};

export const useAddContentModule = () => {
  const { actor } = useActor<BackendActor>();
  const { data: userProfile } = useUserProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (module: ContentModule) => {
      if (!actor || !userProfile) throw new Error('Actor not initialized or unauthorized');
      return await actor.addContentModule(module, userProfile.sessionToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentModules'] });
    },
  });
};

export const useDeleteContentModule = () => {
  const { actor } = useActor<BackendActor>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.deleteContentModule(moduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentModules'] });
    },
  });
};

export const useRecordDeviceFingerprint = () => {
  const { actor } = useActor<BackendActor>();
  
  return useMutation({
    mutationFn: async ({ fingerprint, sessionToken }: { fingerprint: string; sessionToken: string }) => {
       if (!actor) throw new Error('Actor not initialized');
       return await actor.recordDeviceFingerprint(fingerprint, sessionToken);
    }
  });
};

export const useVerifyDeviceFingerprint = () => {
    const { actor } = useActor<BackendActor>();
    
    return useMutation({
      mutationFn: async ({ fingerprint, sessionToken }: { fingerprint: string; sessionToken: string }) => {
         if (!actor) throw new Error('Actor not initialized');
         return await actor.verifyDeviceFingerprint(fingerprint, sessionToken);
      }
    });
};

export const useAdminResetDevice = () => {
    const { actor } = useActor<BackendActor>();
    
    return useMutation({
      mutationFn: async (user: Principal) => {
         if (!actor) throw new Error('Actor not initialized');
         return await actor.adminResetDevice(user);
      }
    });
};

export const useRevokeAccess = () => {
    const { actor } = useActor<BackendActor>();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (user: Principal) => {
        if (!actor) throw new Error('Actor not initialized');
        return await actor.revokeAccess(user);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      },
    });
};

export const useSetExpiryDate = () => {
    const { actor } = useActor<BackendActor>();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ user, date }: { user: Principal; date: bigint }) => {
        if (!actor) throw new Error('Actor not initialized');
        return await actor.setExpiryDate(user, date);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      },
    });
};
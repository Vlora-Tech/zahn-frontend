import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { GetCurrentUserResponse } from '../api/auth/types';
import { useGetCurrentUserInformation, useLogin } from '../api/auth/hooks';
import { Role, Permission, rolePerms, hasPerm } from '../utils/permissions';

interface AuthContextType {
  // State
  user: GetCurrentUserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;

  // Permission helpers
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  getUserPermissions: () => Permission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Check if user is authenticated based on token existence
  const hasToken = () => {
    return !!localStorage.getItem('accessToken');
  };

  // Use your existing hooks
  const {
    data: user,
    isLoading,
    error: queryError,
    refetch,
  } = useGetCurrentUserInformation({
    enabled: hasToken() && location.pathname !== '/login',
  });

  const { mutate: loginMutate } = useLogin();

  // Handle authentication state
  const isAuthenticated = hasToken() && !!user;

  // Login function
  const handleLogin = async (username: string, password: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      setError(null);
      
      loginMutate(
        { username, password },
        {
          onSuccess: (response) => {
            // Store the access token
            localStorage.setItem('accessToken', response.access_token);
            
            // Refetch user information
            refetch().then(() => {
              // Navigate to the intended page or home
              const from = location.state?.from?.pathname || '/';
              navigate(from, { replace: true });
              resolve();
            });
          },
          onError: (err: unknown) => {
            const axiosError = err as AxiosError<{ message?: string }>;
            const errorMessage = axiosError?.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            reject(new Error(errorMessage));
          },
        }
      );
    });
  };

  // Logout function
  const handleLogout = useCallback(() => {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear user data from query cache
    queryClient.setQueryData(['current-user'], null);
    queryClient.removeQueries({ queryKey: ['current-user'] });
    
    // Clear any errors
    setError(null);
    
    // Navigate to login
    navigate('/login', { replace: true });
  } , []);

  // Permission helper functions
  const getUserPermissions = (): Permission[] => {
    if (!user?.role) return [];
    return rolePerms[user.role as Role] || [];
  };

  const hasPermission = (permission: Permission | Permission[]): boolean => {
    if (!user?.role) return false;
    const userPermissions = getUserPermissions();
    return hasPerm(userPermissions, permission);
  };

  const hasRole = (role: Role | Role[]): boolean => {
    if (!user?.role) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role as Role);
  };

  const clearError = () => {
    setError(null);
  };

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      const axiosError = queryError as AxiosError<{ message?: string }>;
      const errorMessage = axiosError?.response?.data?.message || 'Authentication error occurred.';
      setError(errorMessage);
    }
  }, [queryError]);

  // Auto logout on 401 errors (handled by axios interceptor, but this is a backup)
  useEffect(() => {
    if (queryError) {
      const axiosError = queryError as AxiosError;
      if (axiosError?.response?.status === 401) {
        handleLogout();
      }
    }
  }, [queryError, handleLogout]);

  const contextValue: AuthContextType = {
    // State
    user: user || null,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    clearError,

    // Permission helpers
    hasPermission,
    hasRole,
    getUserPermissions,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
interface WithAuthProps {
  requiredRoles?: Role[];
  requiredPermissions?: Permission[];
  fallback?: React.ComponentType;
}

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) => {
  const { requiredRoles, requiredPermissions, fallback: Fallback } = options;

  return (props: P) => {
    const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Check role requirements
    if (requiredRoles && !hasRole(requiredRoles)) {
      if (Fallback) {
        return <Fallback />;
      }
      return <Navigate to="/login" replace />;
    }

    // Check permission requirements
    if (requiredPermissions && !hasPermission(requiredPermissions)) {
      if (Fallback) {
        return <Fallback />;
      }
      return <Navigate to="/login" replace />;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;

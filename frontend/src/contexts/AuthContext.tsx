
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  provider?: 'google' | 'github';
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'medical_app_auth';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock JWT token validation
  const validateToken = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  // Mock JWT token creation
  const createToken = (user: User): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { token, user: storedUser } = JSON.parse(stored);
          if (validateToken(token)) {
            setUser(storedUser);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@medical.com' && password === 'admin123') {
        const user: User = {
          id: '1',
          email,
          name: 'Dr. Sarah Johnson',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        const token = createToken(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
        setUser(user);
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in as administrator.',
        });
      } else if (email === 'student@medical.com' && password === 'student123') {
        const user: User = {
          id: '2',
          email,
          name: 'John Smith',
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        const token = createToken(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
        setUser(user);
        toast({
          title: 'Welcome!',
          description: 'Successfully logged in as student.',
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      // Mock OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: provider === 'google' ? '3' : '4',
        email: `user@${provider}.com`,
        name: provider === 'google' ? 'Dr. Maria Garcia' : 'Prof. David Kim',
        role: 'instructor',
        avatar: provider === 'google' 
          ? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        provider,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      const token = createToken(mockUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: mockUser }));
      setUser(mockUser);
      toast({
        title: 'Welcome!',
        description: `Successfully logged in with ${provider === 'google' ? 'Google' : 'GitHub'}.`,
      });
    } catch (error) {
      toast({
        title: 'OAuth login failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updates };
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { token } = JSON.parse(stored);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: updatedUser }));
      }
      
      setUser(updatedUser);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update profile. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    const roleHierarchy: Record<UserRole, number> = {
      student: 1,
      instructor: 2,
      admin: 3
    };
    return roleHierarchy[user.role] >= roleHierarchy[role];
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const permissions: Record<UserRole, string[]> = {
      student: ['view_images', 'view_reports', 'edit_own_profile'],
      instructor: ['view_images', 'view_reports', 'edit_own_profile', 'create_reports', 'manage_students'],
      admin: ['view_images', 'view_reports', 'edit_own_profile', 'create_reports', 'manage_students', 'manage_users', 'view_audit_logs']
    };
    
    return permissions[user.role]?.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithOAuth,
    logout,
    updateProfile,
    hasRole,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

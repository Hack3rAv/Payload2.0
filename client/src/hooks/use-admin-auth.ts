import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if the user is authenticated
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/current-user');
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login with password
  const login = async (password: string): Promise<boolean> => {
    try {
      console.log('Sending login request with password:', password);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password }),
        credentials: 'include'
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        return true;
      }
      
      console.error('Login unsuccessful - no user in response data');
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
      return false;
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
};

export default useAdminAuth;
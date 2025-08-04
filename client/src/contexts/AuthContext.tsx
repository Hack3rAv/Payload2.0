import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { login as apiLogin, getCurrentUser } from '@/lib/api';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user data on initial mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check authentication status with the server
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await getCurrentUser(token);

      if (response?.user) {
        setUser(response.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin login - only requires password
  const loginUser = async (password: string): Promise<boolean> => {
    if (!password) {
      toast({
        title: "Error",
        description: "Password is required",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const data = await apiLogin(password);
      
      if (!data || !data.token || !data.user) {
        toast({
          title: "Login Failed",
          description: 'Authentication failed',
          variant: "destructive",
        });
        return false;
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logoutUser = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('token');
      setUser(null);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Provide auth context to child components
  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        login: loginUser,
        logout: logoutUser,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
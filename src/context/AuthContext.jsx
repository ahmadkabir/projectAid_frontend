import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Verify token is still valid
        authAPI.getMe()
          .then((res) => {
            if (res.data?.user) {
              setUser(res.data.user);
              localStorage.setItem('user', JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            // Token invalid, clear storage silently
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Login successful!');
      return { success: true, user };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request
      });
      
      let message = 'Login failed';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          message = 'Invalid email or password';
        } else if (
          error.response.status === 403 &&
          error.response.data?.code === 'EMAIL_NOT_VERIFIED'
        ) {
          // Let the login page show the "verify your email" notice with a resend option
          return {
            success: false,
            code: 'EMAIL_NOT_VERIFIED',
            email,
            error: error.response.data.message
          };
        } else if (error.response.data?.errors) {
          message = error.response.data.errors[0]?.msg || 'Login failed';
        } else {
          message = error.response.data?.message || 'Login failed';
        }
      } else if (error.request) {
        // Request was made but no response received
        message = 'Cannot connect to server. Please check if the backend is running on port 5001.';
      } else {
        // Something else happened
        message = error.message || 'Login failed';
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { verificationUrl } = response.data;
      
      // No auto-login: the account must be verified via the emailed link first
      toast.success('Verification email sent. Please check your inbox.');
      return { success: true, email, verificationUrl };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Keeps context + localStorage in sync after a profile edit
  const syncUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAdmin = () => {
    try {
      return user?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
};

import _React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { serverUrl } from '../config';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => void;
  register: (username: string, password: string) => void;
  logout: () => void;
  loginError: string | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const [loginError, setLoginError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      // Send login request to backend
      const response = await fetch(`${serverUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // On success, set user data in context
        const loggedInUser: User = { id: data.user.id, username: data.user.username };
        setAuth({ isAuthenticated: true, user: loggedInUser });
        setLoginError(null);
      } else {
        // Handle login error (invalid credentials)
        setLoginError('Invalid username or password');
        console.error('Login failed', data.message);
      }
    } catch (error) {
      setLoginError('Error logging in, please try again.');
      console.error('Error logging in:', error);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      // Send registration request to backend
      const response = await fetch(`${serverUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // On success, set user data in context
        const newUser: User = { id: data.user.id, username: data.user.username };
        setAuth({ isAuthenticated: true, user: newUser });
        setLoginError(null);
      } else {
        // Handle registration error (username already taken, etc.)
        setLoginError('Username already taken');
        console.error('Registration failed', data.message);
      }
    } catch (error) {
      setLoginError('Error registering user, please try again.');
      console.error('Error registering user:', error);
    }
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout, loginError , setAuth}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '../types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get user data from Firestore
        try {
          console.log('Fetching user data from Firestore...');
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('User data loaded:', userData);
            setUser(userData);
          } else {
            console.log('Creating default user profile...');
            // Create default user profile if doesn't exist
            const defaultUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: 'admin',
              factoryId: 'factory-1',
              department: 'Management',
              isActive: true,
              createdAt: new Date()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), defaultUser);
            setUser(defaultUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to demo user if Firebase fails
          const demoUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Demo User',
            email: firebaseUser.email || '',
            role: 'admin',
            factoryId: 'factory-1',
            department: 'Production',
            isActive: true,
            createdAt: new Date()
          };
          setUser(demoUser);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any) => {
    try {
      setLoading(true);
      console.log('Attempting signup for:', userData.email);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      console.log('Firebase user created, creating Firestore profile...');
      // Create user profile in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'admin',
        factoryId: userData.factoryId || 'factory-1',
        department: userData.department || 'Management',
        isActive: true,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      console.log('User profile created in Firestore');
      
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      await signOut(auth);
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      login, 
      signup, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

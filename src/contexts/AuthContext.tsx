// File: src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; // auth and db can be null now
import { User } from '../types/user';

// --- Interface remains the same ---
interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user for demo mode
const mockUserProfile: User = {
  uid: 'demo-user-uid',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  profileImageUrl: '',
  dateCreated: new Date(), // Use current date for mock
  lastLogin: new Date(),   // Use current date for mock
  preferredLanguage: 'en',
  measurementUnit: 'metric',
  preferredCurrency: 'USD',
  notificationSettings: {
    orderUpdates: true,
    appointments: true,
    promotions: false,
    messages: true,
    tailorTravelAlerts: false,
  },
  shippingAddresses: [],
  loyaltyPoints: 42,
  customerTier: 'regular', // Changed from 'gold' to a valid type
};


export default function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if Firebase services are available (imported auth will be null if not initialized)
  const isDemoMode = !auth;

  useEffect(() => {
    if (isDemoMode) {
      // --- Demo Mode Logic ---
      console.warn("AuthContext: Running in demo mode (Firebase config missing or invalid). Setting mock user.");
      setCurrentUser(null); // No real Firebase user in demo mode
      setUserProfile(mockUserProfile);
      setLoading(false);
      // No listener to set up or clean up in demo mode
      return () => {};
    } else if (auth) { // <-- MODIFIED: Only run Firebase logic if auth is NOT null
      // --- Firebase Mode Logic ---
      console.log("AuthContext: Firebase configured. Setting up auth listener.");

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);

        if (user) {
          // Ensure db is not null before using it
          if (!db) {
            console.error("AuthContext: Firestore (db) is not initialized! Cannot fetch profile.");
            setUserProfile(null); // Clear profile if db is missing
            // Potentially set a default/error profile state here
          } else {
            try {
              const userDocRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);

              if (userDoc.exists()) {
                setUserProfile(userDoc.data() as User);
              } else {
                console.warn(`AuthContext: Firestore document for user ${user.uid} not found.`);
                // Handle case where user exists in Auth but not Firestore
                // Set profile to null or a default structure
                setUserProfile(null);
              }
            } catch (error) {
              console.error('AuthContext: Error fetching user profile:', error);
              setUserProfile(null); // Clear profile on error
            }
          }
        } else {
          setUserProfile(null); // Clear profile when user logs out
        }
        setLoading(false); // Set loading false after processing auth state
      });

      // Cleanup function
      return () => {
          console.log("AuthContext: Cleaning up auth listener.");
          unsubscribe();
      };
      // Cleanup function
      return () => {
          console.log("AuthContext: Cleaning up auth listener.");
          unsubscribe();
      };
    } else {
      // Handle the unexpected case: not demo mode, but auth is still null
      console.error("AuthContext: Firebase auth object is null, cannot set up listener.");
      setLoading(false);
      return () => {}; // No listener to clean up
    }
  }, [isDemoMode, auth]); // <-- MODIFIED: Add auth to dependency array

  // Helper function for demo mode operations
  const logDemoWarning = (functionName: string): Promise<void> => {
      console.warn(`AuthContext: ${functionName} called in demo mode. Operation skipped.`);
      // Return a resolved promise to match the async function signature
      return Promise.resolve();
  };

  // --- Auth Functions (modified for demo mode) ---

  const signIn = async (email: string, password: string): Promise<void> => {
    if (isDemoMode || !auth) return logDemoWarning('signIn');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error; // Re-throw error to be handled by caller
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    if (isDemoMode || !auth || !db) return logDemoWarning('signUp');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: `${firstName} ${lastName}` });

      const userDocRef = doc(db, 'users', user.uid);
      // Use a structure similar to mock for consistency, but with real data
      const newUserProfileData: Omit<User, 'dateCreated' | 'lastLogin'> & { dateCreated: any, lastLogin: any } = {
          uid: user.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          profileImageUrl: '',
          preferredLanguage: 'en',
          measurementUnit: 'metric',
          preferredCurrency: 'USD',
          notificationSettings: { /* default settings */
            orderUpdates: true, appointments: true, promotions: true, messages: true, tailorTravelAlerts: true
          },
          shippingAddresses: [],
          loyaltyPoints: 0,
          customerTier: 'regular',
          dateCreated: serverTimestamp(), // Use server timestamp
          lastLogin: serverTimestamp(),   // Use server timestamp
      };
      await setDoc(userDocRef, newUserProfileData);
      // Optionally update local state immediately
      // setUserProfile(newUserProfileData); // Note: Timestamps won't be resolved yet

    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    if (isDemoMode || !auth || !db) return logDemoWarning('signInWithGoogle');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const nameParts = user.displayName?.split(' ') || ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const newUserProfileData: Omit<User, 'dateCreated' | 'lastLogin'> & { dateCreated: any, lastLogin: any } = {
            uid: user.uid,
            email: user.email ?? '', // Handle potentially null email
            firstName: firstName,
            lastName: lastName,
            profileImageUrl: user.photoURL || '',
            preferredLanguage: 'en',
            measurementUnit: 'metric',
            preferredCurrency: 'USD',
            notificationSettings: { /* default settings */
              orderUpdates: true, appointments: true, promotions: true, messages: true, tailorTravelAlerts: true
            },
            shippingAddresses: [],
            loyaltyPoints: 0,
            customerTier: 'regular',
            dateCreated: serverTimestamp(),
            lastLogin: serverTimestamp(),
        };
        await setDoc(userDocRef, newUserProfileData);
      } else {
        // Update last login timestamp for existing user
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    if (isDemoMode || !auth) {
        // In demo mode, just clear local state
        setCurrentUser(null);
        setUserProfile(null);
        return logDemoWarning('signOut');
    }
    // In Firebase mode, sign out properly
    try {
      await firebaseSignOut(auth);
      // State updates (currentUser, userProfile) handled by onAuthStateChanged listener
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (isDemoMode || !auth) return logDemoWarning('resetPassword');
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>): Promise<void> => {
    if (isDemoMode || !auth || !db) return logDemoWarning('updateUserProfile');

    // Use the state variable which is reliable even if auth object changes
    const currentUserId = currentUser?.uid;
    if (!currentUserId) {
      console.error('Update profile error: No user is signed in.');
      throw new Error('No user is signed in');
    }

    try {
      const userDocRef = doc(db, 'users', currentUserId);
      await setDoc(userDocRef, data, { merge: true });

      // Refresh local state immediately after update
      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        setUserProfile(updatedDoc.data() as User);
      } else {
         console.error('Update profile error: User document not found after update.');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // --- Render Provider ---
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateUserProfile,
      }}
    >
      {/* Only render children when not loading, regardless of mode */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
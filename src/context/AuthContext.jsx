
import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore'

import { auth, db } from '../firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for Firebase authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null)
          setLoading(false)
          return
        }

        // Get the user's Firestore profile
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)

        let profile

        if (userSnap.exists()) {
          profile = userSnap.data()
        } else {
          // Create a profile if one does not exist
          profile = {
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            plan: 'Free',
            createdAt: new Date().toISOString()
          }

          await setDoc(userRef, profile)
        }

        setUser({
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          name: profile.name || firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          plan: profile.plan || 'Free'
        })
      } catch (error) {
        console.error('Error loading user profile:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  // Register using Firebase Authentication
  const register = async (name, email, password) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    )

    await updateProfile(credential.user, {
      displayName: name.trim()
    })

    const profile = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      plan: 'Free',
      createdAt: new Date().toISOString()
    }

    await setDoc(
      doc(db, 'users', credential.user.uid),
      profile
    )

    return {
      uid: credential.user.uid,
      id: credential.user.uid,
      ...profile
    }
  }

  // Login using Firebase Authentication
  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    )

    return credential.user
  }

  // Logout using Firebase Authentication
  const logout = async () => {
    await signOut(auth)
  }

  // Upgrade plan using Firebase ID token
  // Backend verification must be updated to Firebase Admin SDK
  const upgradePlan = async (paymentDetails) => {
    const firebaseUser = auth.currentUser

    if (!firebaseUser) {
      throw new Error('You must be logged in to upgrade your plan.')
    }

    const idToken = await firebaseUser.getIdToken()

    const response = await fetch('/api/upgrade-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(paymentDetails)
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Payment validation failed.')
    }

    // Refresh the Firestore user profile
    const userRef = doc(db, 'users', firebaseUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const profile = userSnap.data()

      setUser({
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: profile.name || firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        plan: profile.plan || 'Free'
      })
    }

    return data
  }

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    isPaid: user?.plan === 'Paid',
    login,
    register,
    logout,
    upgradePlan
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

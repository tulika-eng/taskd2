import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onIdTokenChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

const AuthContext = createContext(null)

async function readJsonResponse(response) {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`The server returned a non-JSON response (HTTP ${response.status}). Check the Render API redirect and deployment.`)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null)
          setToken(null)
          return
        }

        const idToken = await firebaseUser.getIdToken()
        setToken(idToken)

        const userRef = doc(db, 'users', firebaseUser.uid)
        const snapshot = await getDoc(userRef)
        let profile

        if (snapshot.exists()) {
          profile = snapshot.data()
        } else {
          profile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            plan: 'Free',
            createdAt: new Date().toISOString(),
          }
          await setDoc(userRef, profile, { merge: true })
        }

        setUser({
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          name: profile.name || firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          plan: profile.plan || 'Free',
        })
      } catch (error) {
        console.error('Firebase session/profile error:', error)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const register = async (name, email, password) => {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password)
    await updateProfile(credential.user, { displayName: cleanName })

    const profile = {
      uid: credential.user.uid,
      name: cleanName,
      email: cleanEmail,
      plan: 'Free',
      createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, 'users', credential.user.uid), profile, { merge: true })
    return { ...profile, id: credential.user.uid }
  }

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    )
    return credential.user
  }

  const logout = async () => {
    await signOut(auth)
  }

  const upgradePlan = async (paymentDetails) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) throw new Error('You must be logged in to upgrade your plan.')

    const idToken = await firebaseUser.getIdToken(true)
    const response = await fetch('/api/upgrade-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(paymentDetails),
    })
    const data = await readJsonResponse(response)

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Payment validation failed.')
    }

    const profileSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid))
    const profile = profileSnapshot.exists() ? profileSnapshot.data() : {}

    setUser({
      uid: firebaseUser.uid,
      id: firebaseUser.uid,
      name: profile.name || firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      plan: profile.plan || 'Paid',
    })

    return data
  }

  const value = {
    user,
    token,
    loading,
    isLoggedIn: !!user,
    isPaid: user?.plan === 'Paid',
    login,
    register,
    logout,
    upgradePlan,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

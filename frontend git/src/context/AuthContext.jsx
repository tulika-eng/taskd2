import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Verify and sync active session from backend on app mount
  useEffect(() => {
    const syncSession = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.user) {
            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
          }
        } else {
          // Token expired or invalid
          logout()
        }
      } catch (err) {
        console.warn('Could not sync user session from backend:', err)
      } finally {
        setLoading(false)
      }
    }

    syncSession()
  }, [])

  // 1. Register with backend
  const register = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.')
    }

    // Save JWT in localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  // 2. Login with backend
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed.')
    }

    // Save JWT in localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  // 3. Logout
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // 4. Upgrade Plan
  const upgradePlan = async (paymentDetails) => {
    if (!token) {
      throw new Error('You must be logged in to upgrade your plan.')
    }

    const res = await fetch('/api/upgrade-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentDetails),
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Payment validation failed.')
    }

    if (data.token) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
    }

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }

    return data
  }

  const value = {
    token,
    user,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

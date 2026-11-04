import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    default:
      return 'Could not create your account. Please try again.'
  }
}

function SignUpPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(cred.user, { displayName: form.name })

      // Store the extra profile info in Firestore (users/{uid})
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: form.name,
        email: form.email,
        createdAt: serverTimestamp(),
      })

      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none'

  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#f5f5f5] px-4 py-10">
      <div className="w-full max-w-[540px] rounded border border-blue-400 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-base font-semibold text-blue-500">
          Create a DEV@Deakin Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[150px_1fr]">
            <label htmlFor="name" className="text-sm font-medium text-gray-800">
              Name*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[150px_1fr]">
            <label htmlFor="email" className="text-sm font-medium text-gray-800">
              Email*
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[150px_1fr]">
            <label htmlFor="password" className="text-sm font-medium text-gray-800">
              Password*
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[150px_1fr]">
            <label htmlFor="confirm" className="text-sm font-medium text-gray-800">
              Confirm password*
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              value={form.confirm}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded bg-red-50 p-2 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-500 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

export default SignUpPage

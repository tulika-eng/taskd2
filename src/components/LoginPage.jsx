import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#f5f5f5] px-4 py-10">
      <div className="relative w-full max-w-[440px] rounded-xl border border-gray-300 bg-white p-8 pt-14 shadow-md">
        <Link
          to="/signup"
          className="absolute right-6 top-5 rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 no-underline transition hover:bg-gray-50"
        >
          Sign up
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Sign in to DEV@Deakin</h1>
          <p className="text-xs text-gray-500 mt-1">
            Access your developer questions, tutorials, and subscription benefits.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-gray-700">
              Your email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 transition focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-gray-700">
              Your password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 transition focus:border-gray-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-600">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-semibold text-teal-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
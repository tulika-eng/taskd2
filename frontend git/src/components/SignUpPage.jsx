import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function SignUpPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
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

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 transition focus:border-gray-500 focus:outline-none'

  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-[#f5f5f5] px-4 py-10">
      <div className="w-full max-w-[520px] rounded-xl border border-gray-300 bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
          Create a DEV@Deakin Account
        </h1>
        <p className="mb-6 text-center text-xs text-gray-500">
          Join our community of developers and learners today.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[140px_1fr]">
            <label htmlFor="name" className="text-xs font-semibold text-gray-700">
              Name*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[140px_1fr]">
            <label htmlFor="email" className="text-xs font-semibold text-gray-700">
              Email*
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[140px_1fr]">
            <label htmlFor="password" className="text-xs font-semibold text-gray-700">
              Password*
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[140px_1fr]">
            <label htmlFor="confirm" className="text-xs font-semibold text-gray-700">
              Confirm password*
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <p className="pt-2 text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-700 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

export default SignUpPage

import { Link, useNavigate } from 'react-router-dom'
import { Search, Crown, Sparkles, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function NavBar() {
  const { user, isLoggedIn, isPaid, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-[#cfcfcf] bg-[#e0e0e0] sticky top-0 z-40 shadow-sm">
      <nav className="mx-auto flex max-w-[1150px] items-center gap-4 px-4 py-2.5">
        {/* Links back to the home page */}
        <Link
          to="/"
          className="shrink-0 text-lg font-black tracking-tight text-black no-underline hover:opacity-85 transition"
        >
          DEV@Deakin
        </Link>

        {/* Search bar */}
        <div className="flex flex-1 items-center">
          <div className="flex w-full items-center gap-2 rounded border border-[#bfbfbf] bg-white px-3 py-1.5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)] focus-within:border-teal-600">
            <Search className="h-4 w-4 text-[#888]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search questions, articles, tutorials..."
              aria-label="Search"
              className="w-full border-0 bg-transparent text-sm text-[#333] placeholder:text-[#999] focus:outline-none"
            />
          </div>
        </div>

        {/* Navigation links & User actions */}
        <div className="flex shrink-0 items-center gap-4 text-sm font-medium text-black">
          {/* Post Page link */}
          <Link
            to="/post"
            className="text-sm font-semibold text-gray-800 no-underline transition hover:text-teal-700"
          >
            Post
          </Link>

          {/* Pricing Page link (Requirement 3) */}
          <Link
            to="/pricing"
            id="nav-pricing-link"
            className="text-sm font-semibold text-gray-800 no-underline transition hover:text-black px-2 py-1 rounded hover:bg-black/5"
          >
            Pricing
          </Link>

          {/* Logged in vs Logged out state */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Display user name & Plan Status indicator (Requirement 4) */}
              <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-full px-2.5 py-1">
                <span className="text-xs font-semibold text-gray-800 max-w-[120px] truncate">
                  {user?.name || user?.email}
                </span>

                {/* Paid / Pro Plan indicator badge */}
                {isPaid ? (
                  <span
                    id="paid-plan-badge"
                    className="inline-flex items-center rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white"
                    title="User is on Pro Plan"
                  >
                    PRO
                  </span>
                ) : (
                  <span
                    id="free-plan-badge"
                    className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                    title="User is on Free Plan"
                  >
                    FREE
                  </span>
                )}
              </div>

              {/* Logout button (Requirement 2 & 5) */}
              <button
                type="button"
                id="logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 transition hover:text-red-800 hover:underline"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-800 no-underline transition hover:text-teal-700 px-2 py-1"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white no-underline transition hover:bg-teal-800 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default NavBar

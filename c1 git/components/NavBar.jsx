import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase.js'

function NavBar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <header className="border-b border-[#cfcfcf] bg-[#e0e0e0]">
      <nav className="mx-auto flex max-w-[1100px] items-center gap-4 px-4 py-2">
        {/* Links back to the home page */}
        <Link
          to="/"
          className="shrink-0 text-lg font-bold tracking-tight text-black no-underline"
        >
          DEV@Deakin
        </Link>

        <div className="flex flex-1 items-center">
          <div className="flex w-full items-center gap-2 rounded border border-[#bfbfbf] bg-white px-3 py-1.5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]">
            <Search className="h-4 w-4 text-[#999]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search..."
              aria-label="Search"
              className="w-full border-0 bg-transparent text-sm text-[#333] placeholder:text-[#999] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-sm font-medium text-black">
          <Link
            to="/post"
            className="text-sm font-medium text-black no-underline transition hover:text-gray-600"
          >
            Post
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-700">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 transition hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-black no-underline transition hover:text-gray-600"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default NavBar

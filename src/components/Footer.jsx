import { useState } from 'react'
import { Facebook, Twitter, Instagram } from 'lucide-react'

const footerColumns = [
  { id: 1, title: 'Explore', links: ['Home', 'Questions', 'Articles', 'Tutorials'] },
  { id: 2, title: 'Support', links: ['FAQs', 'Help', 'Contact Us'] },
]

// Migrated from your original <script> subscribe handler — same /subscribe
// endpoint on your Express backend, now driven by React state instead of
// direct DOM manipulation.
function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null) // 'success' | 'error' | null

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setMessage('Subscribing...')
    setStatus(null)

    try {
      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setMessage(data.message)

      if (data.success) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error(error)
      setMessage('Something went wrong. Please try again later.')
      setStatus('error')
    }
  }

  return (
    <footer id="contact" className="bg-teal-700 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-10 py-5 border-b border-white/20">
        <span className="font-bold tracking-wide">SIGN UP FOR OUR DAILY INSIDER</span>
        <form className="flex gap-2" onSubmit={handleSubscribe}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="px-3 py-2 rounded text-black min-w-[220px]"
          />
          <button
            type="submit"
            className="bg-gray-100 text-teal-700 font-semibold px-5 py-2 rounded hover:bg-gray-200"
          >
            Subscribe
          </button>
        </form>
      </div>

      {message && (
        <p
          className={`text-center px-4 pt-3 font-semibold ${
            status === 'success' ? 'text-green-300' : status === 'error' ? 'text-red-300' : ''
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap justify-around gap-6 px-10 py-8">
        {footerColumns.map((col) => (
          <div key={col.id}>
            <h4 className="mb-3 font-semibold">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-teal-50 hover:underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-3 font-semibold">Stay connected</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="bg-white/15 p-1.5 rounded">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="bg-white/15 p-1.5 rounded">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="Instagram" className="bg-white/15 p-1.5 rounded">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center px-4 py-4 border-t border-white/20">
        <p className="font-semibold mb-2">DEV@Deakin 2026</p>
        <div className="flex justify-center gap-4 text-sm">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Code of Conduct</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

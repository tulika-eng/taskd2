import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import UpgradeModal from './UpgradeModal.jsx'
import Footer from './Footer.jsx'

function PricingPage() {
  const { user, isLoggedIn, isPaid } = useAuth()
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState(null) // { type: 'info' | 'warning' | 'success', text: '' }

  const handleUpgradeClick = () => {
    // 1. Only currently logged in users can activate the Upgrade Plan button
    if (!isLoggedIn) {
      setNotification({
        type: 'warning',
        text: 'Please log in to your account first before upgrading your subscription.',
      })
      setTimeout(() => {
        navigate('/login')
      }, 1800)
      return
    }

    // 2. If the user is on a Paid plan, they cannot activate the Upgrade Plan button (or receive alert)
    if (isPaid) {
      setNotification({
        type: 'info',
        text: 'You are already on the Paid plan! All premium features are unlocked for your account.',
      })
      return
    }

    // 3. If on Free plan, proceed with Upgrade Plan feature modal
    setNotification(null)
    setIsModalOpen(true)
  }

  const freeFeatures = [
    { title: 'Access to public questions & community articles', included: true },
    { title: 'Post limit: Up to 5 posts per month', included: true },
    { title: 'Image upload size limit: Up to 2 MB', included: true },
    { title: 'Standard markdown formatting & tags', included: true },
    { title: 'Access to exclusive Paid articles & tutorials', included: false },
    { title: 'Unlimited posts & questions submissions', included: false },
    { title: 'High-res image uploads up to 50 MB', included: false },
    { title: 'Featured question priority placement', included: false },
    { title: 'Direct expert messaging & code reviews', included: false },
    { title: 'Custom verified "PRO" member badge', included: false },
  ]

  const paidFeatures = [
    { title: 'Access to all public & exclusive Paid posts', included: true },
    { title: 'Unlimited posts & questions allowed per month', included: true },
    { title: 'Increased image upload limit up to 50 MB', included: true },
    { title: 'Rich code syntax highlighting & live preview', included: true },
    { title: 'Access to premium expert tutorials & codebases', included: true },
    { title: 'Priority question placement in search & feeds', included: true },
    { title: 'Direct 1-on-1 author messaging & code review', included: true },
    { title: 'Distinct verified "PAID" badge across the platform', included: true },
    { title: 'Ad-free, distraction-free reading experience', included: true },
    { title: 'Priority 24/7 technical assistance', included: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-slate-50 to-gray-100 text-gray-800">

      {/* Hero Header */}
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center rounded-full bg-black px-4 py-1 text-xs font-semibold text-white mb-4">
          DEV@Deakin Subscription Plans
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          Supercharge Your Developer Knowledge
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          Compare our Free and Paid subscription tiers. Upgrade anytime to access premium tutorials, increased upload allowances, and unlimited posting.
        </p>

        {/* Current User Plan Banner */}
        {isLoggedIn && (
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 shadow-sm border border-gray-200 text-sm">
            <span className="text-gray-600">Logged in as <strong className="text-gray-900">{user?.name}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Current Plan:</span>
            {isPaid ? (
              <span className="inline-flex items-center rounded-full bg-black px-3 py-0.5 text-xs font-bold text-white">
                PRO PLAN ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                Free Plan
              </span>
            )}
          </div>
        )}

        {/* Interactive Notification Alert */}
        {notification && (
          <div
            className={`mx-auto mt-6 max-w-xl rounded-xl p-4 text-sm font-medium shadow-sm border ${notification.type === 'warning'
              ? 'bg-gray-50 border-gray-400 text-black'
              : notification.type === 'info'
                ? 'bg-gray-50 border-gray-400 text-black'
                : 'bg-gray-50 border-gray-400 text-black'
              }`}
          >
            <div className="flex items-center justify-between">
              <span>{notification.text}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-3 text-xs font-bold uppercase tracking-wider underline hover:opacity-75"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Comparison Cards Grid */}
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

          {/* FREE PLAN CARD */}
          <div className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
            <div className="mb-4">
              <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                Basic
              </span>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Free Plan</h2>
              <p className="mt-1 text-sm text-gray-500">
                Essential tools and basic access for readers and casual community members.
              </p>
            </div>

            <div className="my-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900">$0</span>
              <span className="text-sm font-medium text-gray-500">/ forever</span>
            </div>

            <div className="mt-2 mb-6">
              {isLoggedIn && !isPaid ? (
                <div className="w-full rounded-lg bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-700">
                  Your Current Active Plan
                </div>
              ) : isLoggedIn && isPaid ? (
                <div className="w-full rounded-lg bg-gray-50 py-2.5 text-center text-xs font-medium text-gray-500">
                  Included with your Pro Plan
                </div>
              ) : (
                <Link
                  to="/signup"
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Sign Up for Free
                </Link>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                What's Included:
              </p>
              <ul className="space-y-3">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className={f.included ? 'text-gray-900 font-bold' : 'text-gray-300'}>
                      •
                    </span>
                    <span className={f.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                      {f.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PRO PLAN CARD */}
          <div className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
            <div className="mb-4">
              <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                PRO Member
              </span>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Pro Plan</h2>
              <p className="mt-1 text-sm text-gray-500">
                Full unlimited power for active developers, educators, and technology authors.
              </p>
            </div>

            <div className="my-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900">$12</span>
              <span className="text-sm font-medium text-gray-500">/ month</span>
            </div>

            {/* Upgrade Plan Button */}
            <div className="mt-2 mb-6">
              {isPaid ? (
                <button
                  type="button"
                  onClick={handleUpgradeClick}
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 py-3 text-center text-sm font-bold text-black transition"
                >
                  Pro Plan Active
                </button>
              ) : (
                <button
                  id="upgrade-plan-btn"
                  type="button"
                  onClick={handleUpgradeClick}
                  className="w-full rounded-lg bg-black py-3 text-center text-sm font-bold text-white hover:bg-gray-800 transition"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Everything in Free, plus:
              </p>
              <ul className="space-y-3">
                {paidFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="text-gray-900 font-bold">•</span>
                    <span className="font-medium text-gray-800">{f.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Feature comparison table summary */}
        <div className="mt-14 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Plan Capabilities Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Feature Description</th>
                  <th className="px-4 py-3 text-center">Free Plan</th>
                  <th className="px-4 py-3 text-center text-black font-bold">Pro Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Access to Free vs Paid posts</td>
                  <td className="px-4 py-3 text-center">Free posts only</td>
                  <td className="px-4 py-3 text-center font-semibold text-black">All Free & Paid posts</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Monthly post submissions allowance</td>
                  <td className="px-4 py-3 text-center">5 posts / month</td>
                  <td className="px-4 py-3 text-center font-semibold text-black">Unlimited posts</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Image and attachment upload size limit</td>
                  <td className="px-4 py-3 text-center">Up to 2 MB</td>
                  <td className="px-4 py-3 text-center font-semibold text-black">Up to 50 MB (High-Res)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Platform status indicator badge</td>
                  <td className="px-4 py-3 text-center">Standard Member</td>
                  <td className="px-4 py-3 text-center font-semibold text-black">Verified PRO Badge</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Priority feeds & expert code review</td>
                  <td className="px-4 py-3 text-center">Community</td>
                  <td className="px-4 py-3 text-center font-semibold text-black">Priority Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upgrade Payment Modal */}
      <UpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setNotification({
            type: 'success',
            text: 'You have successfully upgraded to the Paid Plan! Your status is saved in Firestore.',
          })
        }}
      />

      <Footer />
    </div>
  )
}

export default PricingPage

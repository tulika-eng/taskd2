import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function UpgradeModal({ isOpen, onClose, onSuccess }) {
  const { upgradePlan, user } = useAuth()

  const [form, setForm] = useState({
    cardholderName: user?.name || '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw
    setForm({ ...form, cardNumber: formatted })
  }

  // Format expiry: "MM/YY"
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2)
    }
    setForm({ ...form, expiry: raw })
  }

  // Format CVV: up to 4 digits
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    setForm({ ...form, cvv: raw })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.cardholderName.trim()) {
      setError('Please enter the cardholder name.')
      return
    }

    const cleanCard = form.cardNumber.replace(/\s/g, '')
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      setError('Please enter a valid card number.')
      return
    }

    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
      setError('Expiry must be in MM/YY format.')
      return
    }

    if (form.cvv.length < 3) {
      setError('Please enter a valid CVV.')
      return
    }

    setLoading(true)
    try {
      await upgradePlan({
        cardholderName: form.cardholderName,
        cardNumber: cleanCard,
        expiry: form.expiry,
        cvv: form.cvv,
      })

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Payment failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded border border-gray-400 bg-white p-6 shadow-lg">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="text-lg font-bold text-black">Upgrade to Paid Plan</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-black font-semibold text-base px-2 py-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="py-8 text-center">
            <p className="text-base font-bold text-black">Payment Successful!</p>
            <p className="mt-2 text-sm text-gray-700">
              Your account has been upgraded to the Paid plan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-xs text-gray-600">
              Enter your payment details below to complete your upgrade ($12.00/month).
            </p>

            {/* Cardholder Name */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-black">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                placeholder="Full name"
                value={form.cardholderName}
                onChange={(e) => setForm({ ...form, cardholderName: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-black">
                Card Number
              </label>
              <input
                type="text"
                required
                placeholder="1234 5678 9012 3456"
                value={form.cardNumber}
                onChange={handleCardNumberChange}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
              />
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-black">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  required
                  placeholder="12/28"
                  value={form.expiry}
                  onChange={handleExpiryChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-black">
                  CVV
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="123"
                  value={form.cvv}
                  onChange={handleCvvChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded border border-gray-400 bg-gray-50 p-2 text-xs font-semibold text-black">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay and Upgrade'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default UpgradeModal

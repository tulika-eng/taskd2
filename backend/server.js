require('dotenv').config()

const express = require('express')
const cors = require('cors')
const sgMail = require('@sendgrid/mail')
const admin = require('firebase-admin')

const app = express()
const PORT = process.env.PORT || 3000

// Configure Firebase Admin with a service-account JSON stored in Render.
// Never commit this service-account JSON or put it in frontend code.
if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable.')
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'devdeakin-f152d',
  })
}

const db = admin.firestore()
const firebaseAuth = admin.auth()

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return res.status(401).json({ success: false, message: 'Firebase ID token required. Please log in.' })
  }

  try {
    req.user = await firebaseAuth.verifyIdToken(token)
    return next()
  } catch (error) {
    console.error('Firebase token verification failed:', error.message)
    return res.status(401).json({ success: false, message: 'Your session is invalid or expired. Please log in again.' })
  }
}

async function optionalAuthentication(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  req.user = null

  if (token) {
    try {
      req.user = await firebaseAuth.verifyIdToken(token)
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Your session is invalid. Please log in again.' })
    }
  }
  return next()
}

async function getUserProfile(uid) {
  const snapshot = await db.collection('users').doc(uid).get()
  return snapshot.exists ? snapshot.data() : null
}

function isValidCardNumber(number) {
  const digits = String(number || '').replace(/[\s-]/g, '')
  if (!/^\d{13,19}$/.test(digits)) return false

  let sum = 0
  let doubleDigit = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i])
    if (doubleDigit) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    doubleDigit = !doubleDigit
  }
  return sum % 10 === 0
}

function isValidExpiry(expiry) {
  if (typeof expiry !== 'string') return false
  const match = expiry.trim().match(/^(\d{2})\/(\d{2}|\d{4})$/)
  if (!match) return false

  const month = Number(match[1])
  let year = Number(match[2])
  if (year < 100) year += 2000
  if (month < 1 || month > 12) return false

  const now = new Date()
  return year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1)
}

app.get('/', (req, res) => {
  res.status(200).send('DEV@Deakin Backend is running successfully!')
})

// Create a post. The UID comes only from the verified Firebase token.
app.post('/api/posts', authenticateToken, asyncRoute(async (req, res) => {
  const uid = req.user.uid
  const { type, plan, title, tags } = req.body

  if (!['question', 'article'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid post type.' })
  }
  if (!['free', 'paid'].includes(plan)) {
    return res.status(400).json({ success: false, message: 'Invalid post plan.' })
  }
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 150) {
    return res.status(400).json({ success: false, message: 'A title of up to 150 characters is required.' })
  }
  if (!Array.isArray(tags) || tags.length < 1 || tags.length > 3) {
    return res.status(400).json({ success: false, message: 'Please provide between 1 and 3 tags.' })
  }

  const profile = await getUserProfile(uid)
  if (!profile) {
    return res.status(404).json({ success: false, message: 'User profile not found. Please sign out and sign in again.' })
  }

  if (plan === 'paid' && profile.plan !== 'Paid') {
    return res.status(403).json({ success: false, message: 'Only Paid members can publish Paid posts.' })
  }

  const contentField = type === 'question' ? 'description' : 'content'
  const bodyText = req.body[contentField]
  if (typeof bodyText !== 'string' || !bodyText.trim()) {
    return res.status(400).json({ success: false, message: `${contentField} is required.` })
  }
  if (type === 'article' && (typeof req.body.abstract !== 'string' || !req.body.abstract.trim())) {
    return res.status(400).json({ success: false, message: 'Article abstract is required.' })
  }

  const post = {
    type,
    plan,
    title: title.trim(),
    tags: tags.map(tag => String(tag).trim()).filter(Boolean),
    authorId: uid,
    authorName: profile.name || req.user.name || req.user.email || 'DEV@Deakin member',
    createdAt: new Date().toISOString(),
    ...(type === 'question'
      ? { description: bodyText.trim() }
      : { abstract: req.body.abstract.trim(), content: bodyText.trim() }),
  }

  const ref = await db.collection('posts').add(post)
  return res.status(201).json({ success: true, message: 'Post created successfully.', post: { id: ref.id, ...post } })
}))

// Visitors and Free users receive Free posts; Paid users receive both plans.
app.get('/api/posts', optionalAuthentication, asyncRoute(async (req, res) => {
  let paidAccess = false

  if (req.user) {
    const profile = await getUserProfile(req.user.uid)
    paidAccess = profile?.plan === 'Paid'
  }

  const snapshot = await db.collection('posts').get()
  let posts = snapshot.docs.map(item => ({ id: item.id, ...item.data() }))

  if (!paidAccess) {
    posts = posts.filter(post => String(post.plan || 'free').toLowerCase() === 'free')
  }

  posts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  return res.status(200).json({ success: true, posts })
}))

// Upgrade endpoint. This validates a demo card form; it is NOT a real payment processor.
app.post('/api/upgrade-plan', authenticateToken, asyncRoute(async (req, res) => {
  const uid = req.user.uid
  const { cardholderName, cardNumber, expiry, cvv, postalCode } = req.body

  if (!cardholderName || cardholderName.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Please enter the full cardholder name.' })
  }
  if (!isValidCardNumber(cardNumber)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid card number.' })
  }
  if (!isValidExpiry(expiry)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid future expiry date in MM/YY format.' })
  }
  if (!/^\d{3,4}$/.test(String(cvv || '').trim())) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 3 or 4 digit CVV.' })
  }
  if (postalCode !== undefined && String(postalCode).trim().length > 20) {
    return res.status(400).json({ success: false, message: 'Invalid postal code.' })
  }

  const userRef = db.collection('users').doc(uid)
  const userSnapshot = await userRef.get()
  if (!userSnapshot.exists) {
    return res.status(404).json({ success: false, message: 'User profile not found.' })
  }
  const userData = userSnapshot.data()
  if (userData.plan === 'Paid') {
    return res.status(409).json({ success: false, message: 'You are already on the Paid plan.' })
  }

  await userRef.set({
    plan: 'Paid',
    upgradedAt: new Date().toISOString(),
    lastFour: String(cardNumber).replace(/[\s-]/g, '').slice(-4),
    cardholderName: cardholderName.trim(),
  }, { merge: true })

  return res.status(200).json({
    success: true,
    message: 'Your account has been upgraded to the Paid plan.',
    user: { uid, plan: 'Paid' },
  })
}))

// Newsletter subscription endpoint
const subscribers = new Set()

app.post('/subscribe', asyncRoute(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' })
  }
  if (subscribers.has(email)) {
    return res.status(409).json({ success: false, message: 'This email is already subscribed.' })
  }

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    return res.status(503).json({ success: false, message: 'Newsletter email service is not configured.' })
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  await sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Welcome to DEV@Deakin!',
    text: 'Welcome to DEV@Deakin! Thank you for subscribing to our newsletter.',
  })

  subscribers.add(email)
  return res.status(200).json({ success: true, message: 'Successfully subscribed. A welcome email has been sent.' })
}))

app.use((error, req, res, next) => {
  console.error('API error:', error)
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' })
})

app.listen(PORT, () => {
  console.log(`DEV@Deakin backend listening on port ${PORT}`)
})

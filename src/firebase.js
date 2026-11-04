import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCV48sO2hNX46ZorLRcoktM6AtaswrsTUo",
  authDomain: "devdeakin-f152d.firebaseapp.com",
  projectId: "devdeakin-f152d",
  storageBucket: "devdeakin-f152d.firebasestorage.app",
  messagingSenderId: "706633472363",
  appId: "1:706633472363:web:4578e43057c22c945fd42e",
  measurementId: "G-3EKT688KF8"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

let analyticsInstance = null
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app)
      }
    })
    .catch(() => { })
}

export const analytics = analyticsInstance
export default app

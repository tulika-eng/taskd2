import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAoEpRUxGkOcBqjgMW8_dk1yKREDDUpXY0',
  authDomain: 'task-p4-firebase.firebaseapp.com',
  projectId: 'task-p4-firebase',
  storageBucket: 'task-p4-firebase.firebasestorage.app',
  messagingSenderId: '788829452039',
  appId: '1:788829452039:web:a0fc037104c38d9ed4b7a2',
  measurementId: 'G-WDCGKDGZ9E',
}

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

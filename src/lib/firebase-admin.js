import admin from "firebase-admin"

let isInitialized = false

// Lazy initialization - only runs when actually needed
function initializeFirebaseAdmin() {
  if (isInitialized) {
    return
  }

  // Skip initialization during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('⏭️  Skipping Firebase Admin init during build')
    return
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin environment variables')
    throw new Error(
      `Missing Firebase Admin environment variables: ${!projectId ? 'projectId ' : ''}${!clientEmail ? 'clientEmail ' : ''}${!privateKey ? 'privateKey' : ''}`
    )
  }

  try {
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n")

    if (!formattedPrivateKey.includes("BEGIN PRIVATE KEY")) {
      throw new Error("FIREBASE_PRIVATE_KEY appears to be malformed")
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      })
      console.log("✅ Firebase Admin initialized successfully")
    }

    isInitialized = true
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message)
    throw error
  }
}

// Proxy to ensure initialization happens before use
export const adminDb = new Proxy({}, {
  get(target, prop) {
    initializeFirebaseAdmin()
    return admin.firestore()[prop]
  }
})

export const adminAuth = new Proxy({}, {
  get(target, prop) {
    initializeFirebaseAdmin()
    return admin.auth()[prop]
  }
})

export default admin
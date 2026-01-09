import admin from "firebase-admin"

// Validate environment variables
const validateEnvVars = () => {
  const required = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase Admin environment variables: ${missing.join(", ")}\n` +
      `Please check your .env.local file contains:\n` +
      `- FIREBASE_PROJECT_ID\n` +
      `- FIREBASE_CLIENT_EMAIL\n` +
      `- FIREBASE_PRIVATE_KEY`
    )
  }

  return required
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const { projectId, clientEmail, privateKey } = validateEnvVars()

    // Clean up the private key
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n")

    // Verify the private key format
    if (!formattedPrivateKey.includes("BEGIN PRIVATE KEY")) {
      throw new Error(
        "FIREBASE_PRIVATE_KEY appears to be malformed. " +
        "Ensure it includes the full key with BEGIN/END markers."
      )
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    })

    console.log("✅ Firebase Admin initialized successfully")
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:")
    console.error(error.message)
    throw error
  }
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()

// Optional: Export the admin instance for other services
export default admin
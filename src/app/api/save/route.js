import { adminDb } from "@/lib/firebase-admin"

export async function POST(req) {
  try {
    const data = await req.json()

    await adminDb.collection("submissions").add({
      ...data,
      createdAt: new Date(),
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return new Response("Failed to save", { status: 500 })
  }
}

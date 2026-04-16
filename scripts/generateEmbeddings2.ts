import mongoose from 'mongoose'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

if (!MONGODB_URI || !OPENROUTER_API_KEY) {
  throw new Error('Missing environment variables')
}

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
})

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await client.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, {
  dbName: 'campusride'
})
    console.log('✅ Connected to MongoDB')

    // ✅ DEBUG: check DB name
    console.log('📦 DB name:', mongoose.connection.name)

    const db = mongoose.connection.db!
    const collection = db.collection('routeknowledge')

    // ✅ FETCH ALL DOCS (no filtering issues)
    const docs = await collection.find({}).toArray()

    console.log(`📄 Total docs found: ${docs.length}`)
    console.log('🧪 Sample doc:', docs[0])

    if (docs.length === 0) {
      console.log('❌ No documents found → WRONG DATABASE or COLLECTION')
      return
    }

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]

      // ✅ Skip if already embedded (optional but smart)
      if (doc.embedding && doc.embedding.length > 0) {
        console.log(`⏭️ Skipping ${i + 1} (already has embedding)`)
        continue
      }

      console.log(
        `🔄 Processing ${i + 1}/${docs.length}: ${doc.textSummary.slice(0, 60)}...`
      )

      const embedding = await generateEmbedding(doc.textSummary)

      await collection.updateOne(
        { _id: doc._id },
        { $set: { embedding } }
      )

      console.log(`✅ Saved embedding (${embedding.length} dimensions)`)

      // avoid rate limit
      await new Promise((r) => setTimeout(r, 300))
    }

    console.log('🎉 All embeddings generated successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

run()
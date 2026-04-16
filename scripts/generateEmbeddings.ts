import mongoose from 'mongoose'
import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

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
     await mongoose.connect(MONGODB_URI, {
   dbName: 'campusride'
 })
  console.log('Connected to MongoDB')

  const db = mongoose.connection.db!
  const collection = db.collection('triplogs')

  const logs = await collection.find({ embedding: [] }).toArray()
  console.log(`Found ${logs.length} logs without embeddings`)

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    console.log(`Processing ${i + 1}/${logs.length}: ${log.textSummary.slice(0, 60)}...`)

    const embedding = await generateEmbedding(log.textSummary)

    await collection.updateOne(
      { _id: log._id },
      { $set: { embedding } }
    )

    console.log(`  ✓ Embedding saved (${embedding.length} dimensions)`)

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('All embeddings generated successfully')
  await mongoose.disconnect()
}

run().catch(console.error)
import mongoose from 'mongoose'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
})

async function generateEmbedding(text: string): Promise<number[]> {
  const res = await client.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text,
  })
  return res.data[0].embedding
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!, {
    dbName: 'campusride',
  })

  const db = mongoose.connection.db!
  const collection = db.collection('routeknowledge')

  const query = "Which bus goes to canteen?"
  console.log("🔍 Query:", query)

  const queryEmbedding = await generateEmbedding(query)

  const results = await collection.aggregate([
  {
    $vectorSearch: {
      index: "schedule_vector_index",
      queryVector: queryEmbedding,
      path: "embedding",
      k: 3,
      numCandidates: 50   // ✅ ADD THIS LINE
    }
  }
]).toArray()

  console.log("\n✅ Results:\n")
  results.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.textSummary}\n`)
  })

  await mongoose.disconnect()
}

run().catch(console.error)
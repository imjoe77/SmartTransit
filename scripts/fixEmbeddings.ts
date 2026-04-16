import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!

async function run() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected')

  const sourceDB = mongoose.connection.useDb('smarttransit')
  const targetDB = mongoose.connection.useDb('campusride')

  const source = sourceDB.collection('triplogs')
  const target = targetDB.collection('triplogs')

  const logs = await source.find({}).toArray()
  console.log(`Found ${logs.length} logs in smarttransit`)

  for (const log of logs) {
    await target.updateOne(
      { textSummary: log.textSummary },
      { $set: { embedding: log.embedding } }
    )
  }

  console.log('Embeddings copied successfully ✅')
  await mongoose.disconnect()
}

run().catch(console.error)
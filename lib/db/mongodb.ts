import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

if (!globalCache.mongooseCache) {
  globalCache.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables");
  }

  const cache = globalCache.mongooseCache!;
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const opts: mongoose.ConnectOptions = {
      family: 4,
    };
    if (process.env.MONGODB_DB) {
      opts.dbName = process.env.MONGODB_DB;
    }
    
    cache.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

import { MongoClient } from 'mongodb'

// This is the connection string for the mongo database in our docker compose file
// We're using process.env to detect if a different mongo uri is set, primarily for testing purpuses
export const uri = (global as any).MONGO_URI as string ?? 'mongodb://mongo'

// We're setting up a client, opening the database for our project, and then opening
// a typed collection for our books.
export const client = new MongoClient(uri)

import { MongoClient, type Db } from 'mongodb';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (mongoDb && mongoClient) {
    return mongoDb;
  }

  const mongoUrl = process.env.MONGODB_URL || 'mongodb://admin:admin@localhost:27017';
  const dbName = process.env.MONGODB_DB || 'casa_amazonia';

  mongoClient = new MongoClient(mongoUrl);
  await mongoClient.connect();
  mongoDb = mongoClient.db(dbName);

  return mongoDb;
}

export async function closeMongoClient(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
  }
}


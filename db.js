import { MongoClient } from "mongodb";

const uri = "mongodb+srv://blaze619619:Omega619@cluster0.ehjhx1d.mongodb.net/";
const client = new MongoClient(uri);

export async function connectDB() {
  try {
    await client.connect();
    const db = client.db("sstat");
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

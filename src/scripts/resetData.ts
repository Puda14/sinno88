// npx tsx src/scripts/resetData.ts
import { MongoClient } from "mongodb";
import { mockPlayers } from "../mockData";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI!;
const dbName = "votingApp";

async function resetData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("players");

    await collection.deleteMany({});
    console.log("✅ Đã xoá dữ liệu cũ");

    await collection.insertMany(mockPlayers);
    console.log("✅ Đã thêm mock data mới");
  } catch (error) {
    console.error("❌ Lỗi khi reset data:", error);
  } finally {
    await client.close();
  }
}

resetData();

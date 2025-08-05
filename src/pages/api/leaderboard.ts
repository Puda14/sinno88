import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db("votingApp");
    const collection = db.collection("players");

    const players = await collection.find({}).sort({ votes: -1 }).toArray();

    res.status(200).json(players);
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

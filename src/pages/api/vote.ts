import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, name } = req.body;

  if (!id || !name || typeof name !== "string") {
    return res.status(400).json({ message: "Missing or invalid id/name" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("votingApp");
    const collection = db.collection("players");

    const objectId = new ObjectId(id);

    const result = await collection.updateOne(
      { _id: objectId, name },
      { $inc: { votes: 1 } }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Player not found or mismatched name/id" });
    }

    return res.status(200).json({ success: true, name });
  } catch (error) {
    console.error("❌ Error voting:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

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

  const { id, name, email } = req.body;

  if (!id || !name || !email || typeof name !== "string") {
    return res.status(400).json({ message: "Missing or invalid data" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("votingApp");

    const objectId = new ObjectId(id);

    // ✅ 1. Check if user is verified
    const user = await db.collection("votedUsers").findOne({ email });

    if (!user || !user.verified) {
      return res
        .status(403)
        .json({ message: "You must verify your email first" });
    }

    // ✅ 2. Check if user already voted
    if (user.playerId) {
      return res.status(403).json({ message: "You have already voted" });
    }

    // ✅ 3. Increase vote count
    const result = await db
      .collection("players")
      .updateOne({ _id: objectId }, { $inc: { votes: 1 } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    // ✅ 4. Save vote info ONLY after successful vote
    await db.collection("votedUsers").updateOne(
      { email },
      {
        $set: {
          playerId: id,
          votedAt: new Date(),
        },
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error voting:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ message: "Missing email or code" });

  const client = await clientPromise;
  const db = client.db("votingApp");

  const record = await db
    .collection("verificationCodes")
    .findOne({ email, code });

  if (!record) {
    return res.status(401).json({ message: "Invalid code" });
  }

  await db.collection("votedUsers").updateOne(
    { email },
    {
      $set: {
        email,
        name: record.name,
        verified: true,
        verifiedAt: new Date(),
      },
    },
    { upsert: true }
  );

  await db.collection("verificationCodes").deleteOne({ email });

  return res.status(200).json({ message: "Verified" });
}

import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name } = req.body;
  if (!email || !name)
    return res.status(400).json({ message: "Missing email or name" });

  const client = await clientPromise;
  const db = client.db("votingApp");

  const alreadyVoted = await db.collection("votedUsers").findOne({ email });
  if (alreadyVoted)
    return res.status(403).json({ message: "Email has already voted" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await db.collection("verificationCodes").updateOne(
    { email },
    {
      $set: {
        code,
        createdAt: new Date(),
        name,
      },
    },
    { upsert: true }
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Vote Verification Code",
      text: `Hello ${name}, your vote code is: ${code}`,
    });
    return res.status(200).json({ message: "Verification code sent" });
  } catch (err) {
    console.error("❌ Lỗi gửi email:", err);
    return res.status(500).json({ message: "Không gửi được email" });
  }
}

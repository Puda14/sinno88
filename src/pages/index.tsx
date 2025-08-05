import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmailPopup from "@/components/EmailPopup";

type Player = {
  _id?: string;
  name: string;
  votes: number;
  avatar: string | Blob | undefined;
};

const colors = [
  "#fef3c7", // amber-100
  "#e0f2fe", // sky-100
  "#ede9fe", // violet-100
  "#dcfce7", // green-100
  "#fce7f3", // pink-100
  "#fff7ed", // orange-100
  "#e2e8f0", // slate-100
  "#f3e8ff", // purple-100
  "#dbeafe", // blue-100
  "#fef2f2", // red-100
  "#ecfccb", // lime-100
  "#e0f2f1", // teal-100
  "#f0fdf4", // emerald-100
  "#f1f5f9", // zinc-100
  "#faf5ff", // indigo-100
  "#fdf2f8", // rose-100
  "#fef9c3", // yellow-100
];

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [pendingVote, setPendingVote] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, []);

  const vote = async (id: string, playerName: string) => {
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");

    if (!email || !name) {
      setPendingVote(id);
      setShowPopup(true);
      return;
    }

    setLoading(true);
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, email }),
    });
    await fetchLeaderboard();
    setLoading(false);
  };

  const nameRef = useRef("");

  const handleVerified = (verifiedEmail: string) => {
    localStorage.setItem("email", verifiedEmail);
    localStorage.setItem("name", nameRef.current || "");

    setShowPopup(false);

    if (pendingVote) {
      vote(pendingVote, "");
      setPendingVote(null);
    }
  };

  return (
    <>
      {" "}
      {showPopup && (
        <EmailPopup
          onVerified={(email, name) => {
            localStorage.setItem("email", email);
            localStorage.setItem("name", name);
            nameRef.current = name;
            setShowPopup(false);
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 20px",
          minHeight: "100vh",
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 32 }}>
          🏆 Sinno88 bet chủ nhiệm
        </h1>

        <div style={{ width: "100%", maxWidth: 400 }}>
          <AnimatePresence>
            {players.map((p, idx) => (
              <motion.div
                key={p._id}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: colors[idx % colors.length],
                  borderRadius: 12,
                  padding: "16px 24px",
                  marginBottom: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={typeof p.avatar === "string" ? p.avatar : ""}
                  alt={p.name}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: 16,
                    border: "2px solid #ccc",
                  }}
                />
                <div style={{ flexGrow: 1 }}>
                  <strong style={{ fontSize: 18 }}>
                    {idx + 1}. {p.name}
                  </strong>
                  <div style={{ fontSize: 15, color: "#666" }}>
                    {p.votes} votes 👍
                  </div>
                </div>
                <button
                  onClick={() => vote(p._id!, p.name)}
                  disabled={loading}
                  style={{
                    padding: "6px 14px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#fff",
                    background: "linear-gradient(to right, #6366f1, #3b82f6)", // indigo to blue
                    border: "none",
                    borderRadius: 999,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    opacity: loading ? 0.6 : 1,
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background =
                        "linear-gradient(to right, #4f46e5, #2563eb)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background =
                        "linear-gradient(to right, #6366f1, #3b82f6)";
                    }
                  }}
                >
                  Vote
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onVerified: (email: string, name: string) => void;
}

export default function EmailPopup({ onVerified }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Gửi mã thất bại");
      } else {
        setCodeSent(true);
      }
    } catch {
      setError("Lỗi mạng");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Mã không hợp lệ");
      } else {
        onVerified(email, name);
      }
    } catch {
      setError("Lỗi mạng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "#fff",
          width: "380px",
          maxWidth: "90%",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => onVerified("", "")}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#888",
          }}
          aria-label="Đóng"
        >
          &times;
        </button>

        <h2
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Xác thực email để vote 📨
        </h2>

        {!codeSent ? (
          <>
            <input
              type="text"
              placeholder="Tên của bạn"
              style={{
                width: "100%",
                padding: "10px 14px",
                marginBottom: 16,
                border: "1px solid #ccc",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email của bạn"
              style={{
                width: "100%",
                padding: "10px 14px",
                marginBottom: 16,
                border: "1px solid #ccc",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={sendCode}
              disabled={loading || !email || !name}
              style={{
                background: "#4f46e5",
                color: "#fff",
                padding: "10px",
                fontWeight: "bold",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#4338ca";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#4f46e5";
              }}
            >
              {loading ? "Đang gửi..." : "Gửi mã xác thực"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Nhập mã xác thực"
              style={{
                width: "100%",
                padding: "10px 14px",
                marginBottom: 16,
                border: "1px solid #ccc",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
              }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={verifyCode}
              disabled={loading || !code}
              style={{
                background: "#3b82f6",
                color: "#fff",
                padding: "10px",
                fontWeight: "bold",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#2563eb";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#3b82f6";
              }}
            >
              {loading ? "Đang xác thực..." : "Xác nhận"}
            </button>
          </>
        )}

        {error && (
          <p
            style={{
              color: "red",
              marginTop: 16,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </motion.div>
    </div>
  );
}

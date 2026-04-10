import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type CloudResult = {
  name: string;
  emoji: string;
  altitude: string;
  description: string;
  traits: string[];
};

export default function Home() {
  const [result, setResult]   = useState<CloudResult | null>(null);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Read the user and quiz result from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.username) setUsername(user.username);

    const stored = localStorage.getItem("quizResult");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, [navigate]);

  const handleTakeQuiz = () => navigate("/quiz");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("quizResult");
    navigate("/login");
  };

  return (
    <div style={containerStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <span style={{ color: "#7aa2e3", fontWeight: 600, fontSize: "1rem" }}>
          Hey, {username || "there"} 👋
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/friends")} style={navBtnStyle}>Friends</button>
          <button onClick={handleLogout} style={navBtnStyle}>Log out</button>
        </div>
      </div>

      {/* Main content */}
      {result ? (
        // ── Result card ──────────────────────────────────────────────────────
        <div style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "4rem" }}>{result.emoji}</span>
            <h1 style={{ color: "#7aa2e3", fontWeight: 700, margin: "8px 0 2px" }}>
              {result.name}
            </h1>
            <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>{result.altitude}</p>
          </div>

          <p style={{ color: "#444", lineHeight: 1.7, marginBottom: "20px" }}>
            {result.description}
          </p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
            {result.traits.map((trait) => (
              <span key={trait} style={traitBadgeStyle}>
                {trait}
              </span>
            ))}
          </div>

          <button onClick={handleTakeQuiz} style={retakeBtnStyle}>
            Retake quiz
          </button>
        </div>
      ) : (
        // ── No result yet ─────────────────────────────────────────────────────
        <div style={cardStyle}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "4rem" }}>🌤</span>
            <h2 style={{ color: "#7aa2e3", fontWeight: 600, margin: "16px 0 8px" }}>
              What kind of cloud are you?
            </h2>
            <p style={{ color: "#666", marginBottom: "24px" }}>
              Take the quiz to discover your cloud personality.
            </p>
            <button onClick={handleTakeQuiz} style={retakeBtnStyle}>
              Take the quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const containerStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#ACDFFA",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px",
};

const topBarStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
};

const navBtnStyle: React.CSSProperties = {
  padding: "6px 16px",
  backgroundColor: "#f8f9fa",
  border: "2px solid #7aa2e3",
  borderRadius: "20px",
  color: "#7aa2e3",
  fontWeight: 500,
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  backgroundColor: "#f8f9fa",
  borderRadius: "20px",
  border: "6px solid #7aa2e3",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  padding: "32px",
};

const traitBadgeStyle: React.CSSProperties = {
  backgroundColor: "#d6eaff",
  color: "#4a7cc7",
  borderRadius: "20px",
  padding: "4px 14px",
  fontSize: "0.85rem",
  fontWeight: 500,
};

const retakeBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#7aa2e3",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: 500,
  cursor: "pointer",
};

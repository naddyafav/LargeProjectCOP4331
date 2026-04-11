import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5050";

type Option = {
  label: string;
  points: {
    dreamer?: number;
    energy?: number;
    warmth?: number;
    daring?: number;
  };
};

type Question = {
  _id: string;
  order: number;
  text: string;
  options: Option[];
};

type Scores = {
  dreamer: number;
  energy: number;
  warmth: number;
  daring: number;
};

export default function Quiz() {
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [current, setCurrent]       = useState(0);
  const [scores, setScores]         = useState<Scores>({ dreamer: 0, energy: 0, warmth: 0, daring: 0 });
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const navigate = useNavigate();

  // ── Fetch questions on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API}/quiz/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          setQuestions(data.questions);
        } else {
          setError(data.error || "Failed to load questions.");
        }
      })
      .catch(() => setError("Server error. Try again later."))
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── Handle answer selection ───────────────────────────────────────────────
  const handleAnswer = async (option: Option) => {
    // Accumulate axis points from the chosen option
    const newScores: Scores = {
      dreamer: scores.dreamer + (option.points.dreamer || 0),
      energy:  scores.energy  + (option.points.energy  || 0),
      warmth:  scores.warmth  + (option.points.warmth  || 0),
      daring:  scores.daring  + (option.points.daring  || 0),
    };

    // If there are more questions, advance to the next slide
    if (current < questions.length - 1) {
      setScores(newScores);
      setCurrent((prev) => prev + 1);
      return;
    }

    // Last question answered — submit to the server
    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scores: newScores }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save the full result profile to localStorage so Home can read it
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.personalityType = data.result.name;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("quizResult", JSON.stringify(data.result));
        navigate("/home");
      } else {
        setError(data.error || "Submission failed.");
        setSubmitting(false);
      }
    } catch {
      setError("Server error. Try again later.");
      setSubmitting(false);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#fff", fontSize: "1.2rem" }}>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (submitting) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#fff", fontSize: "1.2rem" }}>Finding your cloud...</p>
      </div>
    );
  }

  const question = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <div style={containerStyle}>
      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: "560px", marginBottom: "12px" }}>
        <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "3px" }}>
          <div
            style={{
              height: "6px",
              width: `${progress}%`,
              backgroundColor: "#fff",
              borderRadius: "3px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", marginTop: "4px", textAlign: "right" }}>
          {current + 1} / {questions.length}
        </p>
      </div>

      {/* Question card */}
      <div style={cardStyle}>
        <h2 style={{ color: "#7aa2e3", fontWeight: 600, marginBottom: "24px", lineHeight: 1.4 }}>
          {question.text}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              style={optionButtonStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7aa2e3";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#e9ecef";
                (e.currentTarget as HTMLButtonElement).style.color = "#333";
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
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
  justifyContent: "center",
  padding: "24px",
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

const optionButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  backgroundColor: "#e9ecef",
  border: "none",
  borderRadius: "12px",
  fontSize: "1rem",
  textAlign: "left",
  cursor: "pointer",
  color: "#333",
  transition: "background-color 0.15s ease, color 0.15s ease",
};

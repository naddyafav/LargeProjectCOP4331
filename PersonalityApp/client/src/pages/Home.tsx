import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function Home() {

  type User = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    friends: any[];
  };

  type CloudResult = {
    name: string;
    emoji: string;
    altitude: string;
    description: string;
    traits: string[];
  };

  const [userData, setUserData] = useState<User | null>(null);
  const [result, setResult]   = useState<CloudResult | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const goToQuiz = () => { navigate("/quiz"); };
  const goToFriends = () => { navigate("/friends"); };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const stored = localStorage.getItem("quizResult");
    if (stored) {
      setResult(JSON.parse(stored));
    }
    
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://104.236.41.135:5050/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data);
        } else {
          setError(data.error || "Failed to fetch user");
        }
      } catch (err) {
        console.error(err);
        setError("Server error. Try again later.");
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="page-center page-sky">
      <Clouds />

      {/* Personality Card */}
      <div className="card-large">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "4rem" }}>{result.emoji}</span>
          <h1 style={{ color: "#7aa2e3", fontWeight: 700, margin: "8px 0 2px" }}> {result.name} </h1>
          <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>{result.altitude}</p>
        </div>

        <p style={{ color: "#444", lineHeight: 1.7, marginBottom: "20px" }}> {result.description} </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          {result.traits.map((trait) => (
            <span key={trait} className="trait-style">
              {trait}
            </span>
          ))}
        </div>
        <button onClick={goToQuiz} className="button">Retake Quiz</button>
      </div>
          
      {/* Card */}
      <div className="card">
        <div className="text-center mb-4">
          <h2 className="page-header">Profile</h2>
        </div>

        <div className="page-text">
          <p><strong>First Name:</strong> {userData?.firstName}</p>
          <p><strong>Last Name:</strong> {userData?.lastName}</p>
          <p><strong>Username:</strong> {userData?.username}</p>
          <p><strong>Email:</strong> {userData?.email}</p>
          <p><strong>Friends:</strong> {userData?.friends}</p>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
            gap: "10px"
          }}
        >
          <button onClick={handleLogout} className="button">Logout</button>
          <button onClick={goToFriends} className="button">Friends</button>
        </div>
      </div>
    </div>
  );
}
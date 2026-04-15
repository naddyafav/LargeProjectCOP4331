import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";
import { getProfileByName, CloudProfile } from "../data/cloudProfiles";

export default function Home() {

  type User = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    friends: any[];
  };

  const [userData, setUserData] = useState<User | null>(null);
  const [result, setResult] = useState<CloudProfile | null>(null);
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
          if (data.personalityType) {
            const profile = getProfileByName(data.personalityType);
            setResult(profile);
          }
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
    <div className="page-center page-sky" style={{ flexDirection: "column" }}>
      <Clouds />

      {/* PAGE TITLE */}
      <div style={{ textAlign: "center", marginBottom: "20px", zIndex: 1 }}>
        <h1
          className="page-title"
          style={{
            display: "inline-block",
            backgroundColor: "#f8f9fa",
            border: "6px solid #7aa2e3",
            borderRadius: "50px",
            padding: "10px 32px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            margin: 0,
          }}
        >
          Welcome, {userData?.firstName}
        </h1>
      </div>

      <div className="card-row">

        {/* Profile Card: Left */}
        <div className="card">
          <div className="text-center mb-4">
            <h2 className="page-header">Profile</h2>
          </div>

          <div className="page-text">
            <p><strong>First Name:</strong> {userData?.firstName}</p>
            <p><strong>Last Name:</strong> {userData?.lastName}</p>
            <p><strong>Username:</strong> {userData?.username}</p>
            <p><strong>Email:</strong> {userData?.email}</p>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button onClick={handleLogout} className="button">Logout</button>
        </div>

        {/* Personality Card: Middle */}
        {result ? (
          <div className="card-large">
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "4rem" }}>{result.emoji}</span>
              <h1 style={{ color: "#7aa2e3", fontWeight: 700, margin: "8px 0 2px" }}>{result.name}</h1>
              <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>{result.altitude}</p>
            </div>

            <p style={{ color: "#444", lineHeight: 1.7, marginBottom: "20px" }}>{result.description}</p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
              {result.traits.map((trait) => (
                <span key={trait} className="trait-style">
                  {trait}
                </span>
              ))}
            </div>

            <button onClick={goToQuiz} className="button">Retake Quiz</button>
          </div>
        ) : (
          <div className="card-large" style={{textAlign: "center"}}>
            <p className="page-header">No Quiz Results Yet.</p>
            <button onClick={goToQuiz} className="button">Take Quiz</button>
          </div>
        )}
        
        {/* Friends Card: Right */}
        <div className="card">
          <div>
            <div className="text-center mb-4">
              <h2 className="page-header">Current Friends</h2>
            </div>

            {userData?.friends.length ? (
              <ul className="friends-list">
                {userData.friends.map((friend) => (
                  <li key={friend._id} className="friend-item">
                    {friend.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card-status">No Friends Yet.</p>
            )}
          </div>
            <button onClick={goToFriends} className="button">Find Friends</button>
        </div>
      </div>
    </div>
  );
}

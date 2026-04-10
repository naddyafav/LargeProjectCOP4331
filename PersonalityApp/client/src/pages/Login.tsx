import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://104.236.41.135:5050/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    }
  };

  const inputStyle = { backgroundColor: "#e9ecef", border: "none" };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ width: "100%", height: "100vh", backgroundColor: "#ACDFFA", position: "relative", overflow: "hidden" }}
    >
      
      <Clouds />

      {/* Card */}
      <div
        className="p-4"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#f8f9fa",
          borderRadius: "20px",
          border: "6px solid #7aa2e3",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          zIndex: 1,
        }}
      >
        <div className="text-center mb-4">
          <div
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: "#7aa2e3",
              borderRadius: "50%",
              margin: "0 auto",
            }}
          ></div>
          <h2 style={{ color: "#7aa2e3", fontWeight: 600 }}>Login</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              className="form-control"
              required
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#7aa2e3", color: "white", fontWeight: 500 }}
          >
            Login
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Don't have an account?{" "}
          <a href="/registration" style={{ color: "#7aa2e3" }}>
            Register Now!
          </a>
        </p>
      </div>
    </div>
  );
}
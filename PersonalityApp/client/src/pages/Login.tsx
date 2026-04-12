import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/login", {
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

      // Store token and redirect
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/login"; // change to your route
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { backgroundColor: "#e9ecef", border: "none" };

  return (
    <div className="page-center page-sky" style={{ flexDirection: "column" }}>
      <Clouds />

      {/* PAGE TITLE */}
      <div style={{ textAlign: "center", marginBottom: "20px", zIndex: "1" }}>
        <h1 className="page-title">Personality Connect!</h1>
      </div>

      <div className="card">
        <div className="text-center mb-4">
          <h2 className="page-header">Login</h2>
        </div>

          <form onSubmit={handleLogin}>
            <label className="field-label">Username</label>
            <input
              className="login-input"
              type="text"
              placeholder="Enter Username here..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />

            <label className="field-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter Password here..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" className="button">
            Login
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Don't have an account?{" "}
          <a href="/registration" className="link-color">
            Register Now!
          </a>
        </p>
      </div>
    </>
  );
}

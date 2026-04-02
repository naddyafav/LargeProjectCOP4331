import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // for redirect after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Placeholder login logic
    if (email === "test@example.com" && password === "password") {
      setError("");
      // Redirect to Home or Quiz page
      navigate("/home");
    } else {
      setError("Invalid email or password");
    }

    // Later: call backend API
    // const response = await fetch("/api/login", { method: "POST", body: JSON.stringify({ email, password }) })
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
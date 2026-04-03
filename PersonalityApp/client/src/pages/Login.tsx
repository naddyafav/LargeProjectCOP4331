import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // for redirect after login

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        //const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch("http://localhost:5050/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
        });

        const data = await response.json();

        if (response.ok) {
        // Save token
        localStorage.setItem("token", data.token);

        // store user info
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect
        navigate("/home");
        } else {
        // Handle backend errors
        setError(data.error || "Login failed");
        }
    } catch (err) {
        console.error(err);
        setError("Server error. Try again later.");
    }
    };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label><br />
          <input
            type="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
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
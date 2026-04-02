import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Nunito:wght@400;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .login-page {
    min-height: 100vh;
    background-color: #87CEEB;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Nunito', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Cloud styles */
  .cloud {
    position: absolute;
    background: white;
    border-radius: 50%;
  }

  .cloud::before,
  .cloud::after {
    content: '';
    position: absolute;
    background: white;
    border-radius: 50%;
  }

  .cloud-1 {
    width: 160px;
    height: 100px;
    top: 2%;
    left: 28%;
    border-radius: 100px;
    animation: float 8s ease-in-out infinite;
  }
  .cloud-1::before {
    width: 100px;
    height: 90px;
    top: -40px;
    left: 15px;
  }
  .cloud-1::after {
    width: 80px;
    height: 70px;
    top: -25px;
    right: 20px;
  }

  .cloud-2 {
    width: 130px;
    height: 80px;
    top: 3%;
    left: 38%;
    border-radius: 100px;
    animation: float 10s ease-in-out infinite 1s;
  }
  .cloud-2::before {
    width: 80px;
    height: 70px;
    top: -35px;
    left: 20px;
  }
  .cloud-2::after {
    width: 60px;
    height: 55px;
    top: -20px;
    right: 15px;
  }

  .cloud-3 {
    width: 150px;
    height: 90px;
    top: 8%;
    left: 55%;
    border-radius: 100px;
    animation: float 9s ease-in-out infinite 2s;
  }
  .cloud-3::before {
    width: 90px;
    height: 80px;
    top: -38px;
    left: 18px;
  }
  .cloud-3::after {
    width: 70px;
    height: 60px;
    top: -22px;
    right: 18px;
  }

  .cloud-4 {
    width: 120px;
    height: 75px;
    top: 35%;
    left: -2%;
    border-radius: 100px;
    animation: float 11s ease-in-out infinite 0.5s;
  }
  .cloud-4::before {
    width: 75px;
    height: 65px;
    top: -30px;
    left: 15px;
  }
  .cloud-4::after {
    width: 55px;
    height: 50px;
    top: -18px;
    right: 12px;
  }

  .cloud-5 {
    width: 170px;
    height: 100px;
    top: 30%;
    right: -2%;
    border-radius: 100px;
    animation: float 7s ease-in-out infinite 1.5s;
  }
  .cloud-5::before {
    width: 100px;
    height: 90px;
    top: -42px;
    left: 20px;
  }
  .cloud-5::after {
    width: 80px;
    height: 70px;
    top: -28px;
    right: 22px;
  }

  .cloud-6 {
    width: 140px;
    height: 85px;
    bottom: 12%;
    left: 18%;
    border-radius: 100px;
    animation: float 9s ease-in-out infinite 3s;
  }
  .cloud-6::before {
    width: 85px;
    height: 75px;
    top: -36px;
    left: 18px;
  }
  .cloud-6::after {
    width: 65px;
    height: 58px;
    top: -22px;
    right: 16px;
  }

  .cloud-7 {
    width: 130px;
    height: 80px;
    bottom: 8%;
    left: 35%;
    border-radius: 100px;
    animation: float 8s ease-in-out infinite 2.5s;
  }
  .cloud-7::before {
    width: 80px;
    height: 70px;
    top: -33px;
    left: 16px;
  }
  .cloud-7::after {
    width: 60px;
    height: 52px;
    top: -20px;
    right: 14px;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }

  /* Card */
  .login-card {
    background: white;
    border-radius: 20px;
    border: 2.5px solid #a8c8f0;
    padding: 2rem 2.5rem 2.2rem;
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 10;
    box-shadow: 0 8px 32px rgba(100, 160, 220, 0.15);
    animation: cardIn 0.6s ease both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Avatar icon */
  .avatar-circle {
    width: 64px;
    height: 64px;
    background: #7eb8e8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.6rem;
  }

  .avatar-circle svg {
    width: 34px;
    height: 34px;
    fill: white;
  }

  /* Title */
  .login-title {
    font-family: 'Lora', serif;
    font-weight: 700;
    font-size: 2rem;
    color: #5b9bd5;
    text-align: center;
    margin-bottom: 1.3rem;
  }

  /* Labels */
  .field-label {
    font-family: 'Lora', serif;
    font-weight: 600;
    font-size: 1rem;
    color: #6aaee0;
    margin-bottom: 0.35rem;
    display: block;
  }

  /* Inputs */
  .login-input {
    width: 100%;
    background: #d9d9d9;
    border: none;
    border-radius: 6px;
    padding: 0.6rem 0.9rem;
    font-family: 'Nunito', sans-serif;
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 1.1rem;
    outline: none;
    transition: box-shadow 0.2s;
  }

  .login-input:focus {
    box-shadow: 0 0 0 2.5px #7eb8e8;
    background: #e8e8e8;
  }

  .login-input::placeholder {
    color: #888;
  }

  /* Button */
  .login-btn {
    width: 100%;
    background: #7eb8e8;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.65rem;
    font-family: 'Nunito', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 0.3rem;
    margin-bottom: 0.9rem;
    transition: background 0.2s, transform 0.1s;
  }

  .login-btn:hover {
    background: #5b9bd5;
  }

  .login-btn:active {
    transform: scale(0.98);
  }

  .login-btn:disabled {
    background: #aac8e8;
    cursor: not-allowed;
  }

  /* Register link */
  .register-text {
    text-align: center;
    font-family: 'Nunito', sans-serif;
    font-size: 0.92rem;
    color: #333;
    font-weight: 700;
  }

  .register-link {
    color: #5b9bd5;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }

  .register-link:hover {
    text-decoration: underline;
  }

  /* Error message */
  .error-msg {
    color: #e05b5b;
    font-size: 0.85rem;
    text-align: center;
    margin-bottom: 0.7rem;
    font-family: 'Nunito', sans-serif;
  }
`;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
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

      if (!response.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      // Store token and redirect
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard"; // change to your route
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        {/* Clouds */}
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />
        <div className="cloud cloud-5" />
        <div className="cloud cloud-6" />
        <div className="cloud cloud-7" />

        {/* Login Card */}
        <div className="login-card">
          {/* Avatar */}
          <div className="avatar-circle">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>

          <h1 className="login-title">Login</h1>

          {error && <p className="error-msg">{error}</p>}

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

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="register-text">
            Don't have an account?{" "}
            <a className="register-link" href="/register">
              Register Now!
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
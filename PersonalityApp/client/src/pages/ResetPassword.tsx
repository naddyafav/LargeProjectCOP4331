import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function ResetPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://104.236.41.135:5050/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          newPassword: form.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message ||
            "Password reset successfully."
        );
        setError("");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.error || "Password reset failed.");
        setMessage("");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
      setMessage("");
    }
  };

  const inputStyle = { backgroundColor: "#e9ecef", border: "none" };

  return (
    <div className="page-center page-sky">
      <Clouds />

      <div className="card">
        <div className="text-center mb-4">
          <h2 className="page-header">Reset Password</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="newPassword"
            name="newPassword"
            placeholder="New Password"
            className="form-control mb-3"
            style={inputStyle}
            onChange={handleChange}
            required
          />

          {message && (
            <div style={{ color: "green", marginBottom: "1rem" }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ color: "red", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <button className="button">Reset Password</button>
        </form>
      </div>
    </div>
  );
}
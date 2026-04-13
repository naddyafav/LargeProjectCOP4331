import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function Registration() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.first,
          lastName: form.last,
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message ||
            "User registered successfully. Please check your email to verify your account."
        );
        setError("");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.error || "Registration failed.");
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
          <h2 className="page-header">Registration</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="d-flex gap-2 mb-3">
            <input
              type="text"
              name="first"
              placeholder="First Name"
              className="form-control"
              style={inputStyle}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last"
              placeholder="Last Name"
              className="form-control"
              style={inputStyle}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control mb-3"
            style={inputStyle}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="form-control mb-3"
            style={inputStyle}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            className="form-control mb-4"
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

          <button className="button">Register</button>
        </form>

        <p className="text-center mt-3 mb-0">
          Have an account?{" "}
          <a href="/login" className="link-color">
            Login Now!
          </a>
        </p>
      </div>
    </div>
  );
}

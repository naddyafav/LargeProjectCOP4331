import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
    const response = await fetch("http://104.236.41.135:5050/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.first,
        lastName: form.last,
        email: form.email,
        username: form.username,
        password: form.password,
      }),
    });

    const data = await response.json();
    console.log("Data from API:", data);

    if (response.ok) {
      // Show success message
      setMessage(data.message);
      setError(""); // clear previous errors if any

      // Optionally redirect after a few seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000); // wait 3 seconds so user sees the message
    } else {
      // Show error returned by API
      setError(data.error || "Registration failed");
      setMessage("");
    }
  } catch (err) {
    console.error(err);
    setError("Server error. Try again later.");
    setMessage("");
  }
};

  const inputStyle = {
    backgroundColor: "#e9ecef",
    border: "none",
  };

  // Generate clouds only once when component mounts
  const clouds = useMemo(() => {
    const cloudImages = ["/cloud1.png", "/cloud2.png", "/cloud3.png"];
    return [...Array(6)].map((_, i) => {
      const src = cloudImages[Math.floor(Math.random() * cloudImages.length)];
      // Randomly choose direction left→right or right→left
      const direction = Math.random() < 0.5 ? "left" : "right";
      return {
        key: i,
        src,
        style: {
          position: "absolute" as const,
          top: `${Math.random() * 50 + 5}%`,
          left: direction === "left" ? "-200px" : "120vw",
          width: `${300 + Math.random() * 100}px`,
          animation: direction === "left"
            ? `floatCloudLR ${20 + Math.random() * 20}s linear ${Math.random() * 10}s infinite`
            : `floatCloudRL ${20 + Math.random() * 20}s linear ${Math.random() * 10}s infinite`,
          opacity: 0.7 + Math.random() * 0.3,
          zIndex: 0,
        },
      };
    });
  }, []);

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: "#2F344B",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ☁️ CLOUDS */}
      {clouds.map((cloud) => (
        <img key={cloud.key} src={cloud.src} style={cloud.style} />
      ))}

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes floatCloudLR {
            0% { transform: translateX(0); }
            100% { transform: translateX(120vw); }
          }

          @keyframes floatCloudRL {
            0% { transform: translateX(0); }
            100% { transform: translateX(-120vw); }
          }
        `}
      </style>

      {/* CARD */}
      <div
        className="p-4"
        style={{
          width: "420px",
          backgroundColor: "#f8f9fa",
          borderRadius: "20px",
          border: "6px solid #7aa2e3",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <div className="text-center mb-2">
          <div
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: "#000000",
              borderRadius: "50%",
              margin: "0 auto",
            }}
          ></div>
        </div>

        {/* Title */}
        <h2
          className="text-center mb-4"
          style={{ color: "#7aa2e3", fontWeight: "600" }}
        >
          Register
        </h2>

        <form onSubmit={handleSubmit}>
          {/* First + Last */}
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

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control mb-3"
            style={inputStyle}
            onChange={handleChange}
            required
          />

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="form-control mb-3"
            style={inputStyle}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            className="form-control mb-4"
            style={inputStyle}
            onChange={handleChange}
            required
          />

          {message && <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>}
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

          {/* Button */}
          <button
            className="btn w-100"
            style={{
              backgroundColor: "#000000",
              color: "white",
              fontWeight: "500",
            }}
          >
            Register
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-3 mb-0">
          Have an account?{" "}
          <a href="/login" style={{ color: "#7aa2e3" }}>
            Login Now!
          </a>
        </p>
      </div>
    </div>
  );
}
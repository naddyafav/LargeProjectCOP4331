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

    if (response.ok) {
      console.log("Response if ok.");
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

  const inputStyle = { backgroundColor: "#e9ecef", border: "none" };

  // === Initial clouds (one-time) ===
  const initialClouds = useMemo(() => {
    const cloudImages = ["/cloud1.png", "/cloud2.png", "/cloud3.png"];
    const totalInitial = 10; // number of clouds to appear immediatel

    // Generate evenly spaced horizontal positions
    const horizontalPositions = [0.02, 0.08, 0.13, 0.25, 0.38, 0.43, 0.615, 0.76, 0.91, 0.97];

    // Generate random vertical positions
    const verticalPositions = [0.48, 0.05, 0.82, 0.27, 0.66, 0.98, 0.73, 0.1, 0.5, 0.89];

    let lastIndex = -1;

    const getRandomCloud = () => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * cloudImages.length);
      } while (newIndex === lastIndex);
      lastIndex = newIndex;
      return cloudImages[newIndex];
    };

    return Array.from({ length: totalInitial }).map((_, i) => {
      const src = getRandomCloud();
      const direction = Math.random() < 0.5 ? "left" : "right";

      // Cloud size factor: 0 → 1
      const sizeFactor = Math.random();
      const width = 100 + sizeFactor * 400; // 100px → 500px
      const duration = 80 - sizeFactor * 40; // 80s → 20s
      const opacity = 0.4 + sizeFactor * 0.6; // 0.4 → 1.0
      const top = verticalPositions[i] * 100;
      const left = horizontalPositions[i] * 100;

      const animation = direction === "left"
        ? `floatCloudLR ${duration}s linear forwards`
        : `floatCloudRL ${duration}s linear forwards`;

      return {
        key: `initial-${i}`,
        src,
        style: {
          position: "absolute" as const,
          top: `${top}%`,
          width: `${width}px`,
          left: `${left}%`,
          animation: animation,
          opacity,
          zIndex: 0,
        },
      };
    });
  }, []);

  // === Continuous clouds (loops forever) ===
  const loopingClouds = useMemo(() => {
    const cloudImages = ["/cloud1.png", "/cloud2.png", "/cloud3.png"];
    const totalLoop = 15;

    let lastIndex = -1;

    const getRandomCloud = () => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * cloudImages.length);
      } while (newIndex === lastIndex);
      lastIndex = newIndex;
      return cloudImages[newIndex];
    };

    return Array.from({ length: totalLoop }).map((_, i) => {
      const src = getRandomCloud();
      const direction = Math.random() < 0.5 ? "left" : "right";

      // Cloud size factor: 0 → 1
      const sizeFactor = Math.random();
      const width = 100 + sizeFactor * 400; // 100px → 500px
      const duration = 80 - sizeFactor * 40; // 80s → 20s
      const delay = Math.random() * 10;
      const opacity = 0.4 + sizeFactor * 0.6; // 0.4 → 1.0
      const top = 0 + Math.random() * 80;
      const left = direction === "left" ? `-${width + 50}px` : `calc(100vw + 50px)`;

      const animation = direction === "left"
        ? `floatCloudLR ${duration}s linear ${delay}s infinite`
        : `floatCloudRL ${duration}s linear ${delay}s infinite`;

      return {
        key: `loop-${i}`,
        src,
        style: { 
          position: "absolute", 
          top: `${top}%`, 
          width: `${width}px`, 
          left,
          animation, 
          opacity, 
          zIndex: 0 
        },
      };
    });
  }, []);

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ width: "100%", height: "100vh", backgroundColor: "#2F344B", position: "relative", overflow: "hidden" }}
    >
      {/* Clouds */}
      {initialClouds.map((initialCloud) => (<img key={initialCloud.key} src={initialCloud.src} style={initialCloud.style} />))}
      {loopingClouds.map((loopingCloud) => (<img key={loopingCloud.key} src={loopingCloud.src} style={loopingCloud.style} />))}

      <style>
        {`
          @keyframes floatCloudLR {
            0%   { transform: translateX(0); }
            100% { transform: translateX(calc(100vw + 500px)); } /* ensures fully crosses screen */
          }

          @keyframes floatCloudRL {
            0%   { transform: translateX(0); }
            100% { transform: translateX(calc(-100vw - 500px)); }
          }
        `}
      </style>

      {/* CARD */}
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
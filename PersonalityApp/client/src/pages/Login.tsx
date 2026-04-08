import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
        localStorage.setItem("user", JSON.stringify(data.user));
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

  // Generate clouds once
  const clouds = useMemo(() => {
    const cloudImages = ["/cloud1.png", "/cloud2.png", "/cloud3.png"];

    let lastIndex = -1; // persists across cloud generation

    const getRandomCloud = () => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * cloudImages.length);
      } while (newIndex === lastIndex);

      lastIndex = newIndex;
      return cloudImages[newIndex];
    };

    return [...Array(10)].map((_, i) => {
      const src = getRandomCloud();
      const direction = Math.random() < 0.5 ? "left" : "right";
      const width = 300 + Math.random() * 100;

      // Full vertical range
      const top = Math.random() * 98;

      // First few clouds = visible immediately
      const isInitial = i < 4;

      return {
        key: i,
        src,
        style: {
          position: "absolute" as const,
          top: `${top}%`,
          width: `${width}px`,

          // Initial clouds start ON screen
          left: isInitial
            ? `${Math.random() * 100}%`
            : direction === "left"
            ? "-300px"
            : "100vw",

          // Initial clouds move immediately, others stagger in
          animation:
            direction === "left"
              ? `floatCloudLR ${30 + Math.random() * 20}s linear ${
                  isInitial ? 0 : Math.random() * 10
                }s infinite`
              : `floatCloudRL ${30 + Math.random() * 20}s linear ${
                  isInitial ? 0 : Math.random() * 10
                }s infinite`,

          opacity: 0.7 + Math.random() * 0.3,
          zIndex: 0,
        },
      };
    });
  }, []);

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ width: "100%", height: "100vh", backgroundColor: "#ACDFFA", position: "relative", overflow: "hidden" }}
    >
      {/* Clouds */}
      {clouds.map((cloud) => (
        <img key={cloud.key} src={cloud.src} style={cloud.style} />
      ))}

      <style>
        {`
          @keyframes floatCloudLR {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(140vw); /* move across entire screen */
            }
          }

          @keyframes floatCloudRL {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-140vw);
            }
          }
        `}
      </style>

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
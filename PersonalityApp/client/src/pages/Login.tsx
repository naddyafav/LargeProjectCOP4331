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

  // === Initial clouds (one-time) ===
  const initialClouds = useMemo(() => {
    const cloudImages = ["/cloud1.png", "/cloud2.png", "/cloud3.png"];
    const totalInitial = 6; // number of clouds to appear immediately

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

      // Cloud size factor: 0 → 1
      const sizeFactor = Math.random();
      const width = 150 + sizeFactor * 350; // 150px → 500px
      const duration = 60 - sizeFactor * 30; // 60s → 30s
      const opacity = 0.4 + sizeFactor * 0.6; // 0.4 → 1.0

      // Vertical position (0% → 100%)
      const verticalMargin = 0; // optional margin to avoid edges
      const top = verticalMargin * 100 + Math.random() * (100 - verticalMargin * 200);

      const left = 20 + Math.random() * 60; // 0% → 100%

      return {
        key: `initial-${i}`,
        src,
        style: {
          position: "absolute" as const,
          top: `${top}%`,
          width: `${width}px`,
          left: `${left}%`,
          animation: `floatCloudLR ${duration}s linear forwards`, // forwards so it disappears
          opacity,
          zIndex: 0,
        },
      };
    });
  }, []);

  // === Continuous clouds (loops forever) ===
  const loopingClouds = useMemo(() => {
    const cloudImages = ["/cloud1.png", "/cloud2.png", "/cloud3.png"];
    const totalLoop = 10;

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
      const width = 150 + sizeFactor * 350; // 150px → 500px
      const duration = 60 - sizeFactor * 30; // 60s → 30s
      const opacity = 0.4 + sizeFactor * 0.6; // 0.4 → 1.0

      // Vertical position (0% → 100%)
      const verticalMargin = 0; // optional margin to avoid edges
      const top = verticalMargin * 100 + Math.random() * (100 - verticalMargin * 200);

      const left = direction === "left" ? `-${width + 50}px` : `calc(100vw + 50px)`;

      const animation = direction === "left"
        ? `floatCloudLR ${duration}s linear infinite`
        : `floatCloudRL ${duration}s linear infinite`;

      return {
        key: `loop-${i}`,
        src,
        style: { position: "absolute", top: `${top}%`, width: `${width}px`, left, animation, opacity, zIndex: 0 },
      };
    });
  }, []);

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ width: "100%", height: "100vh", backgroundColor: "#ACDFFA", position: "relative", overflow: "hidden" }}
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
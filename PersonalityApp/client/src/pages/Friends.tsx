//import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function Friends() {

  const navigate = useNavigate();
  const goToHome = () => { navigate("/home"); };

  return (
    <div className="page-center page-sky" style={{ flexDirection: "column" }}>
      
      <Clouds />

      <div style={{ textAlign: "center", marginBottom: "20px", zIndex: 1 }}>
        <h1 className="page-title">Friends</h1>
      </div>

      <div className="card-row">

        <div className="card">
          <h2 className="page-header">Current Friends</h2>
          <p>No friends loaded yet.</p>
        </div>

        <div className="card">
          <h2 className="page-header">Recommended Friends</h2>
          <p>No recommendations yet.</p>
        </div>

        <div className="card">
          <h2 className="page-header">Search Friends</h2>

          <input
            type="text"
            placeholder="Search users..."
            className="input"
          />

          <button className="button">Search</button>
        </div>

      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={goToHome} className="button">
          Home
        </button>
      </div>

    </div>
  );
}

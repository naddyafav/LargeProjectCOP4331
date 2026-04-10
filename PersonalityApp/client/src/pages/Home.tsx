import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function Home() {

  const [editingField, setEditingField] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    username: "Ben123",
    email: "ben@example.com",
  });

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ width: "100%", height: "100vh", backgroundColor: "#ACDFFA", position: "relative", overflow: "hidden" }}
    >
      
      <Clouds />

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
          <h2 style={{ color: "#7aa2e3", fontWeight: 600 }}>Profile</h2>
        </div>

        <div className="profile-card">
          {Object.entries(userData).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <strong>{key}:</strong>{" "}

              {editingField === key ? (
                <input
                  value={value}
                  onChange={(e) =>
                    setUserData({ ...userData, [key]: e.target.value })
                  }
                />
              ) : (
                <span>{value}</span>
              )}

              <button
                onClick={() =>
                  setEditingField(editingField === key ? null : key)
                }
                style={{ marginLeft: "10px" }}
              >
                {editingField === key ? "Save" : "Edit"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
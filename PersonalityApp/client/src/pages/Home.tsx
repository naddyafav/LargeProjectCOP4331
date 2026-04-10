import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function Home() {

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://104.236.41.135:5050/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();

        setUserData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
          <h2>Profile</h2>

          <p><strong>First Name:</strong> {userData?.firstName}</p>
          <p><strong>Last Name:</strong> {userData?.lastName}</p>
          <p><strong>Username:</strong> {userData?.username}</p>
          <p><strong>Email:</strong> {userData?.email}</p>
        </div>
      </div>
    </div>
  );
}
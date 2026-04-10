import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";

export default function Home() {

  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const goToQuiz = () => { navigate("/quiz"); };
  const goToFriends = () => { navigate("/friends"); };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="page-center page-sky">
      <Clouds />
      {/* Card */}
      <div className="card">
        <div className="text-center mb-4">
          <h2 className="page-header">Profile</h2>
        </div>

        <div className="page-text">
          <p><strong>First Name:</strong> {userData?.firstName}</p>
          <p><strong>Last Name:</strong> {userData?.lastName}</p>
          <p><strong>Username:</strong> {userData?.username}</p>
          <p><strong>Email:</strong> {userData?.email}</p>
          <p><strong>Friends:</strong> {userData?.friends}</p>
        </div>
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
            gap: "10px"
          }}
        >
          <button onClick={goToQuiz} className="button">Quiz</button>
          <button onClick={handleLogout} className="button">Logout</button>
          <button onClick={goToFriends} className="button">Friends</button>
        </div>
      </div>
    </div>
  );
}
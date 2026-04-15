import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/register/verify/${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");

          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Something went wrong.");
      }
    };

    if (token) {
      verify();
    }
  }, [token, navigate]);

  return (
    <div className="page-center page-sky">

      <div className="card" style={{ textAlign: "center" }}>
        {status === "verifying" && (
          <>
            <h2 className="page-header">Verifying your email...</h2>
            <p className="page-text">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="page-header">Email Verified!</h2>
            <p className="page-text">{message}</p>
            <p className="card-status">Redirecting to login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="page-header">Verification Failed</h2>
            <p className="card-status card-error">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

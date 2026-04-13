import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(
          `http://104.236.41.135:5050/register/verify/${token}`
        );

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

    if (token) verify();
  }, [token, navigate]);

  return (
    <div className="page-center page-sky">
      {status === "verifying" && <p>Verifying your email...</p>}

      {status === "success" && (
        <>
          <h2>Email Verified!</h2>
          <p>{message}</p>
          <p>Redirecting to login...</p>
        </>
      )}

      {status === "error" && (
        <>
          <h2>Verification Failed</h2>
          <p>{message}</p>
        </>
      )}
    </div>
  );
}

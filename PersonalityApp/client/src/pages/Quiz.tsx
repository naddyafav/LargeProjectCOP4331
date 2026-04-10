//import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Clouds from "../components/Clouds";//import React from "react";

export default function Quiz() {

  const navigate = useNavigate();
  const goToHome = () => { navigate("/home"); };

  return (
    <div className="page-center page-sky">
      <Clouds />
          <div className="card">
            <div className="text-center mb-4">
              <h2 className="page-header">Quiz</h2>
            </div>

        // Button
        <div>
          <button onClick={goToHome} className="button">
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogleAllowlist } from "../../../data/data_access/AuthService";
import Title from "../header/Title";

export default function LoginPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      await loginWithGoogleAllowlist();
      navigate("/database/tutors", { replace: true });
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    }
  };

  return (
    <div className="login-page">
      <Title />
      <div className="login-card">
        <h3>Sign in</h3>
        <button className="login-button" onClick={handleLogin}>
          Continue with Google
        </button>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

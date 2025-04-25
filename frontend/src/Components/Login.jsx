import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../constants/api";
import axios from "axios";
import "../styles/Login.css"; 
import { toast } from "react-toastify";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
  
    setError("");
    setLoading(true);
  
    try {
      const res = await axios.post(`${api}/user/login`, {
        email: form.email,
        password: form.password,
      });
  
      // Assuming response contains token and username
      const { token, username, userId } = res.data;
  
      // Store token and username in sessionStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("userId", userId); 
  
      toast.success("Login successful!"); // Show success message
      navigate("/"); // redirect to home  after successful login
    } catch (err) {
      // Handle error (bad response, JSON error, etc.)
      const errorMsg = err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title"><em>Welcome Back</em></h2>
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="signup-form">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="signup-footer">
          Don’t have an account?{" "}
          <button
            className="link-button"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

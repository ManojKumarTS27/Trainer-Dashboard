import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Login.css";

const dashboardRoutes = {
  Student: "/student-dashboard",
  Teacher: "/teacher-dashboard",
  Employer: "/employer-dashboard",
  Employee: "/employee-dashboard",
  Admin: "/admin-dashboard",
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const registeredEmail =
    location.state?.email || "";

  const rememberedEmail =
    localStorage.getItem("rememberedEmail") || "";

  const [form, setForm] = useState({
    email: registeredEmail || rememberedEmail,
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(
    Boolean(rememberedEmail)
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password.trim()) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      if (!data.token || !data.user) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      const dashboardPath =
        dashboardRoutes[data.user.role];

      if (!dashboardPath) {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
        localStorage.removeItem("isLoggedIn");

        navigate("/access-denied", {
          replace: true,
        });

        return;
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "authUser",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      if (rememberMe) {
        localStorage.setItem(
          "rememberedEmail",
          email
        );
      } else {
        localStorage.removeItem(
          "rememberedEmail"
        );
      }

      navigate(dashboardPath, {
        replace: true,
      });
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      localStorage.removeItem("isLoggedIn");

      setError(
        error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>

        <p className="login-subtitle">
          Sign in to continue
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={loading}
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <div className="password-wrapper">
            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
              required
            />

            <button
              type="button"
              className="show-password-btn"
              onClick={() =>
                setShowPassword(
                  (previousValue) =>
                    !previousValue
                )
              }
              disabled={loading}
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>

          <label className="remember-option">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) =>
                setRememberMe(
                  event.target.checked
                )
              }
              disabled={loading}
            />

            <span>Remember Me</span>
          </label>

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="register-text">
          Don&apos;t have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
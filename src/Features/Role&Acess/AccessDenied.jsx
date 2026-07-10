import { useNavigate } from "react-router-dom";

function AccessDenied() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("authUser") || "null"
  );

  const dashboardRoutes = {
    Student: "/student-dashboard",
    Teacher: "/teacher-dashboard",
    Employer: "/employer-dashboard",
    Employee: "/employee-dashboard",
    Admin: "/admin-dashboard",
  };

  const handleGoBack = () => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    navigate(
      dashboardRoutes[user.role] || "/login",
      { replace: true }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("rememberedEmail");

    navigate("/login", { replace: true });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🚫</div>

        <h1 style={styles.title}>
          Access Denied
        </h1>

        <p style={styles.message}>
          You don't have permission to access this page.
        </p>

        {user && (
          <>
            <p style={styles.user}>
              <strong>Name :</strong> {user.name}
            </p>

            <p style={styles.user}>
              <strong>Role :</strong> {user.role}
            </p>
          </>
        )}

        <div style={styles.buttonGroup}>
          <button
            style={styles.primaryButton}
            onClick={handleGoBack}
          >
            Go to Dashboard
          </button>

          <button
            style={styles.secondaryButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#312e81,#7c3aed)",
    padding: "20px",
    fontFamily: "Segoe UI",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,.25)",
  },

  icon: {
    fontSize: "70px",
  },

  title: {
    marginTop: "10px",
    color: "#dc2626",
  },

  message: {
    color: "#6b7280",
    marginTop: "10px",
    marginBottom: "20px",
  },

  user: {
    margin: "8px 0",
    color: "#111827",
  },

  buttonGroup: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    marginTop: "30px",
  },

  primaryButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  secondaryButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default AccessDenied;
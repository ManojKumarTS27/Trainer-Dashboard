import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Features/Login&out/Login";
import Register from "./Features/Login&out/Register";

import TrainerDashboard from "./Features/Trainer/TrainerDashboard";
import RecordingDashboard from "./Features/Recordings/RecordingDashboard";
import SessionRecordings from "./Features/Recordings/SessionRecordings";
import UploadRecordingModal from "./Features/Recordings/UploadRecordingModal";
import SessionManagement from "./Features/Sessions/SessionManagement";

import AccessDenied from "./Features/Role&Acess/AccessDenied";
import RoleProtectedRoute from "./Features/Role&Acess/RoleProtectedRoute";

const dashboardRoutes = {
  Student: "/student-dashboard",
  Teacher: "/teacher-dashboard",
  Employer: "/employer-dashboard",
  Employee: "/employee-dashboard",
  Admin: "/admin-dashboard",
};

function HomeRedirect() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(
    localStorage.getItem("authUser") || "null"
  );

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={dashboardRoutes[user.role] || "/access-denied"}
      replace
    />
  );
}

function Dashboard() {
  return <TrainerDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/access-denied"
          element={<AccessDenied />}
        />

        {/* Student */}
        <Route
          path="/student-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={["Student", "Admin"]}
            >
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Teacher */}
        <Route
          path="/teacher-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={["Teacher", "Admin"]}
            >
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Employer */}
        <Route
          path="/employer-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={["Employer", "Admin"]}
            >
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Employee */}
        <Route
          path="/employee-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={["Employee", "Admin"]}
            >
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={["Admin"]}
            >
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Shared Protected Pages */}
        <Route
          path="/recording-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Student",
                "Teacher",
                "Employer",
                "Employee",
                "Admin",
              ]}
            >
              <RecordingDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/session-recordings"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Student",
                "Teacher",
                "Employer",
                "Employee",
                "Admin",
              ]}
            >
              <SessionRecordings />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/upload-recording"
          element={
            <RoleProtectedRoute
              allowedRoles={["Teacher", "Admin"]}
            >
              <UploadRecordingModal />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/session-management"
          element={
            <RoleProtectedRoute
              allowedRoles={["Teacher", "Admin"]}
            >
              <SessionManagement />
            </RoleProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
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
import AttendancePage from "./Features/Attendance/AttendancePage";

import AccessDenied from "./Features/Role&Acess/AccessDenied";
import RoleProtectedRoute from "./Features/Role&Acess/RoleProtectedRoute";

const dashboardRoutes = {
  Student: "/student-dashboard",
  Teacher: "/teacher-dashboard",
  Employer: "/employer-dashboard",
  Employee: "/employee-dashboard",
  Admin: "/admin-dashboard",
};

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("authUser") || "null"
    );
  } catch (error) {
    console.error(
      "Unable to read authenticated user:",
      error
    );

    return null;
  }
}

function HomeRedirect() {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  const dashboardPath = dashboardRoutes[user.role];

  if (!dashboardPath) {
    return (
      <Navigate
        to="/access-denied"
        replace
      />
    );
  }

  return (
    <Navigate
      to={dashboardPath}
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
        <Route
          path="/"
          element={<HomeRedirect />}
        />

        {/* Public routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/access-denied"
          element={<AccessDenied />}
        />

        {/* Dashboard routes */}
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

        {/* Recording routes */}
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

        {/* Session management */}
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

        {/* Attendance management */}
        <Route
          path="/attendance"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Student",
                "Teacher",
                "Admin",
              ]}
            >
              <AttendancePage />
            </RoleProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

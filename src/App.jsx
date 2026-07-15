import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./Features/Login&out/Login";
import Register from "./Features/Login&out/Register";

import TrainerDashboard from "./Features/Trainer/TrainerDashboard";

import RecordingDashboard from "./Features/Recordings/RecordingDashboard";
import SessionRecordings from "./Features/Recordings/SessionRecordings";
import UploadRecordingModal from "./Features/Recordings/UploadRecordingModal";

import SessionManagement from "./Features/Sessions/SessionManagement";
import AttendancePage from "./Features/Attendance/AttendancePage";

import DigitalClassroom from "./Features/DigitalClassroom/DigitalClassroom";

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
  } catch {
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

        <Route
          path="/trainer-dashboard"
          element={<HomeRedirect />}
        />

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

        <Route
          path="/student-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Student",
                "Admin",
              ]}
            >
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/teacher-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Teacher",
                "Admin",
              ]}
            >
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/employer-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Employer",
                "Admin",
              ]}
            >
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/employee-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Employee",
                "Admin",
              ]}
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

        <Route
          path="/digital-classroom/:sessionId"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Student",
                "Teacher",
                "Admin",
              ]}
            >
              <DigitalClassroom />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/session-management"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "Teacher",
                "Admin",
              ]}
            >
              <SessionManagement />
            </RoleProtectedRoute>
          }
        />

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
              allowedRoles={[
                "Teacher",
                "Admin",
              ]}
            >
              <UploadRecordingModal />
            </RoleProtectedRoute>
          }
        />

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
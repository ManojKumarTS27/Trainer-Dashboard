import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./Features/Login&out/Login.jsx";
import Register from "./Features/Login&out/Register.jsx";

import TrainerDashboard from "./Features/Trainer/TrainerDashboard.jsx";

import RecordingDashboard from "./Features/Recordings/RecordingDashboard.jsx";
import SessionRecordings from "./Features/Recordings/SessionRecordings.jsx";
import UploadRecordingModal from "./Features/Recordings/UploadRecordingModal.jsx";

import SessionManagement from "./Features/Sessions/SessionManagement.jsx";
import AttendancePage from "./Features/Attendance/AttendancePage.jsx";

import DigitalClassroom from "./Features/DigitalClassroom/DigitalClassroom.jsx";

import AccessDenied from "./Features/Role&Acess/AccessDenied.jsx";
import RoleProtectedRoute from "./Features/Role&Acess/RoleProtectedRoute.jsx";

const dashboardRoutes = {
  Student: "/student-dashboard",
  Teacher: "/teacher-dashboard",
  Employer: "/employer-dashboard",
  Employee: "/employee-dashboard",
  Admin: "/admin-dashboard",
};

function getStoredUser() {
  try {
    const storedUser =
      localStorage.getItem("authUser");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Unable to read authenticated user:",
      error
    );

    localStorage.removeItem("authUser");

    return null;
  }
}

function HomeRedirect() {
  const token =
    localStorage.getItem("token");

  const user = getStoredUser();

  if (!token || !user?.role) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const dashboardPath =
    dashboardRoutes[user.role];

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

function DashboardPage() {
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
              <DashboardPage />
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
              <DashboardPage />
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
              <DashboardPage />
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
              <DashboardPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <RoleProtectedRoute
              allowedRoles={["Admin"]}
            >
              <DashboardPage />
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
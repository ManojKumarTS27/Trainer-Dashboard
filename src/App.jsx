import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import TrainerDashboard from "./features/trainer/TrainerDashboard";
import RecordingDashboard from "./features/recordings/RecordingDashboard";
import SessionRecordings from "./features/recordings/SessionRecordings";
import UploadRecordingModal from "./features/recordings/UploadRecordingModal";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/trainer-dashboard" replace />}
        />

        <Route
          path="/trainer-dashboard"
          element={<TrainerDashboard />}
        />

        <Route
          path="/recording-dashboard"
          element={<RecordingDashboard />}
        />

        <Route
          path="/session-recordings"
          element={<SessionRecordings />}
        />

        <Route
          path="/upload-recording"
          element={<UploadRecordingModal />}
        />

        <Route
          path="*"
          element={<Navigate to="/trainer-dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
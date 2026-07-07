import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import TrainerDashboard from "./features/trainer/TrainerDashboard";
import RecordingDashboard from "./features/recordings/RecordingDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/trainer-dashboard" replace />} />

        <Route path="/trainer-dashboard" element={<TrainerDashboard />} />

        <Route path="/recordings" element={<RecordingDashboard />} />

        <Route path="*" element={<Navigate to="/trainer-dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
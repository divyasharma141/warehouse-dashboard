import { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import SignIn from "./components/pages/Authenication/SignIn";
import SignUp from "./components/pages/Authenication/SignUp";
import BotDashboardOverview from "./components/pages/Dashboard";
// import BotStatusPage from "./components/pages/botDetails/BotStatus";
import BotStatusPage from "./components/pages/botDetails/BotStatus";
// import TaskAllocationPage from "./components/pages/taskManagement/TaskAllocation";
import TaskQueuePage from "./components/pages/taskManagement/TaskQueue";
import MapPage from "./components/pages/map";
import AnalyticsPage from "./components/pages/analytics";
// import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/layouts/Sidebar"
import { GlobalStateProvider } from "./context/GlobalContext";
// import Layout from "./components/layouts/Layout";
function App() {
  return (
    <>
      <AuthProvider>
        <GlobalStateProvider>
        <Router>
          <Sidebar>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Main Page */}
            <Route path="/" element={<BotDashboardOverview />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
            {/* Bots */}
            <Route path="/bots" element={< BotStatusPage/>} />

            {/* task */}
            <Route path="/tasks" element={<TaskQueuePage />} />

            {/* analytics */}
            <Route path="/analytics" element={
                <AnalyticsPage />
            } />
            <Route path="/map" element={
                <MapPage />
            } />
            
            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
          </Sidebar>
        </Router>
        </GlobalStateProvider>
      </AuthProvider>
    </>
  );
}

export default App;
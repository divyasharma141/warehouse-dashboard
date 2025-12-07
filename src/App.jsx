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
import MapPage from "./components/pages/Map"
import AnalyticsPage from "./components/pages/analytics";
// import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRoute from "./AppRoutes/ProtectedRoutes";
import PublicRoute from "./AppRoutes/PublicRoutes";
import Sidebar from "./components/layouts/Sidebar"
import { GlobalStateProvider } from "./context/GlobalContext";
// import Layout from "./components/layouts/Layout";
function App() {
  return (
    <>
      <AuthProvider>
      <GlobalStateProvider>
        <Router>
          <Routes>
            <Route path="/signin" element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } />
            
            <Route path="/*" element={
              <ProtectedRoute>
                <Sidebar>
                  <Routes>
                    <Route path="/" element={<BotDashboardOverview />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    <Route path="/bots" element={<BotStatusPage />} />
                    <Route path="/tasks" element={<TaskQueuePage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Sidebar>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </GlobalStateProvider>
    </AuthProvider>
    </>
  );
}

export default App;
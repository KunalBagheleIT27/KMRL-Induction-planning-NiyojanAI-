import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage.js";
import ForgotPasswordPage from "./components/ForgotPasswordPage.js";
import DashboardPage from "./components/DashboardPage.js";
import GeneratePlanFile from "./components/GeneratePlanFile.js";
import ReportsPage from "./components/ReportsPage.js";
import WelcomePage from "./components/WelcomePage.js";
import SignUpPage from "./components/SignUpPage.js";
import ProgressPage from "./components/ProgressPage.js";
import RecommendedPlan from "./components/RecommendedPlan.js";
import SettingsPage from "./components/SettingsPage.js";
import FleetStatusDashboard from './components/FleetStatusDashboard.js';
import HistoryPage from "./components/HistoryPage.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* === ADDED THIS NEW ROUTE FOR YOUR FLEET STATUS DASHBOARD === */}
        <Route path="/fleet-status" element={<FleetStatusDashboard />} />
        <Route path="/generate-plan" element={<GeneratePlanFile />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/recommended-plan" element={<RecommendedPlan />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
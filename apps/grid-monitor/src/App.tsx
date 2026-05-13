import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { CommandCenter } from './pages/CommandCenter';
import { Monitoring } from './pages/Monitoring';
import { BuildingDetail } from './pages/BuildingDetail';
import { LoginPage } from './pages/LoginPage';
import { AuthGuard } from './components/common/AuthGuard';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Root redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<Navigate to="/monitoring" replace />} />
          <Route path="/analytics" element={<AuthGuard><AnalyticsDashboard /></AuthGuard>} />
          <Route path="/monitoring" element={<AuthGuard><Monitoring /></AuthGuard>} />
          <Route path="/building/:buildingId" element={<AuthGuard><BuildingDetail /></AuthGuard>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

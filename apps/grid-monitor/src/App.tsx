
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { CommandCenter } from './pages/CommandCenter';
import { Monitoring } from './pages/Monitoring';
import { BuildingDetail } from './pages/BuildingDetail';
import { LoginPage } from './pages/LoginPage';
import { AuthGuard } from './components/common/AuthGuard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route path="/" element={<AuthGuard><CommandCenter /></AuthGuard>} />
        <Route path="/analytics" element={<AuthGuard><AnalyticsDashboard /></AuthGuard>} />
        <Route path="/monitoring" element={<AuthGuard><Monitoring /></AuthGuard>} />
        <Route path="/building/:buildingId" element={<AuthGuard><BuildingDetail /></AuthGuard>} />
      </Routes>
    </Router>
  );
}

export default App;

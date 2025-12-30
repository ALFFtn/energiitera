
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { CommandCenter } from './pages/CommandCenter';
import { Monitoring } from './pages/Monitoring';
import { PanelDetail } from './pages/PanelDetail';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/panel/:id" element={<PanelDetail />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;

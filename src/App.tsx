import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ShieldApp from './pages/ShieldApp';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ShieldApp view="home" />} />
        <Route path="scan" element={<ShieldApp view="upload" />} />
        <Route path="chat" element={<ShieldApp view="chat" />} />
        <Route path="dashboard" element={<ShieldApp view="dashboard" />} />
        <Route path="results" element={<ShieldApp view="results" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

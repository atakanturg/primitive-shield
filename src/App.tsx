import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Home } from './pages/Home';
import { Ontology } from './pages/Ontology';
import { Onboarding } from './pages/Onboarding';
import { Shield } from './pages/Shield';
import ShieldApp from './pages/ShieldApp';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Shield />} />
        <Route path="ontology" element={<Ontology />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="shield" element={<Shield />} />
        <Route path="app" element={<ShieldApp />} />
      </Route>
    </Routes>
  );
}

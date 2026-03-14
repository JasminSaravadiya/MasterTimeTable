import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Configuration from './components/Configuration';
import MasterGrid from './components/MasterGrid';
import { useStore } from './store/useStore';

import ExportPreview from './components/ExportPreview';

function App() {
  const { currentConfig } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route 
          path="/configure" 
          element={currentConfig ? <Configuration /> : <Navigate to="/" />} 
        />
        <Route 
          path="/grid" 
          element={currentConfig ? <MasterGrid /> : <Navigate to="/" />} 
        />
        <Route 
          path="/export" 
          element={currentConfig ? <ExportPreview /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

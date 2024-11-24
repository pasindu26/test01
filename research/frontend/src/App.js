import React from 'react';
import AppNavbar from './components/Navbar';
import DataTable from './components/DataTable';
import GraphPage from './components/GraphPage';
import CompareGraphPage from './components/CompareGraphPage'; // Add this import
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <AppNavbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<DataTable />} />
          <Route path="/graphs" element={<GraphPage />} />
          <Route path="/compare-graphs" element={<CompareGraphPage />} /> {/* Add the new route */}
        </Routes>
      </div>
    </>
  );
}

export default App;

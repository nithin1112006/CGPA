import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import DepartmentSelect from './pages/DepartmentSelect';
import SemesterSelect from './pages/SemesterSelect';
import SGPACalculator from './pages/SGPACalculator';
import CGPACalculator from './pages/CGPACalculator';
import DeveloperInfo from './pages/DeveloperInfo';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import './index.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculate" element={<SGPACalculator />} />
        <Route path="/calculate/:department" element={<SGPACalculator />} />
        <Route path="/calculate/:department/:semester" element={<SGPACalculator />} />
        <Route path="/cgpa" element={<CGPACalculator />} />
        <Route path="/developer" element={<DeveloperInfo />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;

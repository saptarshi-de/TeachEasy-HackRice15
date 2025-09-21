import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ScholarshipDetail from './pages/ScholarshipDetail';
import DiscountsPage from './pages/DiscountsPage';
import Loading from './components/Loading';
import './App.css';

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/scholarship/:id" element={<ScholarshipDetail />} />
          <Route path="/discounts" element={<DiscountsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Premixes from './pages/Premixes';
import Orders from './pages/Orders';
import Drinks from './pages/Drinks';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/premixes" element={<Premixes />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/drinks" element={<Drinks />} />
      </Routes>
    </Router>
  );
}

export default App;

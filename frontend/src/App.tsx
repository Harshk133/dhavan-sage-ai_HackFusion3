import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-blue-600 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-white font-bold text-xl tracking-tight">PharmAI Agentic System</span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium self-center">Home</Link>
                  <Link to="/chat" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium self-center">Patient Chat</Link>
                  <Link to="/admin" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium self-center">Pharmacist Dashboard</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

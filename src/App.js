import * as React from "react";
import './App.css';
import Home from './components/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {

  
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/callback" element={<Home />} />        
          </Routes>
    </Router>
  );
}

import React from 'react'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import HomePage from './pages/HomePage';
import SentinelsPage from './pages/SentinelsPage';

import './App.css'

function ErrorPage(_props: any) {
  return (
    <div className="box block has-background-danger">
      <h1 className="title">Not Found</h1>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path={"/"} element={<HomePage />} />
        <Route path={"/:id"} element={<SentinelsPage />} />
        <Route path={"/oauth2/callback"} element={<h1>OAuth Callback</h1>} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  )
}

export default App

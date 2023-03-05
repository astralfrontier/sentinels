import React from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import DocumentationPage from './pages/DocumentationPage';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import ResultsPage from './pages/ResultsPage';
import SearchPage from './pages/SearchPage';
import TermsOfUsePage from './pages/TermsPage';
import TestPage from './pages/TestPage';

import './App.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/privacy",
    element: <PrivacyPage />
  },
  {
    path: "/terms",
    element: <TermsOfUsePage />
  },
  {
    path: "/search/notion",
    element: <SearchPage />
  },
  {
    path: "/test/:deckName",
    element: <TestPage />
  },
  {
    path: "/docs",
    element: <DocumentationPage />
  },
  {
    path: "/results/notion/:id/:currentTab",
    element: <ResultsPage />
  },
  {
    path: "*",
    element: <ErrorPage />
  },
]);


function ErrorPage(_props: any) {
  return (
    <div className="box block has-background-danger">
      <h1 className="title">Not Found</h1>
    </div>
  );
}

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App

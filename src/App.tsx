import React from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import DocumentationPage from './pages/DocumentationPage';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import SearchPage from './pages/SearchPage';
import SentinelsPage from './pages/SentinelsPage';
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
    path: "/search",
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
    path: "/:id",
    element: <SentinelsPage />
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

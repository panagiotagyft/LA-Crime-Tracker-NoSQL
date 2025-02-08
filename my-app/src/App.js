import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Home from './pages/home/Home';
import Queries from './pages/queries/Queries';
import Insert from './pages/insert/Insert';
import Updates from './pages/updates/Updates';
import Search from './pages/search/Search';
import ProtectedRoute from './context/ProtectedRoute'; 

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/queries",
    element: (
      <ProtectedRoute>
        <Queries />
      </ProtectedRoute>
    ),
  },
  {
    path: "/insert",
    element: (
      <ProtectedRoute>
        <Insert />
      </ProtectedRoute>
    ),
  },
  {
    path: "/updates",
    element: (
      <ProtectedRoute>
        <Updates />
      </ProtectedRoute>
    ),
  },
{
    path: "/search",
    element: (
      <ProtectedRoute>
        <Search />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

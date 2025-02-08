import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!Cookies.get('token'); // Ελέγχει αν υπάρχει token στα cookies

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;

// src/routes/index.jsx
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import { publicRoutes, protectedRoutes } from './routeConfig';
import PageNotFound from '../pages/PageNotFound';

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Layout wrapper for all routes */}
        <Route element={<Layout />}>
          {/* Public routes */}
          {publicRoutes.map((route) => (
            <Route 
              key={route.path}
              path={route.path}
              element={<route.element />}
            />
          ))}
          
          {/* Protected routes */}
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute requiredRole={route.role}>
                  <route.element />
                </ProtectedRoute>
              }
            />
          ))}
          
          {/* 404 Page Not Found */}
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);

export default AppRoutes;
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
        {/* Public routes with main layout */}
        <Route element={<Layout />}>
          {publicRoutes.map((route) => (
            <Route 
              key={route.path}
              path={route.path}
              element={<route.element />}
            />
          ))}
        </Route>
        
        {/* Protected routes without main layout */}
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute requiredRole={route.role}>
                <route.element />
              </ProtectedRoute>
            }
          >
            {/* Handle nested routes for dashboard */}
            {route.children?.map((child) => (
              <Route 
                key={child.path}
                path={child.path}
                element={<child.element />}
              />
            ))}
          </Route>
        ))}
        
        {/* 404 Page Not Found with main layout */}
        <Route element={<Layout />}>
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
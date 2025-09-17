import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import { publicRoutes, protectedRoutes } from "./routeConfig";
import PageNotFound from "../pages/PageNotFound";

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes with main layout */}
        <Route element={<Layout />}>
          {publicRoutes.map((route) => {
            // You must create a capitalized variable to render a component from a variable
            const Element = route.element;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Element />}
              />
            );
          })}
        </Route>

        {/* Protected routes (no main layout by design) */}
        {protectedRoutes.map((route) => {
          const Wrapper = route.element; // e.g., DashboardLayout
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute requiredRole={route.role} roles={route.roles}>
                  <Wrapper />
                </ProtectedRoute>
              }
            >
              {/* Child routes (support `index: true` or `path`) */}
              {route.children?.map((child) => {
                const ChildComp = child.element;
                if (child.index) {
                  // Preferred for default child route
                  return <Route key="index" index element={<ChildComp />} />;
                }
                return (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={<ChildComp />}
                  />
                );
              })}
            </Route>
          );
        })}

        {/* 404 with main layout */}
        <Route element={<Layout />}>
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

// Full-page loading spinner for lazy routes
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);

export default AppRoutes;

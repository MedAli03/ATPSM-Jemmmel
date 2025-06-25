// src/routes/routeConfig.js
import { lazy } from "react";
import ForgetPwd from "../components/authentication/ForgetPwd";

// Lazy load all page components
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutUsPage = lazy(() => import("../pages/AboutUsPage"));
const Contact = lazy(() => import("../components/layout/Contact"));
const ActivitiesPage = lazy(() => import("../pages/ActivitiesPage"));
const AutismInfo = lazy(() => import("../pages/AutismInfo"));
const FAQPage = lazy(() => import("../pages/FAQPage"));
const NewsPage = lazy(() => import("../pages/NewsPage"));
const MoreAboutNewsPage = lazy(() => import("../pages/MoreAboutNewsPage"));
const LoginPage = lazy(() => import("../components/authentication/LoginPage"));
// const Dashboard = lazy(() => import('../components/dashboard/Dashboard'));
const PageNotFound = lazy(() => import("../pages/PageNotFound"));

// Public routes - accessible to everyone
const publicRoutes = [
  { path: "/", element: HomePage, title: "Home" },
  { path: "/about", element: AboutUsPage, title: "About Us" },
  { path: "/contact", element: Contact, title: "Contact" },
  { path: "/what-is-autism", element: AutismInfo, title: "What is Autism" },
  { path: "/faqs", element: FAQPage, title: "FAQs" },
  { path: "/events", element: ActivitiesPage, title: "Events" },
  { path: "/news", element: NewsPage, title: "News" },
  { path: "/news/:id", element: MoreAboutNewsPage, title: "News Details" },
  { path: "/login", element: LoginPage, title: "Login" },
  {
    path: "/forgot-password",
    element: ForgetPwd,
    title: "Forgot Password",
  },
];

// Protected routes - require authentication
const protectedRoutes = [
  //   { path: '/dashboard', element: Dashboard, title: 'Dashboard', role: 'admin' },
];

export { publicRoutes, protectedRoutes };

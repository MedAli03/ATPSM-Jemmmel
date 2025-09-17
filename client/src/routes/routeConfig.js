import { lazy } from "react";
import ForgetPwd from "../components/authentication/ForgetPwd";

// Lazy pages
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutUsPage = lazy(() => import("../pages/AboutUsPage"));
const Contact = lazy(() => import("../components/layout/Contact"));
const ActivitiesPage = lazy(() => import("../pages/ActivitiesPage"));
const AutismInfo = lazy(() => import("../pages/AutismInfo"));
const FAQPage = lazy(() => import("../pages/FAQPage"));
const NewsPage = lazy(() => import("../pages/NewsPage"));
const MoreAboutNewsPage = lazy(() => import("../pages/MoreAboutNewsPage"));
const LoginPage = lazy(() => import("../components/authentication/LoginPage"));
const PageNotFound = lazy(() => import("../pages/PageNotFound"));

const DashboardLayout = lazy(() =>
  import("../components/dashboard/DashboardLayout")
);
const DashboardHome = lazy(() => import("../pages/dashboard/DashboardHome"));
// const DashboardUsers = lazy(() => import("../pages/dashboard/DashboardUsers"));
// const DashboardReports = lazy(() => import("../pages/dashboard/DashboardReports"));
// const DashboardSettings = lazy(() => import("../pages/dashboard/DashboardSettings"));

// Public routes — no auth required
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
  { path: "/forgot-password", element: ForgetPwd, title: "Forgot Password" },
];

// Protected routes — auth required
const protectedRoutes = [
  {
    path: "/dashboard",
    element: DashboardLayout,
    title: "Dashboard",
    // You can use either `role: "ADMIN"` (single) or `roles: ["ADMIN"]` (multiple)
    // role: "ADMIN",
    roles: ["PRESIDENT"], // prefer this for flexibility
    children: [
      { index: true, element: DashboardHome, title: "Dashboard Home" }, // index route
      // { path: "users", element: DashboardUsers, title: "Users" },
      // { path: "reports", element: DashboardReports, title: "Reports" },
      // { path: "settings", element: DashboardSettings, title: "Settings" },
    ],
  },
];

export { publicRoutes, protectedRoutes };

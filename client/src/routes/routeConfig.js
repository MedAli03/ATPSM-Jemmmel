import { lazy } from "react";
import ForgetPwd from "../components/authentication/ForgetPwd";
import Login from "../pages/auth/Login";
import AllUsers from "../pages/dashboard/users/AllUsers";
import AllChildren from "../pages/dashboard/children/AllChildren";
import ChildDetails from "../pages/dashboard/children/ChildDetails";
import AllGroups from "../pages/dashboard/groups/AllGroups";
import AllNews from "../pages/dashboard/news/AllNews";
import AllEducators from "../pages/dashboard/educators/AllEducators";
import AllParents from "../pages/dashboard/parents/AllParents";
import ParentAccountCreator from "../pages/dashboard/parents/ParentAccountCreator";
import AllEvents from "../pages/dashboard/events/AllEvents";
import PresidentPeiList from "../pages/dashboard/pei/PresidentPeiList";
import PresidentPeiHistory from "../pages/dashboard/pei/PresidentPeiHistory";
import YearsManagement from "../pages/dashboard/years/YearsManagement";
import PresidentMessagesPage from "../pages/messages/PresidentMessagesPage";

// Lazy pages
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutUsPage = lazy(() => import("../pages/AboutUsPage"));
const Contact = lazy(() => import("../components/layout/Contact"));
const ActivitiesPage = lazy(() => import("../pages/ActivitiesPage"));
const AutismInfo = lazy(() => import("../pages/AutismInfo"));
const FAQPage = lazy(() => import("../pages/FAQPage"));
const NewsPage = lazy(() => import("../pages/NewsPage"));
const MoreAboutNewsPage = lazy(() => import("../pages/MoreAboutNewsPage"));
// const Login = lazy(() => import("../pages/auth/Login"));
// const PageNotFound = lazy(() => import("../pages/PageNotFound"));
const PresidentOverview = lazy(() =>
  import("../components/dashboard/president/Overview")
);
const DashboardLayout = lazy(() =>
  import("../components/dashboard/DashboardLayout")
);
const DirectorDashboard = lazy(() =>
  import("../pages/dashboard/director/Dashboard")
);
const ProfilePage = lazy(() =>
  import("../pages/dashboard/profile/ProfilePage")
);
const NotificationsPage = lazy(() =>
  import("../pages/dashboard/NotificationsPage")
);
const AddChildWizard = lazy(() =>
  import("../pages/dashboard/children/AddChildWizard")
);
// const DashboardHome = lazy(() => import("../pages/dashboard/DashboardHome"));
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
  { path: "/login", element: Login, title: "Login" },
  { path: "/forgot-password", element: ForgetPwd, title: "Forgot Password" },
];

// Protected routes — auth required
const protectedRoutes = [
  {
    path: "/dashboard/profile",
    element: DashboardLayout,
    roles: ["PRESIDENT", "DIRECTEUR"],
    children: [
      { index: true, element: ProfilePage, title: "الملف الشخصي" },
    ],
  },
  // {
  //   path: "/dashboard",
  //   element: DashboardLayout,
  //   roles: ["PRESIDENT"],
  //   children: [
  //     { index: true, element: PresidentOverview, title: "لوحة الرئيس" },
  //   ],
  // },
  // Explicit President base route
  {
    path: "/dashboard/president",
    element: DashboardLayout,
    roles: ["PRESIDENT"],
    children: [
      { index: true, element: PresidentOverview, title: "لوحة الرئيس" },
      {
        path: "notifications",
        element: NotificationsPage,
        title: "Notifications",
      },
      { path: "users", element: AllUsers, title: "كل المستخدمون" },
      { path: "children", element: AllChildren, title: "كل الأطفال" },
      { path: "children/new", element: AddChildWizard, title: "إضافة طفل" },
      { path: "children/:id", element: ChildDetails, title: "تفاصيل الطفل" },
      { path: "parents", element: AllParents, title: "الأولياء" },
      {
        path: "parent-accounts",
        element: ParentAccountCreator,
        title: "إنشاء حساب ولي",
      },
      { path: "peis", element: PresidentPeiList, title: "مشاريع PEI" },
      {
        path: "pei-history",
        element: PresidentPeiHistory,
        title: "تاريخ PEI",
      },
      { path: "years", element: YearsManagement, title: "السنوات الدراسية" },
      { path: "groups", element: AllGroups, title: "المجموعات" },
      { path: "educators", element: AllEducators, title: "المربّون" },
      { path: "news", element: AllNews, title: "الأخبار" },
      { path: "events", element: AllEvents, title: "الفعاليات" },
      {
        path: "messages",
        element: PresidentMessagesPage,
        title: "الرسائل",
      },
    ],
  },
  {
    path: "/dashboard/manager",
    element: DashboardLayout,
    roles: ["DIRECTEUR"],
    children: [
      { index: true, element: DirectorDashboard, title: "لوحة المدير" },
      {
        path: "notifications",
        element: NotificationsPage,
        title: "الإشعارات",
      },
      { path: "users", element: AllUsers, title: "كل المستخدمون" },
      { path: "children", element: AllChildren, title: "كل الأطفال" },
      { path: "children/new", element: AddChildWizard, title: "إضافة طفل" },
      { path: "children/:id", element: ChildDetails, title: "تفاصيل الطفل" },
      { path: "parents", element: AllParents, title: "الأولياء" },
      { path: "groups", element: AllGroups, title: "المجموعات" },
      { path: "educators", element: AllEducators, title: "المربّون" },
      { path: "news", element: AllNews, title: "الأخبار" },
      { path: "events", element: AllEvents, title: "الفعاليات" },
      {
        path: "messages",
        element: PresidentMessagesPage,
        title: "الرسائل",
      },
    ],
  },
  {
    path: "/dashboard/messages",
    element: DashboardLayout,
    roles: ["PRESIDENT", "DIRECTEUR"],
    children: [
      {
        path: "",
        element: PresidentMessagesPage,
        title: "قائمة الرسائل",
      },
    ],
  },
];

export { publicRoutes, protectedRoutes };

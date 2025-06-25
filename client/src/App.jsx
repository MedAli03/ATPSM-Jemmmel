// import Contact from "./components/layout/Contact";
// import Footer from "./components/layout/Footer";
// import NavBar from "./components/layout/NavBar";
// import AboutUsPage from "./pages/AboutUsPage";
// import ActivitiesPage from "./pages/ActivitiesPage";
// import AutismInfo from "./pages/AutismInfo";
// import FAQPage from "./pages/FAQPage";
// import HomePage from "./pages/HomePage";
// import { Routes, Route } from "react-router-dom";
// import NewsPage from "./pages/NewsPage";
// import MoreAboutNewsPage from "./pages/MoreAboutNewsPage";
// import LoginPage from "./components/authentication/LoginPage";

// function App() {
//   return (
//     <div className="App">
//       <NavBar />
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/about" element={<AboutUsPage />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/what-is-autism" element={<AutismInfo />} />
//         <Route path="/faqs" element={<FAQPage />} />
//         <Route path="/events" element={<ActivitiesPage />} />
//         <Route path="/news" element={<NewsPage />} />
//         <Route path="/news/:id" element={<MoreAboutNewsPage />} />
//         <Route path="/login" element={<LoginPage />} />
//       </Routes>

//       <Footer />
//     </div>
//   );
// }

// export default App;

// src/App.js
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext'; // Changed to named import

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
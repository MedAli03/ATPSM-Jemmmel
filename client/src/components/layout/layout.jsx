import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./NavBar";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

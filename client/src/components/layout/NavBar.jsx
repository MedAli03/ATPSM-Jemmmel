import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import "./NavBar.css";

const NavBar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
            <img src="/logo.jpg" alt="جمعية الحمائم للتوحد" loading="lazy" />
          </Link>

          {/* Desktop Menu */}
          <div className="nav-links">
            <div className="nav-group">
              <Link to="/">الرئيسية</Link>
              <Link to="/about">عن الجمعية</Link>
              <div className="nav-dropdown">
                <button className="dropdown-toggle">
                  عن التوحد <FiChevronDown />
                </button>
                <div className="dropdown-menu">
                  <Link to="/what-is-autism">ماهو التوحد</Link>
                  <Link to="/services/therapy">التشخيص</Link>
                  <Link to="/services/support">الأسئلة الشائعة</Link>
                </div>
              </div>
              <div className="nav-dropdown">
                <button className="dropdown-toggle">
                  خدماتنا <FiChevronDown />
                </button>
                <div className="dropdown-menu">
                  <Link to="/services/education">برامج تعليمية</Link>
                  <Link to="/services/therapy">جلسات علاجية</Link>
                  <Link to="/services/support">دعم أسري</Link>
                </div>
              </div>
            </div>
            <Link to="/news">أخبارنا</Link>
            <Link to="/events">أنشطتنا</Link>
            <Link to="/faqs">الأسئلة الشائعة</Link>
            <div className="nav-group">
              <Link to="/contact" className="cta-button">
                تواصل معنا
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="فتح القائمة"
          >
            {isMobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileOpen ? "open" : ""}`}>
          <Link to="/about" onClick={closeMobileMenu}>
            عن الجمعية
          </Link>
          <Link to="/what-is-autism" onClick={closeMobileMenu}>
            عن التوحد
          </Link>

          <div className="mobile-dropdown">
            <button className="dropdown-toggle">
              خدماتنا <FiChevronDown />
            </button>
            <div className="mobile-dropdown-menu">
              <Link to="/services/education" onClick={closeMobileMenu}>
                برامج تعليمية
              </Link>
              <Link to="/services/therapy" onClick={closeMobileMenu}>
                جلسات علاجية
              </Link>
              <Link to="/services/support" onClick={closeMobileMenu}>
                دعم أسري
              </Link>
            </div>
          </div>

          <Link to="/faqs" onClick={closeMobileMenu}>
            الأسئلة الشائعة
          </Link>
          <Link to="/contact" className="cta-button" onClick={closeMobileMenu}>
            تواصل معنا
          </Link>
        </div>
      </nav>
      <div className="nav-spacer"></div>
    </>
  );
};

export default NavBar;

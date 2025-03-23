import React from "react";
import "./Footer.css";
import { FaSnapchatGhost, FaYoutube, FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section logo">
          <h2>جمعية أسر التوحد</h2>
          <div className="social-icons">
            <FaSnapchatGhost />
            <FaYoutube />
            <FaInstagram />
            <FaTwitter />
            <FaFacebookF />
          </div>
        </div>

        <div className="footer-section">
          <h3>عن الجمعية</h3>
          <ul>
            <li>رسالة من الرئيس</li>
            <li>أعضاء مجلس الإدارة</li>
            <li>لجنة الشرف</li>
            <li>الكالوج الرقمي</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>عن التوحد</h3>
          <ul>
            <li>ما هو التوحد</li>
            <li>التشخيص</li>
            <li>التفاعل</li>
            <li>السلوك</li>
            <li>الأسئلة الشائعة</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>روابط سريعة</h3>
          <ul>
            <li>البرامج والمشاريع</li>
            <li>الأخبار والفعاليات</li>
            <li>المنصة الرقمية</li>
            <li>إصدارات الجمعية</li>
            <li>تحميل الوثائق</li>
          </ul>
        </div>

        <div className="footer-section newsletter">
          <h3>النشرة البريدية</h3>
          <div className="newsletter-box">
            <input type="email" placeholder="البريد الإلكتروني" />
            <button>إرسال</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 جمعية أسر التوحد. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};

export default Footer;

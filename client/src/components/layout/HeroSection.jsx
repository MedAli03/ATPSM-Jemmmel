import { useRef } from "react";
import Slider from "react-slick";
import { useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiInstagram,
  FiFacebook,
} from "react-icons/fi";
import "./Hero.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Hero = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    rtl: true,
    arrows: false,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    // beforeChange: (oldIndex, newIndex) => {
    //   // Add custom animation triggers here
    // }
  };

  const slides = [
    {
      title: "نحو مستقبل أفضل لأطفال التوحد",
      subtitle: "نسعى لبناء مجتمع داعم وواعي",
      image: "aut1.jpg",
      pattern: "arabesque-pattern-1.svg",
    },
    {
      title: "برامج تأهيلية متخصصة",
      subtitle: "خطط فردية لتنمية المهارات",
      image: "aut2.jpg",
      pattern: "arabesque-pattern-2.svg",
    },
    {
      title: "دعم الأسرة أولاً",
      subtitle: "ورش عمل وجلسات دعم نفسي",
      image: "aut3.jpg",
      pattern: "arabesque-pattern-3.svg",
    },
  ];

  return (
    <section className="hero-section">
      {/* Social Media Sidebar */}
      <div className="social-sidebar">
        <a href="#">
          <FiInstagram />
        </a>
        <a href="https://www.facebook.com/profile.php?id=100064660632943">
          <FiFacebook />
        </a>
        <a href="#">
          <FiMail />
        </a>
      </div>

      <Slider {...settings} ref={sliderRef}>
        {slides.map((slide, index) => (
          <div key={index} className="hero-slide">
            <div
              className="slide-background"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Arabic Pattern Overlay */}
              <div
                className="pattern-overlay"
                style={{ backgroundImage: `url(${slide.pattern})` }}
              />

              <div className="slide-content">
                <h1 className="slide-title">
                  <span>{slide.title}</span>
                </h1>
                <p className="slide-subtitle">{slide.subtitle}</p>

                <div className="cta-container">
                  <button
                    onClick={() => navigate('/contact')}
                    className="cta-button"
                  >
                    اتصل بنا
                    <FiChevronLeft className="button-icon" />
                  </button>
                  <button
                    onClick={() => navigate('/about')}
                    className="cta-button secondary"
                  >
                    عن الجمعية
                    <FiChevronLeft className="button-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Custom Arrows */}
      <button
        className="slider-arrow prev"
        onClick={() => sliderRef.current.slickPrev()}
      >
        <FiChevronRight />
      </button>
      <button
        className="slider-arrow next"
        onClick={() => sliderRef.current.slickNext()}
      >
        <FiChevronLeft />
      </button>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="mouse"></div>
      </div>
    </section>
  );
};

export default Hero;

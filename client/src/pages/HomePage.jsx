// import { useState } from "react";
import { Box } from "@mui/material";
// import { useTheme, useMediaQuery } from "@mui/material";
import About from "../components/layout/About";
import BlogSection from "../components/layout/Blogs";
import Contact from "../components/layout/Contact";
import HeroSection from "../components/layout/HeroSection";
import Stats from "../components/layout/Stats";


const Header = () => {
  // const theme = useTheme();
  // const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // const handleMobileMenuOpen = (event) => {
  //   setMobileMenuAnchor(event.currentTarget);
  // };

  // const handleMobileMenuClose = () => {
  //   setMobileMenuAnchor(null);
  // };

  return (
    <Box sx={{ position: "relative", direction: "rtl" }}>
      {/* <NavBar isMobile={isMobile} handleMobileMenuOpen={handleMobileMenuOpen} /> */}
      <HeroSection />
      <Stats />
      <About />
      <BlogSection />

      <Contact />
    </Box>
  );
};

export default Header;

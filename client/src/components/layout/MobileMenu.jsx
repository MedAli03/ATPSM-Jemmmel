import { Menu, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const MobileMenu = ({ mobileMenuAnchor, handleMobileMenuClose }) => {
  return (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "rgba(235, 228, 228, 0.9)",
          minWidth: "200px",
          direction: "rtl",
        },
      }}
    >
      <MenuItem onClick={handleMobileMenuClose}>الرئيسية</MenuItem>
      <MenuItem onClick={handleMobileMenuClose}>من نحن</MenuItem>
      <MenuItem onClick={handleMobileMenuClose}>الخدمات</MenuItem>
      <MenuItem onClick={handleMobileMenuClose}>أعمالنا</MenuItem>
      <MenuItem onClick={handleMobileMenuClose}>صفحات</MenuItem>
      <MenuItem onClick={handleMobileMenuClose}>
        <SearchIcon sx={{ ml: 1 }} /> بحث
      </MenuItem>
    </Menu>
  );
};

export default MobileMenu;
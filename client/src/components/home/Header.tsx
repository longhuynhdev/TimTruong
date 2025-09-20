import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";
const Header = () => {
  return (
    <header className="w-full border-b bg-background border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded bg-emerald-500 flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold text-foreground">
              TimTruong
            </span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink
            to="/"
            className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-2 rounded-md transition-colors duration-200"
          >
            Danh sách các trường đại học
          </NavLink>
          <NavLink
            to="/"
            className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-2 rounded-md transition-colors duration-200"
          >
            Bảng xếp hạng các trường ĐH
          </NavLink>
          <NavLink
            to="/"
            className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-2 rounded-md transition-colors duration-200"
          >
            Tính điểm quy đổi tiếng Anh
          </NavLink>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Tim truong ngay button */}
          <Button asChild className="hover:bg-primary/80 hover:shadow-md transition-all duration-200">
            <NavLink to="search">
              Tìm trường ngay
            </NavLink>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

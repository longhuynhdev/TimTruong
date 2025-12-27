import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b bg-background border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded bg-emerald-500 flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-foreground">
              TimTruong
            </span>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
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
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Desktop CTA button */}
          <Button
            asChild
            className="hidden sm:flex hover:bg-primary/80 hover:shadow-md transition-all duration-200"
          >
            <NavLink to="tim-kiem">
              Tìm trường ngay
            </NavLink>
          </Button>

          {/* Mobile CTA button (icon only on very small screens) */}
          <Button
            asChild
            size="sm"
            className="sm:hidden hover:bg-primary/80 transition-all duration-200"
          >
            <NavLink to="search">
              Tìm trường
            </NavLink>
          </Button>

          {/* Mobile menu toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border">
          <nav className="flex flex-col space-y-1 px-4 py-3 bg-background">
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-3 rounded-md transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Danh sách các trường đại học
            </NavLink>
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-3 rounded-md transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bảng xếp hạng các trường ĐH
            </NavLink>
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-3 rounded-md transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tính điểm quy đổi tiếng Anh
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

import { ThemeToggle } from "../ui/ThemeToggle";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Copyright */}
        <div className="text-sm text-muted-foreground">
          © 2025 TimTruong. All rights reserved
        </div>

        {/* Right side links and theme toggle */}
        <div className="flex items-center space-x-6">
          <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Về chúng tôi
          </span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

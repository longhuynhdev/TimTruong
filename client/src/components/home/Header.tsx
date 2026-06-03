import { Link } from "@tanstack/react-router";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="w-full border-b bg-background border-border">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<div className="flex items-center">
					<Link
						to="/"
						className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
					>
						<img src="/logo.svg" alt="TimTruong Logo" className="h-12 w-12" />
						{/* <span className="text-lg sm:text-xl font-semibold text-foreground">
							TimTruong
						</span> */}
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden lg:flex items-center space-x-8">
					<Link
						to="/tim-kiem"
						className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-2 rounded-md transition-colors duration-200"
					>
						Tìm trường theo điểm
					</Link>
					<Link
						to="/danh-sach-truong"
						className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-2 rounded-md transition-colors duration-200"
					>
						Danh sách trường Đại học
					</Link>
					<Link
						to="/to-hop-mon"
						className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-2 rounded-md transition-colors duration-200"
					>
						Tổ hợp môn
					</Link>
				</nav>

				{/* Right side actions */}
				<div className="flex items-center space-x-2 sm:space-x-4">
					{/* Desktop CTA button */}
					<Button
						asChild
						className="hidden sm:flex hover:bg-primary/80 hover:shadow-md transition-all duration-200"
					>
						<Link to="/tim-kiem">
							<Search className="h-6 w-6" />
							Tìm trường ngay
						</Link>
					</Button>

					{/* Mobile CTA button (icon only on very small screens) */}
					<Button
						asChild
						size="sm"
						className="sm:hidden hover:bg-primary/80 transition-all duration-200"
					>
						<Link to="/tim-kiem">
							<Search className="h-6 w-6" />
							Tìm trường ngay
						</Link>
					</Button>

					{/* Mobile menu toggle button */}
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</Button>
				</div>
			</div>

			{/* Mobile Navigation Menu */}
			{mobileMenuOpen && (
				<div className="lg:hidden border-t border-border">
					<nav className="flex flex-col space-y-1 px-4 py-3 bg-background">
						<Link
							to="/tim-kiem"
							className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-2 rounded-md transition-colors duration-200"
						>
							Tìm trường theo điểm
						</Link>
						<Link
							to="/danh-sach-truong"
							className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-3 rounded-md transition-colors duration-200"
							onClick={() => setMobileMenuOpen(false)}
						>
							Danh sách trường
						</Link>
						<Link
							to="/to-hop-mon"
							className="text-muted-foreground hover:text-primary hover:bg-accent px-3 py-3 rounded-md transition-colors duration-200"
							onClick={() => setMobileMenuOpen(false)}
						>
							Tổ hợp môn
						</Link>
					</nav>
				</div>
			)}
		</header>
	);
};

export default Header;

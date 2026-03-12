import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";

const HomeLayout = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 flex flex-col">
				<Outlet />
			</main>
			<Footer />
			<Toaster position="bottom-right" richColors />
		</div>
	);
};
export default HomeLayout;

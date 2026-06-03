import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import ErrorPage from "@/pages/auth/ErrorPage";
import NotFoundPage from "@/pages/auth/NotFoundPage";

export const Route = createRootRoute({
	// Renders for every route
	component: () => (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 flex flex-col">
				{/* Child routes render here */}
				<Outlet />
				<TanStackRouterDevtools />
			</main>
			<Footer />
			<Toaster position="bottom-right" richColors />
		</div>
	),

	// Renders when no route matches the URL
	notFoundComponent: NotFoundPage,

	// Renders when an uncaught error is thrown — receives { error, reset }
	errorComponent: ErrorPage,
});

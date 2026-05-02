import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/danh-sach-truong")({
	component: () => <Outlet />,
});

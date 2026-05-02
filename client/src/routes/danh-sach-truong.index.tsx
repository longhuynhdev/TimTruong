import { createFileRoute } from "@tanstack/react-router";
import UniversitiesPage from "@/pages/UniversitiesPage";

export const Route = createFileRoute("/danh-sach-truong/")({
	component: UniversitiesPage,
});

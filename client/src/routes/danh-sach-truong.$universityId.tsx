import { createFileRoute } from "@tanstack/react-router";
import UniversityDetailPage from "@/pages/UniversityDetailPage";

export const Route = createFileRoute("/danh-sach-truong/$universityId")({
	component: UniversityDetailPage,
});

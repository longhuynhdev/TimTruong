import { createFileRoute } from "@tanstack/react-router";
import SubjectCombinationsPage from "@/pages/SubjectCombinationsPage";

export const Route = createFileRoute("/to-hop-mon")({
	component: SubjectCombinationsPage,
});

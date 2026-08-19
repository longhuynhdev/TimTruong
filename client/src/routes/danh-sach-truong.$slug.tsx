import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import UniversityDetailPage from "@/pages/UniversityDetailPage";

// ?major=<id> deep-links to a specific major row (auto-expanded + scrolled into
// view), e.g. when arriving from the subject-combination detail view.
const searchSchema = z.object({
	major: z.coerce.number().int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/danh-sach-truong/$slug")({
	validateSearch: searchSchema,
	component: UniversityDetailPage,
});

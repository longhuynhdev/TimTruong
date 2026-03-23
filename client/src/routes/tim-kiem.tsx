import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import SearchPage from "@/pages/SearchPage";

// Declares the shape of URL search params for this route.
// e.g. /tim-kiem?score=24.5&examType=THPTQG&subject=A00
//
// All fields are optional so that <Link to="/tim-kiem"> works without params.
// .catch(undefined) means: if a param value is invalid, silently drop it
// rather than crashing (e.g. /tim-kiem?examType=INVALID → examType: undefined).
const searchSchema = z.object({
	score: z.string().optional(),
	examType: z.enum(["THPTQG", "ĐGNL"]).optional().catch(undefined),
	subject: z.string().optional(),
});

export const Route = createFileRoute("/tim-kiem")({
	validateSearch: searchSchema,
	component: SearchPage,
});

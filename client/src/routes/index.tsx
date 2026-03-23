import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/pages/HomePage";

// createFileRoute('/') declares this file handles the '/' path.
// The path string must match the file's location in src/routes/.
export const Route = createFileRoute("/")({
	component: HomePage,
});

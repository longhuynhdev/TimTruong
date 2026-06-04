/**
 * Generates public/sitemap.xml at build time.
 *
 * Static routes are always written. University detail URLs are fetched from the
 * API; if the API is unreachable, the script logs a warning and still writes the
 * static routes (fail-soft) so the build never breaks.
 *
 * Run: `bun run scripts/generate-sitemap.ts`
 * Env: SITEMAP_API_URL (preferred) or VITE_API_URL — base URL of the API.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = "https://timtruong.app";
const API_BASE_URL =
	process.env.SITEMAP_API_URL ||
	process.env.VITE_API_URL ||
	"http://localhost:5309";
const OUTPUT = join(import.meta.dirname, "..", "public", "sitemap.xml");

const STATIC_PATHS = ["/", "/tim-kiem", "/to-hop-mon", "/danh-sach-truong"];

interface University {
	id: number;
	// Populated once the backend exposes slugs (Phase 4). Falls back to id.
	slug?: string | null;
}

function urlEntry(path: string, today: string): string {
	return `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`;
}

async function fetchUniversityPaths(): Promise<string[]> {
	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/universities`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const universities: University[] = await res.json();
		return universities.map((u) => `/danh-sach-truong/${u.slug ?? u.id}`);
	} catch (err) {
		console.warn(
			`[sitemap] Không lấy được danh sách trường từ ${API_BASE_URL} (${err}). ` +
				"Chỉ ghi các route tĩnh.",
		);
		return [];
	}
}

async function main() {
	const today = new Date().toISOString().split("T")[0];
	const paths = [...STATIC_PATHS, ...(await fetchUniversityPaths())];
	const body = paths.map((p) => urlEntry(p, today)).join("\n");
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
	writeFileSync(OUTPUT, xml, "utf-8");
	console.log(`[sitemap] Đã ghi ${paths.length} URL vào ${OUTPUT}`);
}

main();

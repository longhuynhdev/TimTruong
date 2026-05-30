/**
 * Cloudflare Worker that serves the SPA assets and, for university detail
 * pages, injects per-page Open Graph / Twitter meta into the static HTML shell.
 *
 * Why: the SPA renders meta client-side via React, which Google sees (it runs
 * JS) but social crawlers (Facebook, Zalo, Twitter) do not. This Worker rewrites
 * the shell server-side so shared links show the correct title/description/image.
 *
 * Bundled by Wrangler (esbuild), NOT by Vite — kept outside src/ on purpose.
 */

interface Env {
	/** Static assets binding (the built dist/ folder). */
	ASSETS: Fetcher;
	/** Base URL of the API, e.g. https://api.timtruong.app. Set in wrangler.jsonc. */
	API_BASE_URL: string;
}

const SITE_URL = "https://timtruong.app";
const SITE_NAME = "TimTruong";
const DETAIL_PREFIX = "/danh-sach-truong/";

interface University {
	name: string;
	imageUrl: string | null;
}

/** Replaces the content attribute of a meta tag matched by selector. */
class MetaContentHandler {
	constructor(private readonly value: string) {}
	element(el: Element) {
		el.setAttribute("content", this.value);
	}
}

class TitleHandler {
	constructor(private readonly value: string) {}
	element(el: Element) {
		el.setInnerContent(this.value);
	}
}

class CanonicalHandler {
	constructor(private readonly href: string) {}
	element(el: Element) {
		el.setAttribute("href", this.href);
	}
}

async function injectUniversityMeta(slug: string, request: Request, env: Env): Promise<Response> {
	// Always start from the SPA shell so the page still works if the API fails.
	const shell = await env.ASSETS.fetch(new Request(new URL("/", request.url), request));

	let university: University | null = null;
	try {
		const res = await fetch(
			`${env.API_BASE_URL}/api/v1/universities/by-slug/${encodeURIComponent(slug)}`,
		);
		if (res.ok) university = (await res.json()) as University;
	} catch {
		// Network/API error → serve the shell with default meta.
	}

	if (!university) return shell;

	const title = `${university.name} - ${SITE_NAME}`;
	const description = `Thông tin tuyển sinh, học phí và danh sách ngành học của ${university.name}`;
	const image = university.imageUrl || `${SITE_URL}/og-image.png`;
	const url = `${SITE_URL}${DETAIL_PREFIX}${slug}`;

	return new HTMLRewriter()
		.on("title", new TitleHandler(title))
		.on('meta[property="og:title"]', new MetaContentHandler(title))
		.on('meta[property="og:description"]', new MetaContentHandler(description))
		.on('meta[property="og:image"]', new MetaContentHandler(image))
		.on('meta[property="og:url"]', new MetaContentHandler(url))
		.on('meta[name="description"]', new MetaContentHandler(description))
		.on('meta[name="twitter:title"]', new MetaContentHandler(title))
		.on('meta[name="twitter:description"]', new MetaContentHandler(description))
		.on('meta[name="twitter:image"]', new MetaContentHandler(image))
		.on('link[rel="canonical"]', new CanonicalHandler(url))
		.transform(shell);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const match = url.pathname.match(/^\/danh-sach-truong\/([^/]+)\/?$/);

		if (match && request.method === "GET") {
			return injectUniversityMeta(decodeURIComponent(match[1]), request, env);
		}

		// Everything else: serve static assets (with SPA fallback per wrangler config).
		return env.ASSETS.fetch(request);
	},
};

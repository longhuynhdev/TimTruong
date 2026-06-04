const SITE_URL = "https://timtruong.app";
// Brand shown in titles/og:site_name. Kept separate from the domain (SITE_URL)
// so a future domain change (e.g. .net/.com) doesn't touch the brand text.
const SITE_NAME = "TimTruong";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/** Build an absolute URL on the production domain from a path or full URL. */
function toAbsoluteUrl(input?: string): string {
	if (input) {
		// Already absolute → keep as-is; otherwise prefix the site origin.
		return input.startsWith("http") ? input : `${SITE_URL}${input}`;
	}
	// Fall back to the current path (client-side only).
	const path =
		typeof window !== "undefined"
			? window.location.pathname + window.location.search
			: "/";
	return `${SITE_URL}${path}`;
}

interface PageMetadataProps {
	title: string;
	description?: string;
	image?: string;
	/** Path (e.g. "/tim-kiem") or absolute URL. Defaults to the current path. */
	url?: string;
	type?: "website" | "article";
	/** When true, ask crawlers not to index this page (e.g. 404/error). */
	noindex?: boolean;
}

const PageMetadata = ({
	title,
	description,
	image,
	url,
	type = "website",
	noindex = false,
}: PageMetadataProps) => {
	const fullTitle = `${title} - ${SITE_NAME}`;
	const canonicalUrl = toAbsoluteUrl(url);
	const ogImage = image ? toAbsoluteUrl(image) : DEFAULT_IMAGE;

	return (
		<>
			{/* Basic Meta Tags */}
			<title>{fullTitle}</title>
			{description && <meta name="description" content={description} />}
			{noindex && <meta name="robots" content="noindex, follow" />}

			{/* Open Graph Tags */}
			<meta property="og:title" content={fullTitle} />
			{description && <meta property="og:description" content={description} />}
			<meta property="og:type" content={type} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:locale" content="vi_VN" />
			<meta property="og:image" content={ogImage} />
			<meta property="og:url" content={canonicalUrl} />

			{/* Twitter Card Tags */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			{description && <meta name="twitter:description" content={description} />}
			<meta name="twitter:image" content={ogImage} />

			{/* Canonical URL */}
			<link rel="canonical" href={canonicalUrl} />
		</>
	);
};

export default PageMetadata;

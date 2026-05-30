/**
 * Renders a JSON-LD structured-data block. React 19 hoists the <script> into
 * <head>, so crawlers (esp. Google) can read schema.org metadata for the page.
 */
const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
	<script
		type="application/ld+json"
		dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
	/>
);

export default JsonLd;

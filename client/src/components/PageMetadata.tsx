interface PageMetadataProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

const PageMetadata = ({
  title,
  description,
  image,
  url,
  type = "website",
}: PageMetadataProps) => {
  const fullTitle = `${title} - TimTruong.app`;
  const siteName = "TimTruong.app";

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {/* Canonical URL */}
      {url && <link rel="canonical" href={url} />}
    </>
  );
};

export default PageMetadata;

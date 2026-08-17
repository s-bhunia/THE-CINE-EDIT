import { useLocation } from 'react-router';
import { site } from '@/content/site';

interface Breadcrumb {
  name: string;
  path: string;
}

interface MetaProps {
  title?: string;
  description?: string;
  image?: string;
  video?: string;
  type?: 'website' | 'video.movie' | 'profile';
  jsonLd?: Record<string, unknown>;
  breadcrumbs?: Breadcrumb[];
}

function absolute(value: string) {
  return value.startsWith('/') ? `${site.origin}${value}` : value;
}

export function Meta({
  title,
  description = 'Wedding & cinematic film editor based in West Bengal.',
  image = '/og/default.jpg',
  video,
  type = 'website',
  jsonLd,
  breadcrumbs,
}: MetaProps) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} — ${site.name}` : site.name;
  const origin = site.origin;
  const path = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
  const url = `${origin}${path}` || origin;
  const imageUrl = absolute(image);
  const videoUrl = video ? absolute(video) : undefined;

  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Person', 'ProfessionalService'],
    name: site.editor,
    url: url,
    image: imageUrl,
    telephone: site.contact.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Egra',
      addressRegion: 'West Bengal',
      addressCountry: 'IN',
    },
  };

  const breadcrumbJsonLd = breadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: `${origin}${crumb.path}`,
        })),
      }
    : null;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {videoUrl && <meta property="og:video" content={videoUrl} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />

      <script type="application/ld+json">
        {JSON.stringify(jsonLd || defaultJsonLd)}
      </script>
      {breadcrumbJsonLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      )}
    </>
  );
}

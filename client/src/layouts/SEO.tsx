import * as React from 'react';
import Head from 'next/head';

import { Props } from '../../typings/layouts/SEO';

const SEO: React.FC<Props> = ({
  title,
  description,
  canonicalURL,
  ogImageURL,
  ogImageAlt,
}: Props) => {
  return (
    <Head>
      <meta charSet="UTF-8" />
      <title>{`${title} | Annachi Online`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalURL} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph Protocol */}
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={title} />
      <meta property="og:url" content={canonicalURL} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImageURL} />
      <meta property="og:image:alt" content={ogImageAlt} />
    </Head>
  );
};

export default SEO;

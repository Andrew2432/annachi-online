import * as React from 'react';
import { NextPage } from 'next';

import Home from '../src/components/home/Home';
import Layout from '../src/layouts/Layout';
import SEO from '../src/layouts/SEO';

const IndexPage: NextPage = () => {
  return (
    <Layout>
      <SEO title="Home" description="Welcome to Annachi Online" />
      <Home />
    </Layout>
  );
};

export default IndexPage;

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';

import theme from '../src/utils/theme';

type Props = {
  Component: React.ComponentType<React.ComponentProps<any>>;
  pageProps: React.ComponentProps<any>;
};

const MyApp: React.FC<Props> = (props: Props) => {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (!jssStyles?.parentElement) return;
    jssStyles.parentElement.removeChild(jssStyles);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default MyApp;

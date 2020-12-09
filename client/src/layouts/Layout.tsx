import React from 'react';
import Box from '@material-ui/core/Box';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Props } from '../../typings/layouts/Layout';
import Header from './header/Header';
import Footer from './footer/Footer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '100vh',
      maxWidth: '100vw',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    main: {
      flex: '1 0 auto',
      marginTop: theme.spacing(2),
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
    },
  })
);

const Layout: React.FC<Props> = ({ children }: Props) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Header />
      <main className={classes.main}>{children}</main>
      <Footer />
    </Box>
  );
};

export default Layout;

import * as React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      width: '100%',
      marginTop: theme.spacing(5),
      textAlign: 'center',
      color: theme.palette.common.white,
      backgroundColor: theme.palette.common.black,
    },
    grid: {
      padding: theme.spacing(2),
    },
  })
);

const Footer: React.FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Grid
        container
        direction="column"
        alignItems="center"
        justify="center"
        spacing={3}
        className={classes.grid}
      >
        <Grid item>
          <Typography variant="h6" component="p">
            Copyright&copy; {new Date().getUTCFullYear()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;

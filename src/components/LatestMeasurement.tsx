import { makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
  root: {
    backgroundColor: 'white',
    padding: '12px 15px',
    borderRadius: 8,
    marginRight: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 500,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bolder',
  },
});

const LatestMeasurement = ({ metric, value }: { metric: string; value: string }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.label}>{metric}</div>
      <div className={classes.value}>{value}</div>
    </div>
  );
};

export default LatestMeasurement;

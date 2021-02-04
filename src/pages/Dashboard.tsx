import React, { useEffect, useState } from 'react';
import { useLazyQuery, useSubscription } from '@apollo/client';
import { GET_MULTIPLE_MEASUREMENTS } from '../graphql/queries';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMinutes } from 'date-fns';
import filter from 'lodash/filter';
import find from 'lodash/find';
import get from 'lodash/get';
import MetricsSelect from '../components/MetricsSelect';
import { makeStyles } from '@material-ui/core/styles';
import { Snackbar } from '@material-ui/core';
import { FormattedMeasurement, Measurement, MetricDataSet } from '../helpers/entities';
import { SUBSCRIBE_TO_NEW_MEASUREMENT } from '../graphql/subscriptions';
import { differenceInMilliseconds } from 'date-fns/esm';
import LatestMeasurement from '../components/LatestMeasurement';

const useStyles = makeStyles({
  root: {
    width: '90%',
    height: '90%',
    margin: 'auto',
  },
  graphData: {
    width: '90%',
    height: '90%',
    margin: 'auto',
  },
  latestContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  reponseError: {
    backgroundColor: '#FBE9E8',
    color: '#AC231A',
    fontSize: '17px',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
  },
});

const timeStampBefore20Mins = subMinutes(new Date(), 20).getTime();

const METRIC_COLORS = ['#ff9292', '#583d72', '#0a043c', '#ec4646', '#493323', '#ffe227'];

const Dashboard = () => {
  const classes = useStyles();
  const [isSnackOpen, setIsSnackOpen] = useState(false);
  const [severity, setSeverity] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [latestData, setLatestData] = useState<any>({});

  const [getMeasurementsQuery, { data: allMetricsData, called, error }] = useLazyQuery(GET_MULTIPLE_MEASUREMENTS, {
    variables: {
      input: selectedMetrics.map(metric => ({
        metricName: metric,
        after: timeStampBefore20Mins,
      })),
    },
  });

  const { data: newMeasurementData } = useSubscription<{ newMeasurement: Measurement }>(SUBSCRIBE_TO_NEW_MEASUREMENT);

  const [graphData, setGraphData] = useState<FormattedMeasurement[]>([]);

  const formattedXaxisTick = (value: string) => {
    const formattedTick = format(new Date(value), 'HH:mm');
    return formattedTick;
  };

  const formattedTooltipLabel = (value: string) => {
    const formattedTick = format(new Date(value), 'MMM dd, HH:mm:ss');
    return formattedTick;
  };

  useEffect(() => {
    if (!called) {
      getMeasurementsQuery();
    }
  }, []);

  useEffect(() => {
    if (newMeasurementData && selectedMetrics.length && graphData.length) {
      const {
        newMeasurement: { at, metric, value, unit },
      } = newMeasurementData;
      setLatestData((prev: any) => ({
        ...prev,
        [metric]: { at, metric, value, unit },
      }));
      const isMoreThanOneSecond = differenceInMilliseconds(new Date(at), new Date(graphData[graphData.length - 1].at));
      if (isMoreThanOneSecond >= 500) {
        setGraphData((prev: FormattedMeasurement[]) => [
          ...prev,
          {
            at,
            [metric]: value,
            [`${metric}Unit`]: unit,
            metric,
          },
        ]);
      }
    }
  }, [newMeasurementData]);

  useEffect(() => {
    if (error) {
      setIsSnackOpen(true);
      setMessage('Something Went Wrong, developers are actively working on the fix');
      setSeverity('error');
      console.log(error);
    }
  }, [error]);

  useEffect(() => {
    if (allMetricsData) {
      let formattedData: FormattedMeasurement[] = [];
      allMetricsData.getMultipleMeasurements.forEach((dataSet: MetricDataSet) => {
        dataSet.measurements.forEach((measurement: Measurement) => {
          const existingObj = find(formattedData, { at: measurement.at });
          if (existingObj) {
            formattedData = [
              ...filter(formattedData, (data: FormattedMeasurement) => data.at !== measurement.at),
              {
                ...existingObj,
                [measurement.metric]: measurement.value,
                [`${measurement.metric}Unit`]: measurement.unit,
                metric: measurement.metric,
              },
            ];
          } else {
            formattedData.push({
              at: measurement.at,
              [measurement.metric]: measurement.value,
              [`${measurement.metric}Unit`]: measurement.unit,
              metric: measurement.metric,
            });
          }
        });
      });
      setGraphData(formattedData);
    }
  }, [allMetricsData]);

  const handleResponseClose = (event: any, reason: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsSnackOpen(false);
  };

  return (
    <div className={classes.root}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        ContentProps={{
          classes: {
            root: severity === 'error' ? classes.reponseError : undefined,
          },
        }}
        open={isSnackOpen}
        onClose={handleResponseClose}
        autoHideDuration={10000}
        message={message}
      />
      <MetricsSelect {...{ selectedMetrics, setSelectedMetrics }} />
      <div className={classes.latestContainer}>
        {selectedMetrics.map((metric: string) => (
          <LatestMeasurement
            metric={metric}
            value={`${get(latestData, `${metric}.value`, '')} ${get(latestData, `${metric}.unit`, '')}`}
          />
        ))}
      </div>
      <div className={classes.graphData}>
        {graphData.length ? (
          <ResponsiveContainer>
            <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              {selectedMetrics.map((metric, index) => (
                <Line
                  dot={false}
                  key={metric}
                  yAxisId={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={METRIC_COLORS[index]}
                  isAnimationActive={false}
                />
              ))}
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="at"
                tickFormatter={formattedXaxisTick}
                minTickGap={100}
                domain={[(dataMin: any) => 0 - Math.abs(dataMin), (dataMax: any) => dataMax * 2]}
              />
              {selectedMetrics.map(metric => (
                <YAxis
                  yAxisId={metric}
                  label={{ value: metric, angle: -90, position: 'insideLeft' }}
                  dataKey={metric}
                  style={{ marginLeft: 20 }}
                />
              ))}
              <Tooltip labelFormatter={formattedTooltipLabel} />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;

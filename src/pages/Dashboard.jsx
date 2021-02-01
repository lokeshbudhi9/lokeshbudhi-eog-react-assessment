import React, { useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_MULTIPLE_MEASUREMENTS } from '../graphql/queries';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMinutes } from 'date-fns';
import filter from 'lodash/filter';
import find from 'lodash/find';
import MetricsSelect from '../components/MetricsSelect';

const timeStampBefore20Mins = subMinutes(new Date(), 20).getTime();

const METRIC_COLORS = ['#ff9292', '#583d72', '#0a043c', '#ec4646', '#493323', '#ffe227'];

const Dashboard = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [getMeasurementsQuery, { data: allMetricsData, called, error }] = useLazyQuery(GET_MULTIPLE_MEASUREMENTS, {
    variables: {
      input: selectedMetrics.map(metric => ({
        metricName: metric,
        after: timeStampBefore20Mins,
      })),
    },
  });

  const [graphData, setGraphData] = useState([]);

  const formattedXaxisTick = value => {
    const formattedTick = format(new Date(value), 'HH:mm');
    return formattedTick;
  };

  const formattedTooltipLabel = value => {
    const formattedTick = format(new Date(value), 'MMM dd, HH:mm');
    return formattedTick;
  };

  useEffect(() => {
    if (!called) {
      getMeasurementsQuery();
    }
  }, []);

  useEffect(() => {
    console.log(error);
  }, [error]);

  useEffect(() => {
    if (allMetricsData) {
      let formattedData = [];
      allMetricsData.getMultipleMeasurements.forEach(dataSet => {
        dataSet.measurements.forEach(measurement => {
          const existingObj = find(formattedData, { at: measurement.at });
          if (existingObj) {
            formattedData = [
              ...filter(formattedData, data => data.at !== measurement.at),
              {
                ...existingObj,
                [measurement.metric]: measurement.value,
                [`${measurement.metric}Unit`]: measurement.unit,
              },
            ];
          } else {
            formattedData.push({
              at: measurement.at,
              [measurement.metric]: measurement.value,
              [`${measurement.metric}Unit`]: measurement.unit,
            });
          }
        });
      });
      setGraphData(formattedData);
    }
  }, [allMetricsData]);

  return (
    <div style={{ width: '90%', height: '90%', margin: 'auto', backgroundColor: 'white' }}>
      <MetricsSelect {...{ selectedMetrics, setSelectedMetrics }} />
      <div style={{ width: '90%', height: '90%', margin: 'auto', backgroundColor: 'white' }}>
        {graphData.length ? (
          <ResponsiveContainer>
            <LineChart width={600} height={300} data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              {selectedMetrics.map((metric, index) => (
                <Line
                  dot={false}
                  key={metric}
                  yAxisId={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={METRIC_COLORS[index]}
                />
              ))}
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="at" tickFormatter={formattedXaxisTick} minTickGap={100} />
              {selectedMetrics.map(metric => (
                <YAxis
                  yAxisId={metric}
                  label={{ value: metric, angle: -90, position: 'insideLeft' }}
                  dataKey={metric}
                  style={{ marginLeft: 20 }}
                />
              ))}
              <Tooltip labelFormatter={formattedTooltipLabel} label="test" />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;

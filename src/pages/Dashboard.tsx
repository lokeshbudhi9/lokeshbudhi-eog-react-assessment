import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MULTIPLE_MEASUREMENTS } from '../graphql/queries';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { error, data, loading, refetch } = useQuery(GET_MULTIPLE_MEASUREMENTS, {
    variables: {
      input: [
        {
          metricName: 'injValveOpen',
          after: 1612164170093,
        },
      ],
    },
  });

  const [graphData, setGraphData] = useState([]);

  const mockData = [{ name: 'Page A', uv: 400, pv: 2400, amt: 2400 }];

  useEffect(() => {
    if (data) {
      console.log(data.getMultipleMeasurements, 'data');
      setGraphData(data.getMultipleMeasurements[0].measurements);
    }
  }, [data]);
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {graphData && (
        <ResponsiveContainer>
          <LineChart width={600} height={300} data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="at" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Dashboard;

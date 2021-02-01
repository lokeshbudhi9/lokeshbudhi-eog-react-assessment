import React, { useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_MULTIPLE_MEASUREMENTS } from '../graphql/queries';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMinutes } from 'date-fns';
import filter from 'lodash/filter';
import find from 'lodash/find';
import MetricsSelect from '../components/MetricsSelect';
import {makeStyles} from '@material-ui/core/styles'
import { Snackbar } from '@material-ui/core';


const useStyles = makeStyles(()=>({
root:{
  width: '90%',
  height: '90%',
  margin:'auto',
  backgroundColor:'white'
},
graphData:{
  width: '90%',
  height: '90%',
  margin:'auto',
  backgroundColor:'white'
},
reponseError:{
  backgroundColor : '#FBE9E8',
  color: '#AC231A',
  fontSize: '17px',
  fontWeight:"bold",
  display:'flex',
  flexDirection:'row',
  flexWrap:'noWrap',
  alignItems:'flex-start'
}
}));

const timeStampBefore20Mins = subMinutes(new Date(), 20).getTime();

const METRIC_COLORS = ['#ff9292', '#583d72', '#0a043c', '#ec4646', '#493323', '#ffe227'];

const Dashboard = () => {
  const classes = useStyles();
  const [isSnackOpen, setIsSnackOpen] = useState(true);
  const [severity, setSeverity] =useState('');
  const [message, setMessage] = useState('');
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
    setIsSnackOpen(true)
    setMessage('Something Went Wrong, developers are actively working on the fix')
    setSeverity('error')
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

const handleResponseClose = (event, reason) =>
{
  if(reason === 'clickaway') {
    return;
  }
  setIsSnackOpen(false);
};

  return (

    <div className = {classes.root} >
    <Snackbar anchorOrigin ={{vertical:'top', horizontal:'right'}}  
    ContentProps ={{
      classes: {
        root:
        severity === 'error' ? classes.reponseError : false
      }
    }}
    open ={isSnackOpen}
    onClose ={handleResponseClose}
    autoHideDuration ={10000} 
    message ={message}
    />
      <MetricsSelect {...{ selectedMetrics, setSelectedMetrics }} />
      <div className = {classes.graphData}>
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

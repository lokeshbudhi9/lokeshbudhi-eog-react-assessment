import { useQuery } from '@apollo/client';
import { Chip, FormControl, Input, InputLabel, MenuItem, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { GET_METRICS } from '../graphql/queries';

const MetricsSelect = ({ selectedMetrics, setSelectedMetrics }) => {
  const { data } = useQuery(GET_METRICS);
  const [allMertrics, setAllMetrics] = useState([]);

  useEffect(() => {
    if (data) {
      setAllMetrics(data.getMetrics);
    }
  }, [data]);

  const handleChange = event => {
    setSelectedMetrics(event.target.value);
  };

  return (
    <div style={{ width: '100%', textAlign: 'right', padding: 20 }}>
      <FormControl style={{ minWidth: 200 }}>
        <InputLabel id="select-metrics-label">Select Metric(s)</InputLabel>
        <Select
          multiple
          value={selectedMetrics}
          onChange={handleChange}
          input={<Input id="select-multiple-chip" />}
          renderValue={selected => (
            <div>
              {selected.map(value => (
                <Chip key={value} label={value} />
              ))}
            </div>
          )}
        >
          {allMertrics.map(name => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default MetricsSelect;

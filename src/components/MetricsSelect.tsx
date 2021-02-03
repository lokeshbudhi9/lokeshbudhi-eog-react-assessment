import { useQuery } from '@apollo/client';
import { Chip, FormControl, Input, InputLabel, MenuItem, Select } from '@material-ui/core';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { GET_METRICS } from '../graphql/queries';

const MetricsSelect = ({
  selectedMetrics,
  setSelectedMetrics,
}: {
  selectedMetrics: string[];
  setSelectedMetrics: Dispatch<SetStateAction<string[]>>;
}) => {
  const { data, error } = useQuery(GET_METRICS);
  const [allMertrics, setAllMetrics] = useState<string[]>([]);

  useEffect(() => {
    console.log(error);
  }, [error]);

  useEffect(() => {
    if (data) {
      setAllMetrics(data.getMetrics);
    }
  }, [data]);

  const handleChange = (event: any) => {
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
          renderValue={(selected: any) => (
            <div>
              {selected.map((value: string) => (
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

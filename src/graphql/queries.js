import { gql } from '@apollo/client';

const GET_MULTIPLE_MEASUREMENTS = gql`
  query GetMultipleMeasurements($input: [MeasurementQuery]) {
    getMultipleMeasurements(input: $input) {
      metric
      measurements {
        at
        value
        metric
        unit
      }
    }
  }
`;

export { GET_MULTIPLE_MEASUREMENTS };

import { gql } from '@apollo/client';

const SUBSCRIBE_TO_NEW_MEASUREMENT = gql`
  subscription {
    newMeasurement {
      metric
      at
      value
      unit
    }
  }
`;

export { SUBSCRIBE_TO_NEW_MEASUREMENT };

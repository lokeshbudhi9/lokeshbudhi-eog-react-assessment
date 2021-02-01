import React from "react";
import { useQuery } from "@apollo/client";
import { GET_MULTIPLE_MEASUREMENTS } from "../graphql/queries";

const Dashboard = () => {
    const { error, data, loading, refetch } = useQuery(GET_MULTIPLE_MEASUREMENTS, {
        variables: {
          input: [
            {
              "metricName": "injValveOpen",
              "after": 1612164170093
            }
          ]
        },
      });
    return <div>The Dashboard</div>
}

export default Dashboard;
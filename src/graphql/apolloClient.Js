import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: 'TODO: ENTER BASE URL HERE',
  cache: new InMemoryCache()
});
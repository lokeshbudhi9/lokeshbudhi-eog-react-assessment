import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { getMainDefinition } from 'apollo-utilities';

//websocket link
const wsLink = new WebSocketLink({
  uri: 'ws://react.eogresources.com/graphql',
  options: {
    //reconnect ws if possible
    reconnect: true,
  },
});

//http request link
const httpLink = new HttpLink({
  uri: 'https://react.eogresources.com/graphql',
});

let link = ApolloLink.from([
  //error handling
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
      );
    }
    if (networkError) console.error(`[Network error]: ${networkError}`, networkError.stack);
  }),
  ApolloLink.split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink,
  ),
]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

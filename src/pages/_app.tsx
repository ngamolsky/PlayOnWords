import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";

import theme from "../theme";
import { BASE_URL } from "../constants";

const link = createHttpLink({
  uri: `${BASE_URL}/api/graphql`,
  credentials: "include",
});

const client = new ApolloClient({
  ssrMode: true,
  cache: new InMemoryCache(),
  link: link,
});

function MyApp({ Component, pageProps }: any) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default MyApp;

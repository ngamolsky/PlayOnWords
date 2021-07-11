import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BoardState: any;
  Date: string;
  Solutions: any;
};


export type Clue = {
  __typename?: 'Clue';
  number: Scalars['Float'];
  x: Scalars['Float'];
  y: Scalars['Float'];
  hint: Scalars['String'];
  length: Scalars['Float'];
};

export type ClueList = {
  __typename?: 'ClueList';
  horizontal: Array<Clue>;
  vertical: Array<Clue>;
};


export enum LoginType {
  Local = 'LOCAL',
  Google = 'GOOGLE'
}

export type Mutation = {
  __typename?: 'Mutation';
  startPuzzleSession: PuzzleSession;
  endPuzzleSession: Scalars['Boolean'];
};


export type MutationStartPuzzleSessionArgs = {
  sessionID?: Maybe<Scalars['String']>;
  puzzleID: Scalars['String'];
};


export type MutationEndPuzzleSessionArgs = {
  sessionID: Scalars['String'];
};

export type Puzzle = {
  __typename?: 'Puzzle';
  puzzleID: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  clues: ClueList;
  date: Scalars['Date'];
  solutions: Scalars['Solutions'];
};

export type PuzzleSession = {
  __typename?: 'PuzzleSession';
  sessionID: Scalars['ID'];
  puzzle: Puzzle;
  participants: Array<User>;
  owner: User;
  startTime: Scalars['Date'];
  boardState: Scalars['BoardState'];
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  recentPuzzles: Array<Puzzle>;
  getPuzzle: Puzzle;
  getPuzzleSession: PuzzleSession;
  getPuzzleSessionsForUser: Array<PuzzleSession>;
};


export type QueryRecentPuzzlesArgs = {
  limit: Scalars['Float'];
};


export type QueryGetPuzzleArgs = {
  puzzleID: Scalars['String'];
};


export type QueryGetPuzzleSessionArgs = {
  sessionID: Scalars['String'];
};


export type QueryGetPuzzleSessionsForUserArgs = {
  userID: Scalars['String'];
};


export type User = {
  __typename?: 'User';
  userID: Scalars['ID'];
  email?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  hashedPassword?: Maybe<Scalars['String']>;
  googleID?: Maybe<Scalars['String']>;
  loginType: LoginType;
  createDate: Scalars['Date'];
  updateDate: Scalars['Date'];
};

export type EndPuzzleSessionMutationVariables = Exact<{
  sessionID: Scalars['String'];
}>;


export type EndPuzzleSessionMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'endPuzzleSession'>
);

export type StartPuzzleSessionMutationVariables = Exact<{
  puzzleID: Scalars['String'];
  sessionID?: Maybe<Scalars['String']>;
}>;


export type StartPuzzleSessionMutation = (
  { __typename?: 'Mutation' }
  & { startPuzzleSession: (
    { __typename?: 'PuzzleSession' }
    & Pick<PuzzleSession, 'sessionID' | 'boardState' | 'startTime'>
    & { owner: (
      { __typename?: 'User' }
      & Pick<User, 'userID' | 'displayName' | 'username'>
    ) }
  ) }
);

export type GetPuzzleQueryVariables = Exact<{
  puzzleID: Scalars['String'];
}>;


export type GetPuzzleQuery = (
  { __typename?: 'Query' }
  & { getPuzzle: (
    { __typename?: 'Puzzle' }
    & Pick<Puzzle, 'puzzleID' | 'date' | 'solutions' | 'title'>
    & { clues: (
      { __typename?: 'ClueList' }
      & { horizontal: Array<(
        { __typename?: 'Clue' }
        & Pick<Clue, 'x' | 'y' | 'hint' | 'length'>
      )>, vertical: Array<(
        { __typename?: 'Clue' }
        & Pick<Clue, 'x' | 'y' | 'hint' | 'length'>
      )> }
    ) }
  ) }
);

export type GetPuzzleSessionQueryVariables = Exact<{
  sessionID: Scalars['String'];
}>;


export type GetPuzzleSessionQuery = (
  { __typename?: 'Query' }
  & { getPuzzleSession: (
    { __typename?: 'PuzzleSession' }
    & Pick<PuzzleSession, 'sessionID' | 'startTime' | 'boardState'>
    & { participants: Array<(
      { __typename?: 'User' }
      & Pick<User, 'displayName'>
    )>, puzzle: (
      { __typename?: 'Puzzle' }
      & Pick<Puzzle, 'puzzleID' | 'date' | 'solutions' | 'title'>
      & { clues: (
        { __typename?: 'ClueList' }
        & { horizontal: Array<(
          { __typename?: 'Clue' }
          & Pick<Clue, 'x' | 'y' | 'hint' | 'length'>
        )>, vertical: Array<(
          { __typename?: 'Clue' }
          & Pick<Clue, 'x' | 'y' | 'hint' | 'length'>
        )> }
      ) }
    ) }
  ) }
);

export type GetPuzzleSessionsForUserQueryVariables = Exact<{
  userID: Scalars['String'];
}>;


export type GetPuzzleSessionsForUserQuery = (
  { __typename?: 'Query' }
  & { getPuzzleSessionsForUser: Array<(
    { __typename?: 'PuzzleSession' }
    & Pick<PuzzleSession, 'sessionID'>
    & { puzzle: (
      { __typename?: 'Puzzle' }
      & Pick<Puzzle, 'puzzleID'>
    ) }
  )> }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'userID' | 'email'>
  )> }
);

export type RecentPuzzlesQueryVariables = Exact<{
  limit: Scalars['Float'];
}>;


export type RecentPuzzlesQuery = (
  { __typename?: 'Query' }
  & { recentPuzzles: Array<(
    { __typename?: 'Puzzle' }
    & Pick<Puzzle, 'puzzleID' | 'date'>
  )> }
);


export const EndPuzzleSessionDocument = gql`
    mutation EndPuzzleSession($sessionID: String!) {
  endPuzzleSession(sessionID: $sessionID)
}
    `;
export type EndPuzzleSessionMutationFn = Apollo.MutationFunction<EndPuzzleSessionMutation, EndPuzzleSessionMutationVariables>;

/**
 * __useEndPuzzleSessionMutation__
 *
 * To run a mutation, you first call `useEndPuzzleSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEndPuzzleSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [endPuzzleSessionMutation, { data, loading, error }] = useEndPuzzleSessionMutation({
 *   variables: {
 *      sessionID: // value for 'sessionID'
 *   },
 * });
 */
export function useEndPuzzleSessionMutation(baseOptions?: Apollo.MutationHookOptions<EndPuzzleSessionMutation, EndPuzzleSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EndPuzzleSessionMutation, EndPuzzleSessionMutationVariables>(EndPuzzleSessionDocument, options);
      }
export type EndPuzzleSessionMutationHookResult = ReturnType<typeof useEndPuzzleSessionMutation>;
export type EndPuzzleSessionMutationResult = Apollo.MutationResult<EndPuzzleSessionMutation>;
export type EndPuzzleSessionMutationOptions = Apollo.BaseMutationOptions<EndPuzzleSessionMutation, EndPuzzleSessionMutationVariables>;
export const StartPuzzleSessionDocument = gql`
    mutation StartPuzzleSession($puzzleID: String!, $sessionID: String) {
  startPuzzleSession(puzzleID: $puzzleID, sessionID: $sessionID) {
    sessionID
    boardState
    startTime
    owner {
      userID
      displayName
      username
    }
  }
}
    `;
export type StartPuzzleSessionMutationFn = Apollo.MutationFunction<StartPuzzleSessionMutation, StartPuzzleSessionMutationVariables>;

/**
 * __useStartPuzzleSessionMutation__
 *
 * To run a mutation, you first call `useStartPuzzleSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartPuzzleSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startPuzzleSessionMutation, { data, loading, error }] = useStartPuzzleSessionMutation({
 *   variables: {
 *      puzzleID: // value for 'puzzleID'
 *      sessionID: // value for 'sessionID'
 *   },
 * });
 */
export function useStartPuzzleSessionMutation(baseOptions?: Apollo.MutationHookOptions<StartPuzzleSessionMutation, StartPuzzleSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartPuzzleSessionMutation, StartPuzzleSessionMutationVariables>(StartPuzzleSessionDocument, options);
      }
export type StartPuzzleSessionMutationHookResult = ReturnType<typeof useStartPuzzleSessionMutation>;
export type StartPuzzleSessionMutationResult = Apollo.MutationResult<StartPuzzleSessionMutation>;
export type StartPuzzleSessionMutationOptions = Apollo.BaseMutationOptions<StartPuzzleSessionMutation, StartPuzzleSessionMutationVariables>;
export const GetPuzzleDocument = gql`
    query GetPuzzle($puzzleID: String!) {
  getPuzzle(puzzleID: $puzzleID) {
    puzzleID
    date
    clues {
      horizontal {
        x
        y
        hint
        length
      }
      vertical {
        x
        y
        hint
        length
      }
    }
    solutions
    title
  }
}
    `;

/**
 * __useGetPuzzleQuery__
 *
 * To run a query within a React component, call `useGetPuzzleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPuzzleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPuzzleQuery({
 *   variables: {
 *      puzzleID: // value for 'puzzleID'
 *   },
 * });
 */
export function useGetPuzzleQuery(baseOptions: Apollo.QueryHookOptions<GetPuzzleQuery, GetPuzzleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPuzzleQuery, GetPuzzleQueryVariables>(GetPuzzleDocument, options);
      }
export function useGetPuzzleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPuzzleQuery, GetPuzzleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPuzzleQuery, GetPuzzleQueryVariables>(GetPuzzleDocument, options);
        }
export type GetPuzzleQueryHookResult = ReturnType<typeof useGetPuzzleQuery>;
export type GetPuzzleLazyQueryHookResult = ReturnType<typeof useGetPuzzleLazyQuery>;
export type GetPuzzleQueryResult = Apollo.QueryResult<GetPuzzleQuery, GetPuzzleQueryVariables>;
export const GetPuzzleSessionDocument = gql`
    query GetPuzzleSession($sessionID: String!) {
  getPuzzleSession(sessionID: $sessionID) {
    sessionID
    participants {
      displayName
    }
    startTime
    puzzle {
      puzzleID
      date
      clues {
        horizontal {
          x
          y
          hint
          length
        }
        vertical {
          x
          y
          hint
          length
        }
      }
      solutions
      title
    }
    boardState
  }
}
    `;

/**
 * __useGetPuzzleSessionQuery__
 *
 * To run a query within a React component, call `useGetPuzzleSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPuzzleSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPuzzleSessionQuery({
 *   variables: {
 *      sessionID: // value for 'sessionID'
 *   },
 * });
 */
export function useGetPuzzleSessionQuery(baseOptions: Apollo.QueryHookOptions<GetPuzzleSessionQuery, GetPuzzleSessionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPuzzleSessionQuery, GetPuzzleSessionQueryVariables>(GetPuzzleSessionDocument, options);
      }
export function useGetPuzzleSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPuzzleSessionQuery, GetPuzzleSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPuzzleSessionQuery, GetPuzzleSessionQueryVariables>(GetPuzzleSessionDocument, options);
        }
export type GetPuzzleSessionQueryHookResult = ReturnType<typeof useGetPuzzleSessionQuery>;
export type GetPuzzleSessionLazyQueryHookResult = ReturnType<typeof useGetPuzzleSessionLazyQuery>;
export type GetPuzzleSessionQueryResult = Apollo.QueryResult<GetPuzzleSessionQuery, GetPuzzleSessionQueryVariables>;
export const GetPuzzleSessionsForUserDocument = gql`
    query GetPuzzleSessionsForUser($userID: String!) {
  getPuzzleSessionsForUser(userID: $userID) {
    sessionID
    puzzle {
      puzzleID
    }
  }
}
    `;

/**
 * __useGetPuzzleSessionsForUserQuery__
 *
 * To run a query within a React component, call `useGetPuzzleSessionsForUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPuzzleSessionsForUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPuzzleSessionsForUserQuery({
 *   variables: {
 *      userID: // value for 'userID'
 *   },
 * });
 */
export function useGetPuzzleSessionsForUserQuery(baseOptions: Apollo.QueryHookOptions<GetPuzzleSessionsForUserQuery, GetPuzzleSessionsForUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPuzzleSessionsForUserQuery, GetPuzzleSessionsForUserQueryVariables>(GetPuzzleSessionsForUserDocument, options);
      }
export function useGetPuzzleSessionsForUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPuzzleSessionsForUserQuery, GetPuzzleSessionsForUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPuzzleSessionsForUserQuery, GetPuzzleSessionsForUserQueryVariables>(GetPuzzleSessionsForUserDocument, options);
        }
export type GetPuzzleSessionsForUserQueryHookResult = ReturnType<typeof useGetPuzzleSessionsForUserQuery>;
export type GetPuzzleSessionsForUserLazyQueryHookResult = ReturnType<typeof useGetPuzzleSessionsForUserLazyQuery>;
export type GetPuzzleSessionsForUserQueryResult = Apollo.QueryResult<GetPuzzleSessionsForUserQuery, GetPuzzleSessionsForUserQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    userID
    email
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const RecentPuzzlesDocument = gql`
    query RecentPuzzles($limit: Float!) {
  recentPuzzles(limit: $limit) {
    puzzleID
    date
  }
}
    `;

/**
 * __useRecentPuzzlesQuery__
 *
 * To run a query within a React component, call `useRecentPuzzlesQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecentPuzzlesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecentPuzzlesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useRecentPuzzlesQuery(baseOptions: Apollo.QueryHookOptions<RecentPuzzlesQuery, RecentPuzzlesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RecentPuzzlesQuery, RecentPuzzlesQueryVariables>(RecentPuzzlesDocument, options);
      }
export function useRecentPuzzlesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RecentPuzzlesQuery, RecentPuzzlesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RecentPuzzlesQuery, RecentPuzzlesQueryVariables>(RecentPuzzlesDocument, options);
        }
export type RecentPuzzlesQueryHookResult = ReturnType<typeof useRecentPuzzlesQuery>;
export type RecentPuzzlesLazyQueryHookResult = ReturnType<typeof useRecentPuzzlesLazyQuery>;
export type RecentPuzzlesQueryResult = Apollo.QueryResult<RecentPuzzlesQuery, RecentPuzzlesQueryVariables>;
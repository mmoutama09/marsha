import {
  APIList,
  fetchList,
  FetchListQueryKey,
  LiveSession,
} from 'lib-components';
import { useQuery, UseQueryOptions } from 'react-query';

type LiveSessionsResponse = APIList<LiveSession>;
type UseLiveSessionsParams = { anonymous_id?: string };
export const useLiveSessionsQuery = (
  params: UseLiveSessionsParams,
  queryConfig?: UseQueryOptions<
    LiveSessionsResponse,
    'livesessions',
    LiveSessionsResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = ['livesessions', params];
  return useQuery<
    LiveSessionsResponse,
    'livesessions',
    LiveSessionsResponse,
    FetchListQueryKey
  >(key, fetchList, queryConfig);
};

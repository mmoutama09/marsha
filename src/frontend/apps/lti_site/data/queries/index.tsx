import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';

import { Maybe, Nullable } from 'lib-common';
import {
  actionOne,
  APIList,
  createOne,
  deleteOne,
  fetchList,
  FetchListQueryKey,
  fetchOne,
  metadata,
  Playlist,
  updateOne,
  useVideo as useVideoStore,
  Document,
  LiveModeType,
  LiveAttendance,
  LiveSession,
  PortabilityRequest,
  SharedLiveMedia,
  Thumbnail,
  TimedText,
  Video,
  VideoStats,
  uploadState,
  Organization,
  modelName,
} from 'lib-components';

import { TimedTextMetadata, VideoMetadata } from 'types/metadata';

export const useOrganization = (
  organizationId: string,
  queryConfig?: UseQueryOptions<Organization, 'organizations', Organization>,
) => {
  const key = ['organizations', organizationId];
  return useQuery<Organization, 'organizations'>(key, fetchOne, queryConfig);
};

export const usePlaylist = (
  playlistId: string,
  queryConfig?: UseQueryOptions<Playlist, 'playlists', Playlist>,
) => {
  const key = ['playlists', playlistId];
  return useQuery<Playlist, 'playlists'>(key, fetchOne, queryConfig);
};

type UseUpdatePlaylistData = Partial<
  Omit<Playlist, 'portable_to'> & { portable_to: string[] }
>;
type UseUpdatePlaylistError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseUpdatePlaylistData]?: string[] }[];
    };
type UseUpdatePlaylistOptions = UseMutationOptions<
  Playlist,
  UseUpdatePlaylistError,
  UseUpdatePlaylistData
>;
export const useUpdatePlaylist = (
  id: string,
  options?: UseUpdatePlaylistOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<Playlist, UseUpdatePlaylistError, UseUpdatePlaylistData>(
    (updatedPlaylist) =>
      updateOne({ name: 'playlists', id, object: updatedPlaylist }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('playlists');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('playlists');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

type PlaylistsResponse = APIList<Playlist>;
type UsePlaylistsParams = { organization: Maybe<string> };
export const usePlaylists = (
  params: UsePlaylistsParams,
  queryConfig?: UseQueryOptions<
    PlaylistsResponse,
    'playlists',
    PlaylistsResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = ['playlists', params];
  return useQuery<
    PlaylistsResponse,
    'playlists',
    PlaylistsResponse,
    FetchListQueryKey
  >(key, fetchList, queryConfig);
};

export const useThumbnail = (
  thumbnailId: string,
  queryConfig?: UseQueryOptions<Thumbnail, 'thumbnails', Thumbnail>,
) => {
  const key = ['thumbnails', thumbnailId];
  return useQuery<Thumbnail, 'thumbnails'>(key, fetchOne, queryConfig);
};

type TimedTextTracksResponse = APIList<TimedText>;
type UseTimedTextTracksParams = { video: string };
export const useTimedTextTracks = (
  params: UseTimedTextTracksParams,
  queryConfig?: UseQueryOptions<
    TimedTextTracksResponse,
    'timedtexttracks',
    TimedTextTracksResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = ['timedtexttracks', params];
  return useQuery<
    TimedTextTracksResponse,
    'timedtexttracks',
    TimedTextTracksResponse,
    FetchListQueryKey
  >(key, fetchList, queryConfig);
};

type UseDeleteTimedTextTrackData = string;
type UseDeleteTimedTextTrackError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseDeleteTimedTextTrackData]?: string[] }[];
    };
type UseDeleteTimedTextTrackOptions = UseMutationOptions<
  Maybe<TimedText>,
  UseDeleteTimedTextTrackError,
  UseDeleteTimedTextTrackData
>;
export const useDeleteTimedTextTrack = (
  options?: UseDeleteTimedTextTrackOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    Maybe<TimedText>,
    UseDeleteTimedTextTrackError,
    UseDeleteTimedTextTrackData
  >(
    (timedTextTrackId) =>
      deleteOne({
        name: 'timedtexttracks',
        id: timedTextTrackId,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('timedtexttracks');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('timedtexttracks');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

type UseDeleteThumbnailData = string;
type UseDeleteThumbnailError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseDeleteThumbnailData]?: string[] }[];
    };
type UseDeleteThumbnailOptions = UseMutationOptions<
  Maybe<Thumbnail>,
  UseDeleteThumbnailError,
  UseDeleteThumbnailData
>;
export const useDeleteThumbnail = (options?: UseDeleteThumbnailOptions) => {
  const queryClient = useQueryClient();
  return useMutation<
    Maybe<Thumbnail>,
    UseDeleteThumbnailError,
    UseDeleteThumbnailData
  >(
    (thumbnailId) =>
      deleteOne({
        name: 'thumbnails',
        id: thumbnailId,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('thumbnails');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('thumbnails');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

export type LiveAttendancesResponse = APIList<LiveAttendance>;
export const useLiveAttendances = (
  queryConfig?: UseQueryOptions<
    LiveAttendancesResponse,
    'livesessions/list_attendances',
    LiveAttendancesResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = ['livesessions/list_attendances'];
  return useQuery<
    LiveAttendancesResponse,
    'livesessions/list_attendances',
    LiveAttendancesResponse,
    FetchListQueryKey
  >(key, fetchList, queryConfig);
};

export const useVideo = (
  videoId: string,
  queryConfig?: UseQueryOptions<Video, 'videos', Video>,
) => {
  const key = ['videos', videoId];
  return useQuery<Video, 'videos'>(key, fetchOne, queryConfig);
};

export const useVideoMetadata = (
  locale: string,
  queryConfig?: UseQueryOptions<
    VideoMetadata,
    'videos',
    VideoMetadata,
    string[]
  >,
) => {
  const key = ['videos', locale];
  return useQuery<VideoMetadata, 'videos', VideoMetadata, string[]>(
    key,
    metadata,
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      cacheTime: Infinity,
      staleTime: Infinity,
      ...queryConfig,
    },
  );
};

export const useFetchTimedTextTrackLanguageChoices = (
  queryConfig?: UseQueryOptions<
    TimedTextMetadata,
    'timedtexttracks',
    TimedTextMetadata,
    string[]
  >,
) => {
  return useQuery<
    TimedTextMetadata,
    'timedtexttracks',
    TimedTextMetadata,
    string[]
  >([modelName.TIMEDTEXTTRACKS], metadata, {
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    cacheTime: Infinity,
    staleTime: Infinity,
    ...queryConfig,
  });
};

export type UseCreateVideoData = {
  playlist: string;
  title: string;
  description?: string;
  lti_id?: string;
  live_type?: Nullable<LiveModeType>;
  upload_state?: uploadState;
};
type UseCreateVideoError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseCreateVideoData]?: string[] }[];
    };
type UseCreateVideoOptions = UseMutationOptions<
  Video,
  UseCreateVideoError,
  UseCreateVideoData
>;
export const useCreateVideo = (options?: UseCreateVideoOptions) => {
  const queryClient = useQueryClient();
  return useMutation<Video, UseCreateVideoError, UseCreateVideoData>(
    (newVideo) => createOne({ name: 'videos', object: newVideo }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
    },
  );
};

type UseUpdateVideoData = Partial<Video>;
type UseUpdateVideoError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseUpdateVideoData]?: string[] }[];
    };
type UseUpdateVideoOptions = UseMutationOptions<
  Video,
  UseUpdateVideoError,
  UseUpdateVideoData
>;
export const useUpdateVideo = (id: string, options?: UseUpdateVideoOptions) => {
  const queryClient = useQueryClient();
  return useMutation<Video, UseUpdateVideoError, UseUpdateVideoData>(
    (updatedVideo) => updateOne({ name: 'videos', id, object: updatedVideo }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

type VideosResponse = APIList<Video>;
type UseVideosParams = Maybe<{ organization?: string; playlist?: string }>;
export const useVideos = (
  params: UseVideosParams,
  queryConfig?: UseQueryOptions<
    VideosResponse,
    'videos',
    VideosResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = ['videos', params];
  return useQuery<VideosResponse, 'videos', VideosResponse, FetchListQueryKey>(
    key,
    fetchList,
    queryConfig,
  );
};

type usePairingVideoError = { code: 'exception' };
type usePairingVideoResponse = {
  secret: string;
  expires_in: number;
};
type usePairingVideoOptions = UseMutationOptions<
  usePairingVideoResponse,
  usePairingVideoError
>;
export const usePairingVideo = (
  id: string,
  options?: usePairingVideoOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<usePairingVideoResponse, usePairingVideoError>(
    () =>
      actionOne({
        name: 'videos',
        id,
        action: 'pairing-secret',
        method: 'GET',
      }),
    {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

export const useStartLiveRecording = (id: string, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<Video>(
    () =>
      actionOne({
        name: 'videos',
        id,
        action: 'start-recording',
        method: 'PATCH',
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('videos');
        useVideoStore.getState().addResource(data);
      },
      onError: () => {
        queryClient.invalidateQueries('videos');
        onError();
      },
    },
  );
};

export const useStopLiveRecording = (id: string, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<Video>(
    () =>
      actionOne({
        name: 'videos',
        id,
        action: 'stop-recording',
        method: 'PATCH',
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('videos');
        useVideoStore.getState().addResource(data);
      },
      onError: () => {
        queryClient.invalidateQueries('videos');
        onError();
      },
    },
  );
};

export const useStatsVideo = (
  videoId: string,
  queryConfig?: UseQueryOptions<VideoStats, 'videos', VideoStats>,
) => {
  const key = ['videos', videoId, 'stats'];
  return useQuery<VideoStats, 'videos'>(key, fetchOne, queryConfig);
};

type UseCreateDocumentData = {
  playlist: string;
  title: string;
  description?: string;
  lti_id?: string;
};
type UseCreateDocumentError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseCreateDocumentData]?: string[] }[];
    };
type UseCreateDocumentOptions = UseMutationOptions<
  Document,
  UseCreateDocumentError,
  UseCreateDocumentData
>;
export const useCreateDocument = (options?: UseCreateDocumentOptions) => {
  const queryClient = useQueryClient();
  return useMutation<Document, UseCreateDocumentError, UseCreateDocumentData>(
    (newDocument) => createOne({ name: 'documents', object: newDocument }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('documents');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
    },
  );
};
type UseUpdateSharedLiveMediaData = Partial<SharedLiveMedia>;
type UseUpdateSharedLiveMediaError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseUpdateSharedLiveMediaData]?: string[] }[];
    };
type UseUpdateSharedLiveMediaOptions = UseMutationOptions<
  SharedLiveMedia,
  UseUpdateSharedLiveMediaError,
  UseUpdateSharedLiveMediaData
>;
export const useUpdateSharedLiveMedia = (
  id: string,
  options?: UseUpdateSharedLiveMediaOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    SharedLiveMedia,
    UseUpdateSharedLiveMediaError,
    UseUpdateSharedLiveMediaData
  >(
    (updatedSharedLiveMedia) =>
      updateOne({
        name: 'sharedlivemedias',
        id,
        object: updatedSharedLiveMedia,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('sharedlivemedias');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('sharedlivemedias');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

type UseDeleteSharedLiveMediaData = string;
type UseDeleteSharedLiveMediaError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseUpdateSharedLiveMediaData]?: string[] }[];
    };
type UseDeleteSharedLiveMediaOptions = UseMutationOptions<
  Maybe<SharedLiveMedia>,
  UseUpdateSharedLiveMediaError,
  UseDeleteSharedLiveMediaData
>;
export const useDeleteSharedLiveMedia = (
  options?: UseDeleteSharedLiveMediaOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    Maybe<SharedLiveMedia>,
    UseDeleteSharedLiveMediaError,
    UseDeleteSharedLiveMediaData
  >(
    (sharedLiveMediaId) =>
      deleteOne({
        name: 'sharedlivemedias',
        id: sharedLiveMediaId,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('sharedlivemedias');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('sharedlivemedias');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

type UseStartSharingLiveMediaOptions = UseMutationOptions<
  SharedLiveMedia,
  UseUpdateVideoError,
  { sharedlivemedia: string }
>;
export const useStartSharingMedia = (
  videoId: string,
  options?: UseStartSharingLiveMediaOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    SharedLiveMedia,
    UseUpdateVideoError,
    { sharedlivemedia: string }
  >(
    (sharedLiveMedia) =>
      actionOne({
        name: 'videos',
        id: videoId,
        action: 'start-sharing',
        method: 'PATCH',
        object: sharedLiveMedia,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

type UseStopSharingLiveMediaOptions = UseMutationOptions<
  SharedLiveMedia,
  UseUpdateVideoError
>;
export const useStopSharingMedia = (
  videoId: string,
  options?: UseStopSharingLiveMediaOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<SharedLiveMedia, UseUpdateVideoError>(
    () =>
      actionOne({
        name: 'videos',
        id: videoId,
        action: 'end-sharing',
        method: 'PATCH',
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries('videos');
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

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

type UseCreatePortabilityRequestData = {
  for_playlist: string;
  from_playlist: string;
  // for now, only allow request creation from LTI context
  from_lti_consumer_site: string; // mandatory in LTI
  from_lti_user_id: string; // mandatory in LTI
};
type UseCreatePortabilityRequestError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseCreatePortabilityRequestData]?: string[] }[];
    };
type UseCreatePortabilityRequestOptions = UseMutationOptions<
  PortabilityRequest,
  UseCreatePortabilityRequestError,
  UseCreatePortabilityRequestData
>;
export const useCreatePortabilityRequest = (
  options?: UseCreatePortabilityRequestOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    PortabilityRequest,
    UseCreatePortabilityRequestError,
    UseCreatePortabilityRequestData
  >(
    (newPortabilityRequest) =>
      createOne({
        name: 'portability-requests',
        object: newPortabilityRequest,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('portability-requests');
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
    },
  );
};

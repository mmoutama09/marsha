import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import {
  useJwt,
  FULL_SCREEN_ERROR_ROUTE,
  useTimedTextTrack,
  APIList,
  LiveSession,
  liveState,
  timedTextMode,
  uploadState,
  PersistentStore,
  liveSessionFactory,
  timedTextMockFactory,
  videoMockFactory,
} from 'lib-components';
import { DateTime } from 'luxon';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { DASHBOARD_ROUTE } from 'components/Dashboard/route';

import { useLiveStateStarted } from 'data/stores/useLiveStateStarted';
import {
  useLivePanelState,
  LivePanelItem,
} from 'data/stores/useLivePanelState';
import { render, Deferred } from 'lib-tests';
import { createPlayer } from 'Player/createPlayer';
import { getAnonymousId } from 'utils/localstorage';

import PublicVideoDashboard from '.';

jest.mock('lib-components', () => ({
  ...jest.requireActual('lib-components'),
  getResource: jest.fn().mockResolvedValue(null),
  useAppConfig: () => ({
    static: {
      img: {
        liveBackground: 'some_url',
      },
    },
  }),
  useCurrentResourceContext: () => [
    {
      permissions: {
        can_update: false,
      },
    },
  ],
  decodeJwt: () => ({}),
}));
jest.mock('Player/createPlayer', () => ({
  createPlayer: jest.fn(),
}));
jest.mock('data/sideEffects/pollForLive', () => ({
  pollForLive: jest.fn(),
}));
jest.mock('utils/localstorage', () => ({
  getAnonymousId: jest.fn(),
}));
jest.mock('utils/resumeLive', () => ({
  resumeLive: jest.fn().mockResolvedValue(null),
}));
jest.mock('video.js', () => ({
  __esModule: true,
  default: {
    getPlayers: () => ({
      r2d2: {
        currentSource: () => 'https://live.m3u8',
        src: jest.fn(),
      },
    }),
  },
}));

jest.mock('components/ConverseInitializer', () => ({
  ConverseInitializer: ({ children }: { children: React.ReactNode }) => {
    return children;
  },
}));

const mockCreatePlayer = createPlayer as jest.MockedFunction<
  typeof createPlayer
>;

const mockGetAnonymousId = getAnonymousId as jest.MockedFunction<
  typeof getAnonymousId
>;

describe('PublicVideoDashboard', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    //    set system date to 2022-01-27T14:00:00
    jest.setSystemTime(new Date(2022, 0, 27, 14, 0, 0));
  });

  beforeEach(() => {
    useJwt.setState({
      jwt: 'some jwt',
    });

    fetchMock.mock(
      '/api/timedtexttracks/',
      {
        actions: {
          POST: {
            language: {
              choices: [
                { display_name: 'English', value: 'en' },
                { display_name: 'French', value: 'fr' },
              ],
            },
          },
        },
      },
      { method: 'OPTIONS' },
    );
    mockCreatePlayer.mockReturnValue({
      addTrack: jest.fn(),
      removeTrack: jest.fn(),
      destroy: jest.fn(),
      getSource: jest.fn(),
      setSource: jest.fn(),
    });

    useLiveStateStarted.setState({
      isStarted: true,
    });
  });

  afterEach(() => {
    fetchMock.restore();
    jest.clearAllMocks();
  });

  it('displays the video player alone', async () => {
    const video = videoMockFactory({
      urls: {
        manifests: {
          hls: 'https://example.com/hls.m3u8',
        },
        mp4: {
          144: 'https://example.com/144p.mp4',
          1080: 'https://example.com/1080p.mp4',
        },
        thumbnails: {
          144: 'https://example.com/thumbnail/144p.jpg',
          1080: 'https://example.com/thumbnail/1080p.jpg',
        },
      },
    });

    const { elementContainer: container } = render(
      <PublicVideoDashboard video={video} playerType="videojs" />,
    );

    await waitFor(() =>
      // The player is created
      expect(mockCreatePlayer).toHaveBeenCalledWith(
        'videojs',
        expect.any(Element),
        expect.anything(),
        video,
        'en',
        expect.any(Function),
      ),
    );

    expect(
      container!.querySelector('source[src="https://example.com/144p.mp4"]'),
    ).not.toBeNull();
    expect(
      container!.querySelector('source[src="https://example.com/1080p.mp4"]'),
    ).not.toBeNull();
    expect(
      container!.querySelectorAll('source[type="video/mp4"]'),
    ).toHaveLength(2);
    const videoElement = container!.querySelector('video')!;
    expect(videoElement.tabIndex).toEqual(-1);
    expect(videoElement.poster).toEqual(
      'https://example.com/thumbnail/1080p.jpg',
    );
  });

  it('displays the video player, the download link and transcripts', async () => {
    const timedTextTracks = [
      timedTextMockFactory({
        is_ready_to_show: true,
        mode: timedTextMode.TRANSCRIPT,
      }),
    ];
    useTimedTextTrack.getState().addMultipleResources(timedTextTracks);
    const video = videoMockFactory({
      has_transcript: true,
      show_download: true,
      timed_text_tracks: timedTextTracks,
      urls: {
        manifests: {
          hls: 'https://example.com/hls.m3u8',
        },
        mp4: {
          144: 'https://example.com/144p.mp4',
          1080: 'https://example.com/1080p.mp4',
        },
        thumbnails: {
          144: 'https://example.com/thumbnail/144p.jpg',
          1080: 'https://example.com/thumbnail/1080p.jpg',
        },
      },
    });

    render(<PublicVideoDashboard video={video} playerType="videojs" />);

    await waitFor(() =>
      // The player is created
      expect(mockCreatePlayer).toHaveBeenCalledWith(
        'videojs',
        expect.any(Element),
        expect.anything(),
        video,
        'en',
        expect.any(Function),
      ),
    );

    screen.getByText('Transcripts');
    screen.getByText('Download video');
  });

  it('uses subtitles as transcripts', async () => {
    const timedTextTracks = [
      timedTextMockFactory({
        id: 'ttt-1',
        is_ready_to_show: true,
        mode: timedTextMode.SUBTITLE,
      }),
    ];
    useTimedTextTrack.getState().addMultipleResources(timedTextTracks);
    const video = videoMockFactory({
      has_transcript: false,
      show_download: true,
      should_use_subtitle_as_transcript: true,
      timed_text_tracks: timedTextTracks,
      urls: {
        manifests: {
          hls: 'https://example.com/hls.m3u8',
        },
        mp4: {
          144: 'https://example.com/144p.mp4',
          1080: 'https://example.com/1080p.mp4',
        },
        thumbnails: {
          144: 'https://example.com/thumbnail/144p.jpg',
          1080: 'https://example.com/thumbnail/1080p.jpg',
        },
      },
    });

    render(<PublicVideoDashboard video={video} playerType="videojs" />);

    await waitFor(() =>
      // The player is created
      expect(mockCreatePlayer).toHaveBeenCalledWith(
        'videojs',
        expect.any(Element),
        expect.anything(),
        video,
        'en',
        expect.any(Function),
      ),
    );

    screen.getByText('Transcripts');
    screen.getByText('Download video');
  });

  it('displays the video player, the tile, the chat and chat action', async () => {
    useLivePanelState.setState({
      isPanelVisible: true,
      currentItem: LivePanelItem.CHAT,
      availableItems: [LivePanelItem.CHAT],
    });
    useLiveStateStarted.getState().setIsStarted(true);
    const video = videoMockFactory({
      title: 'live title',
      live_state: liveState.RUNNING,
      urls: {
        manifests: {
          hls: 'https://example.com/hls.m3u8',
        },
        mp4: {},
        thumbnails: {},
      },
      xmpp: {
        bosh_url: 'https://xmpp-server.com/http-bind',
        converse_persistent_store: PersistentStore.LOCALSTORAGE,
        websocket_url: null,
        conference_url:
          '870c467b-d66e-4949-8ee5-fcf460c72e88@conference.xmpp-server.com',
        prebind_url: 'https://xmpp-server.com/http-pre-bind',
        jid: 'xmpp-server.com',
      },
    });

    const deferred = new Deferred<APIList<LiveSession>>();
    fetchMock.get('/api/livesessions/?limit=999', deferred.promise);

    const { elementContainer: container } = render(
      <PublicVideoDashboard video={video} playerType="videojs" />,
    );
    deferred.resolve({
      count: 1,
      next: '',
      previous: '',
      results: [liveSessionFactory()],
    });
    await waitFor(() =>
      // The player is created
      expect(mockCreatePlayer).toHaveBeenCalledWith(
        'videojs',
        expect.any(Element),
        expect.anything(),
        video,
        'en',
        expect.any(Function),
      ),
    );

    const videoElement = container!.querySelector('video')!;
    expect(videoElement.tabIndex).toEqual(-1);

    screen.getByText('live title');

    screen.getByText('Join the chat');
  });

  it('displays the the ended message when the live is stopping', async () => {
    useLivePanelState.setState({
      isPanelVisible: true,
      currentItem: LivePanelItem.CHAT,
      availableItems: [LivePanelItem.CHAT],
    });
    useLiveStateStarted.getState().setIsStarted(true);
    const video = videoMockFactory({
      title: 'live title',
      live_state: liveState.STOPPING,
      urls: {
        manifests: {
          hls: 'https://example.com/hls.m3u8',
        },
        mp4: {},
        thumbnails: {},
      },
      xmpp: {
        bosh_url: 'https://xmpp-server.com/http-bind',
        converse_persistent_store: PersistentStore.LOCALSTORAGE,
        websocket_url: null,
        conference_url:
          '870c467b-d66e-4949-8ee5-fcf460c72e88@conference.xmpp-server.com',
        prebind_url: 'https://xmpp-server.com/http-pre-bind',
        jid: 'xmpp-server.com',
      },
    });
    const deferred = new Deferred<APIList<LiveSession>>();
    fetchMock.get('/api/livesessions/?limit=999', deferred.promise);

    render(<PublicVideoDashboard video={video} playerType="videojs" />);

    deferred.resolve({
      count: 1,
      next: '',
      previous: '',
      results: [liveSessionFactory()],
    });

    await screen.findByText('Live is starting');
    screen.getByText(
      'You can wait here, the page will be refreshed as soon as the event starts.',
    );
  });

  it('displays the waiting message when the live is starting', async () => {
    const video = videoMockFactory({
      title: 'live title',
      live_state: liveState.STARTING,
      urls: {
        manifests: {
          hls: 'https://example.com/hls.m3u8',
        },
        mp4: {},
        thumbnails: {},
      },
      xmpp: {
        bosh_url: 'https://xmpp-server.com/http-bind',
        converse_persistent_store: PersistentStore.LOCALSTORAGE,
        websocket_url: null,
        conference_url:
          '870c467b-d66e-4949-8ee5-fcf460c72e88@conference.xmpp-server.com',
        prebind_url: 'https://xmpp-server.com/http-pre-bind',
        jid: 'xmpp-server.com',
      },
    });
    useLiveStateStarted.setState({
      isStarted: false,
    });
    const deferred = new Deferred<APIList<LiveSession>>();
    fetchMock.get('/api/livesessions/?limit=999', deferred.promise);

    render(<PublicVideoDashboard video={video} playerType="videojs" />);

    deferred.resolve({
      count: 1,
      next: '',
      previous: '',
      results: [liveSessionFactory()],
    });

    await screen.findByRole('heading', {
      name: 'Live is starting',
    });
  });

  it('redirects to the error component when upload state is deleted', () => {
    const video = videoMockFactory({
      upload_state: uploadState.DELETED,
    });
    render(<PublicVideoDashboard video={video} playerType="videojs" />, {
      routerOptions: {
        routes: [
          {
            path: DASHBOARD_ROUTE(),
            render: ({ match }) => (
              <span>{`dashboard ${match.params.objectType}`}</span>
            ),
          },
          {
            path: FULL_SCREEN_ERROR_ROUTE(),
            render: ({ match }) => (
              <span>{`Error Component: ${match.params.code}`}</span>
            ),
          },
        ],
      },
    });

    screen.getByText('Error Component: videoDeleted');
  });

  it('redirects to the error component when video has no urls', () => {
    const video = videoMockFactory({
      urls: null,
    });
    render(
      <PublicVideoDashboard video={video} playerType="videojs" />,

      {
        routerOptions: {
          routes: [
            {
              path: DASHBOARD_ROUTE(),
              render: ({ match }) => (
                <span>{`dashboard ${match.params.objectType}`}</span>
              ),
            },
            {
              path: FULL_SCREEN_ERROR_ROUTE(),
              render: () => <span>{`Error Component`}</span>,
            },
          ],
        },
      },
    );

    screen.getByText('Error Component');
  });

  it('displays the WaitingLiveVideo component when live is not ready', async () => {
    const video = videoMockFactory({
      live_state: liveState.IDLE,
    });
    useLiveStateStarted.setState({
      isStarted: false,
    });

    const deferred = new Deferred<APIList<LiveSession>>();
    fetchMock.get('/api/livesessions/?limit=999', deferred.promise);

    render(<PublicVideoDashboard video={video} playerType="videojs" />);

    deferred.resolve({
      count: 1,
      next: '',
      previous: '',
      results: [liveSessionFactory()],
    });
    await screen.findByRole('heading', { name: 'Live is starting' });
  });

  it('displays the WaitingLiveVideo component when live_state is IDLE and video is not scheduled', async () => {
    const video = videoMockFactory({
      live_state: liveState.IDLE,
      is_scheduled: false,
    });
    useLiveStateStarted.setState({
      isStarted: false,
    });

    const deferred = new Deferred<APIList<LiveSession>>();
    fetchMock.get('/api/livesessions/?limit=999', deferred.promise);

    render(<PublicVideoDashboard video={video} playerType="videojs" />);
    deferred.resolve({
      count: 1,
      next: '',
      previous: '',
      results: [liveSessionFactory()],
    });
    await screen.findByRole('heading', { name: 'Live is starting' });
  });

  it('displays the SubscribeScheduledVideo component when live_state is IDLE and video is scheduled', async () => {
    const startingAt = new Date();
    startingAt.setFullYear(startingAt.getFullYear() + 10);
    const anonymousId = uuidv4();
    mockGetAnonymousId.mockReturnValue(anonymousId);

    const video = videoMockFactory({
      live_state: liveState.IDLE,
      starting_at: DateTime.fromJSDate(new Date(2022, 0, 29, 11, 0, 0)).toISO(),
      is_scheduled: true,
    });
    useLiveStateStarted.setState({
      isStarted: false,
    });

    const deferred = new Deferred<APIList<LiveSession>>();
    fetchMock.get(
      `/api/livesessions/?limit=999&anonymous_id=${anonymousId}`,
      deferred.promise,
    );

    render(<PublicVideoDashboard video={video} playerType="videojs" />);
    deferred.resolve({
      count: 1,
      next: '',
      previous: '',
      results: [liveSessionFactory({ is_registered: false })],
    });
    await screen.findByRole('button', { name: /register/i });
    screen.getByRole('heading', {
      name: /Live will start in 2 days at 11:00 AM/i,
    });
  });
});

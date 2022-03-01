import { render, screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import React from 'react';

import * as pollForLiveModule from 'data/sideEffects/pollForLive';
import {
  LivePanelItem,
  useLivePanelState,
} from 'data/stores/useLivePanelState';
import { LiveFeedbackProvider } from 'data/stores/useLiveFeedback';
import { LiveModeType, liveState } from 'types/tracks';
import { videoMockFactory } from 'utils/tests/factories';
import { wrapInIntlProvider } from 'utils/tests/intl';

import { TeacherLiveControlBar } from '.';

const spyedPollForLive = jest.spyOn(pollForLiveModule, 'pollForLive');

describe('<TeacherLiveControlBar />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fetchMock.restore();
    jest.useRealTimers();
  });

  it('renders chat and viewers buttons when live is not running', () => {
    fetchMock.get('some_url', 500);
    useLivePanelState.setState({
      availableItems: [LivePanelItem.CHAT, LivePanelItem.VIEWERS_LIST],
    });

    const mockedVideo = videoMockFactory({
      urls: { manifests: { hls: 'some_url' }, mp4: {}, thumbnails: {} },
      live_state: liveState.IDLE,
    });

    render(
      wrapInIntlProvider(
        <LiveFeedbackProvider value={false}>
          <TeacherLiveControlBar video={mockedVideo} />
        </LiveFeedbackProvider>,
      ),
    );

    screen.getByRole('button', { name: 'Show chat' });
    screen.getByRole('button', { name: 'Show viewers' });
    expect(
      screen.queryByRole('button', { name: 'Show live return' }),
    ).not.toBeInTheDocument();

    expect(spyedPollForLive).not.toHaveBeenCalled();
  });

  it('renders chat and viewers buttons when live is jitsi mode and running', () => {
    fetchMock.get('some_url', 500);
    useLivePanelState.setState({
      availableItems: [LivePanelItem.CHAT, LivePanelItem.VIEWERS_LIST],
    });

    const mockedVideo = videoMockFactory({
      urls: { manifests: { hls: 'some_url' }, mp4: {}, thumbnails: {} },
      live_state: liveState.RUNNING,
      live_type: LiveModeType.JITSI,
    });

    render(
      wrapInIntlProvider(
        <LiveFeedbackProvider value={false}>
          <TeacherLiveControlBar video={mockedVideo} />
        </LiveFeedbackProvider>,
      ),
    );

    screen.getByRole('button', { name: 'Show chat' });
    screen.getByRole('button', { name: 'Show viewers' });
    expect(
      screen.queryByRole('button', { name: 'Show live return' }),
    ).not.toBeInTheDocument();

    expect(spyedPollForLive).not.toHaveBeenCalled();
  });

  it('polls for live when live is running and show live feedback button', async () => {
    fetchMock.get('some_url', 404);
    useLivePanelState.setState({
      availableItems: [LivePanelItem.CHAT, LivePanelItem.VIEWERS_LIST],
    });

    const mockedVideo = videoMockFactory({
      urls: { manifests: { hls: 'some_url' }, mp4: {}, thumbnails: {} },
      live_state: liveState.RUNNING,
      live_type: LiveModeType.RAW,
    });

    render(
      wrapInIntlProvider(
        <LiveFeedbackProvider value={false}>
          <TeacherLiveControlBar video={mockedVideo} />
        </LiveFeedbackProvider>,
      ),
    );

    screen.getByRole('button', { name: 'Show chat' });
    screen.getByRole('button', { name: 'Show viewers' });
    expect(
      screen.queryByRole('button', { name: 'Show live feedback' }),
    ).not.toBeInTheDocument();

    await waitFor(() => expect(spyedPollForLive).toHaveBeenCalled());

    expect(
      screen.queryByRole('button', { name: 'Show live feedback' }),
    ).not.toBeInTheDocument();

    fetchMock.get('some_url', 200, { overwriteRoutes: true });
    jest.advanceTimersToNextTimer();

    await screen.findByRole('button', { name: 'Show live feedback' });
  });
});
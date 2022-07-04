import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import React from 'react';
import { setLogger } from 'react-query';

import { InfoWidgetModalProvider } from 'data/stores/useInfoWidgetModal';
import { report } from 'utils/errors/report';
import { videoMockFactory } from 'utils/tests/factories';
import render from 'utils/tests/render';

import { DashboardVideoLiveWidgetToolsAndApplications } from '.';

jest.mock('data/appData', () => ({
  appData: {
    jwt: 'json web token',
  },
}));

jest.mock('utils/errors/report', () => ({
  report: jest.fn(),
}));

setLogger({
  log: () => {},
  warn: () => {},
  error: () => {},
});

describe('<DashboardVideoLiveWidgetToolsAndApplications />', () => {
  afterEach(() => {
    jest.resetAllMocks();
    fetchMock.restore();
  });

  it('renders the widget', () => {
    const mockedVideo = videoMockFactory({
      has_chat: true,
    });

    render(
      <InfoWidgetModalProvider value={null}>
        <DashboardVideoLiveWidgetToolsAndApplications video={mockedVideo} />
      </InfoWidgetModalProvider>,
    );

    screen.getByText('Tools and applications');

    const chatToggleButton = screen.getByRole('checkbox', {
      name: 'Activate chat',
    });
    expect(chatToggleButton).toBeChecked();
    screen.getByText('Activate chat');
  });

  it('clicks on the toggle button for activate the chat', async () => {
    const mockedVideo = videoMockFactory({
      has_chat: false,
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, {
      ...mockedVideo,
      has_chat: true,
    });

    render(
      <InfoWidgetModalProvider value={null}>
        <DashboardVideoLiveWidgetToolsAndApplications video={mockedVideo} />
      </InfoWidgetModalProvider>,
    );

    screen.getByText('Activate chat');
    const chatToggleButton = screen.getByRole('checkbox', {
      name: 'Activate chat',
    });

    await act(async () => userEvent.click(chatToggleButton));
    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.lastCall()![0]).toEqual(`/api/videos/${mockedVideo.id}/`);
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        has_chat: true,
      }),
    });
    expect(chatToggleButton).toBeChecked();
    expect(report).not.toHaveBeenCalled();
    screen.getByText('Video updated.');
  });

  it('clicks on the toggle button for deactivate the chat', async () => {
    const mockedVideo = videoMockFactory({
      has_chat: true,
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, {
      ...mockedVideo,
      has_chat: false,
    });

    render(
      <InfoWidgetModalProvider value={null}>
        <DashboardVideoLiveWidgetToolsAndApplications video={mockedVideo} />
      </InfoWidgetModalProvider>,
    );

    screen.getByText('Activate chat');
    const chatToggleButton = screen.getByRole('checkbox', {
      name: 'Activate chat',
    });

    await act(async () => userEvent.click(chatToggleButton));

    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.lastCall()![0]).toEqual(`/api/videos/${mockedVideo.id}/`);
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        has_chat: false,
      }),
    });
    expect(chatToggleButton).not.toBeChecked();
    expect(report).not.toHaveBeenCalled();
    screen.getByText('Video updated.');
  });

  it('clicks on the toggle button for activate chat, but backend returns an error', async () => {
    const mockedVideo = videoMockFactory({
      has_chat: false,
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, 500);

    render(
      <InfoWidgetModalProvider value={null}>
        <DashboardVideoLiveWidgetToolsAndApplications video={mockedVideo} />
      </InfoWidgetModalProvider>,
    );

    screen.getByText('Activate chat');

    const chatToggleButton = screen.getByRole('checkbox', {
      name: 'Activate chat',
    });
    await act(async () => userEvent.click(chatToggleButton));

    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.lastCall()![0]).toEqual(`/api/videos/${mockedVideo.id}/`);
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        has_chat: true,
      }),
    });
    expect(chatToggleButton).not.toBeChecked();
    expect(report).toHaveBeenCalled();
    screen.getByText('Video update has failed !');
  });
});

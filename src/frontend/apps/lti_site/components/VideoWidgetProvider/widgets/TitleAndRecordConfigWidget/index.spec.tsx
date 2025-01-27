import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { useJwt, videoMockFactory, report } from 'lib-components';
import React from 'react';

import { InfoWidgetModalProvider } from 'data/stores/useInfoWidgetModal';
import render from 'utils/tests/render';
import { wrapInVideo } from 'utils/tests/wrapInVideo';

import { TitleAndRecordConfigWidget } from '.';

jest.mock('lib-components', () => ({
  ...jest.requireActual('lib-components'),
  report: jest.fn(),
}));

describe('<TitleAndRecordConfigWidget />', () => {
  beforeEach(() => {
    useJwt.setState({
      jwt: 'json web token',
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
    fetchMock.restore();
  });

  afterAll(() => {
    jest.runAllTimers();
    jest.useRealTimers();
  });

  it('renders the widget', () => {
    const mockedVideo = videoMockFactory({
      allow_recording: false,
      title: null,
    });

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <TitleAndRecordConfigWidget />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    screen.getByText('General');

    const textInput = screen.getByRole('textbox', {
      name: 'Enter title of your live here',
    });
    expect(textInput).toHaveValue('');
    screen.getByPlaceholderText('Enter title of your live here');

    const recordingToggleButton = screen.getByRole('checkbox', {
      name: 'Activate live recording',
    });
    expect(recordingToggleButton).not.toBeChecked();
    screen.getByText('Activate live recording');
  });

  it('clicks on the toggle button for activate the live recording', async () => {
    const mockedVideo = videoMockFactory({
      allow_recording: false,
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, {
      ...mockedVideo,
      allow_recording: true,
    });

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <TitleAndRecordConfigWidget />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    screen.getByText('Activate live recording');
    const recordingToggleButton = screen.getByRole('checkbox', {
      name: 'Activate live recording',
    });

    await act(async () => userEvent.click(recordingToggleButton));
    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.lastCall()![0]).toEqual(`/api/videos/${mockedVideo.id}/`);
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        allow_recording: true,
      }),
    });
    expect(recordingToggleButton).toBeChecked();
    expect(report).not.toHaveBeenCalled();
    screen.getByText('Video updated.');
  });

  it('clicks on the toggle button for deactivate the live recording', async () => {
    const mockedVideo = videoMockFactory({
      allow_recording: true,
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, {
      ...mockedVideo,
      allow_recording: false,
    });

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <TitleAndRecordConfigWidget />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    screen.getByText('Activate live recording');
    const recordingToggleButton = screen.getByRole('checkbox', {
      name: 'Activate live recording',
    });

    await act(async () => userEvent.click(recordingToggleButton));

    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.lastCall()![0]).toEqual(`/api/videos/${mockedVideo.id}/`);
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        allow_recording: false,
      }),
    });
    expect(recordingToggleButton).not.toBeChecked();
    expect(report).not.toHaveBeenCalled();
    screen.getByText('Video updated.');
  });

  it('clicks on the toggle button for activate live recording, but backend returns an error', async () => {
    const mockedVideo = videoMockFactory({
      allow_recording: false,
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, 500);

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <TitleAndRecordConfigWidget />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    screen.getByText('Activate live recording');

    const recordingToggleButton = screen.getByRole('checkbox', {
      name: 'Activate live recording',
    });
    await act(async () => userEvent.click(recordingToggleButton));

    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.lastCall()![0]).toEqual(`/api/videos/${mockedVideo.id}/`);
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        allow_recording: true,
      }),
    });
    expect(recordingToggleButton).not.toBeChecked();
    expect(report).toHaveBeenCalled();
    screen.getByText('Video update has failed !');
  });

  it('types some text in an empty input text', async () => {
    const mockedVideo = videoMockFactory({
      title: null,
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, {
      ...mockedVideo,
      title: 'An example text',
    });

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <TitleAndRecordConfigWidget />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    const textInput = screen.getByRole('textbox', {
      name: 'Enter title of your live here',
    });
    screen.getByPlaceholderText('Enter title of your live here');
    expect(textInput).toHaveValue('');

    userEvent.type(textInput, 'An example text');
    expect(textInput).toHaveValue('An example text');

    act(() => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => expect(fetchMock.calls()).toHaveLength(1));
    expect(fetchMock.lastCall()![0]).toEqual(`/api/videos/${mockedVideo.id}/`);
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        title: 'An example text',
      }),
    });
    expect(textInput).toHaveValue('An example text');
    expect(report).not.toHaveBeenCalled();
    screen.getByText('Video updated.');
  });

  it('clears the input text', async () => {
    const mockedVideo = videoMockFactory({
      title: 'An existing title',
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, {
      title: ['This field may not be blank.'],
    });

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <TitleAndRecordConfigWidget />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    const textInput = screen.getByRole('textbox', {
      name: 'Enter title of your live here',
    });
    expect(textInput).toHaveValue('An existing title');

    userEvent.clear(textInput);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(fetchMock.calls()).toHaveLength(0);
    await waitFor(() => expect(textInput).toHaveValue('An existing title'));
    expect(report).not.toHaveBeenCalled();
    screen.getByText("Title can't be blank !");
  });

  it('modifies the input text, but the backend returns an error', async () => {
    const mockedVideo = videoMockFactory({
      title: 'An existing title',
    });

    fetchMock.patch(`/api/videos/${mockedVideo.id}/`, 500);

    render(
      wrapInVideo(
        <InfoWidgetModalProvider value={null}>
          <TitleAndRecordConfigWidget />
        </InfoWidgetModalProvider>,
        mockedVideo,
      ),
    );

    const textInput = screen.getByRole('textbox', {
      name: 'Enter title of your live here',
    });
    expect(textInput).toHaveValue('An existing title');

    userEvent.type(textInput, ' and more');
    act(() => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => expect(fetchMock.calls()).toHaveLength(1));
    expect(fetchMock.lastCall()![0]).toEqual(`/api/videos/${mockedVideo.id}/`);
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify({
        title: 'An existing title and more',
      }),
    });
    expect(textInput).toHaveValue('An existing title');
    expect(report).toHaveBeenCalled();
    screen.getByText('Video update has failed !');
  });
});

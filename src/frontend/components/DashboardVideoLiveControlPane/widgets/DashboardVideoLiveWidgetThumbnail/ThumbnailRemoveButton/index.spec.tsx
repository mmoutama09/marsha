import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import MatchMediaMock from 'jest-matchmedia-mock';
import React from 'react';
import toast, { useToaster, Toast, Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';

import { useThumbnail } from 'data/stores/useThumbnail';
import { report } from 'utils/errors/report';
import { thumbnailMockFactory } from 'utils/tests/factories';
import { wrapInIntlProvider } from 'utils/tests/intl';
import { ThumbnailRemoveButton } from '.';

jest.mock('data/appData', () => ({
  appData: {
    jwt: 'json web token',
  },
}));

setLogger({
  log: () => {},
  warn: () => {},
  error: () => {},
});

let matchMedia: MatchMediaMock;

jest.mock('utils/errors/report', () => ({
  report: jest.fn(),
}));

describe('<ThumbnailRemoveButton />', () => {
  let getToastHook: () => any = () => {};

  const ToastHack = () => {
    const toasts = useToaster();
    getToastHook = () => toasts;
    return null;
  };

  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(() => {
    jest.resetAllMocks();
    fetchMock.restore();
    matchMedia.clear();
    const toasts = getToastHook();
    if (toasts.hasOwnProperty('toasts')) {
      toasts.toasts.forEach((item: Toast) => {
        act(() => {
          toast.remove(item.id);
        });
      });
    }
  });

  it('clicks on the remove button and removal is successful', async () => {
    const queryClient = new QueryClient();
    const mockedThumbnail = thumbnailMockFactory();
    useThumbnail.getState().addResource(mockedThumbnail);

    fetchMock.delete(`/api/thumbnails/${mockedThumbnail.id}/`, 204);

    render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <ToastHack />
          <ThumbnailRemoveButton thumbnail={mockedThumbnail} />
        </QueryClientProvider>,
      ),
    );

    const removeButton = screen.getByRole('button', {
      name: 'Delete thumbnail',
    });
    act(() => userEvent.click(removeButton));

    screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    act(() => userEvent.click(confirmButton));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Confirm' })).toBeNull(),
    );
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();

    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.lastCall()![0]).toEqual(
      `/api/thumbnails/${mockedThumbnail.id}/`,
    );
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
    screen.getByText('Thumbnail successfully deleted.');
    expect(report).not.toHaveBeenCalled();
    expect(useThumbnail.getState().thumbnails).toEqual({});
  });

  it('clicks on the remove button and removal fails', async () => {
    const queryClient = new QueryClient();
    const mockedThumbnail = thumbnailMockFactory();
    useThumbnail.getState().addResource(mockedThumbnail);

    fetchMock.delete(`/api/thumbnails/${mockedThumbnail.id}/`, 500);

    render(
      wrapInIntlProvider(
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <ToastHack />
          <ThumbnailRemoveButton thumbnail={mockedThumbnail} />
        </QueryClientProvider>,
      ),
    );

    const removeButton = screen.getByRole('button', {
      name: 'Delete thumbnail',
    });
    act(() => userEvent.click(removeButton));

    screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    act(() => userEvent.click(confirmButton));

    await waitFor(() => expect(fetchMock.calls()).toHaveLength(1));
    expect(fetchMock.lastCall()![0]).toEqual(
      `/api/thumbnails/${mockedThumbnail.id}/`,
    );
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer json web token',
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
    screen.getByText('Thumbnail deletion failed !');
    expect(report).toHaveBeenCalled();
    expect(useThumbnail.getState().thumbnails).toEqual({
      [mockedThumbnail.id]: mockedThumbnail,
    });
  });
});
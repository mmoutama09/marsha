import { act, screen } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { useJwt, videoMockFactory } from 'lib-components';
import { render, Deferred } from 'lib-tests';
import React from 'react';
import { QueryClient } from 'react-query';

import { VideosList } from '.';

describe('<VideosList />', () => {
  beforeEach(() => {
    useJwt.setState({
      jwt: 'cool_token_m8',
    });

    fetchMock.restore();
  });

  it('loads the list of videos and shows it in a table', async () => {
    const deferred = new Deferred();
    fetchMock.get('/api/videos/?limit=999', deferred.promise);

    render(<VideosList />);

    screen.getByRole('status', { name: 'Loading videos...' });
    expect(fetchMock.lastCall()![0]).toEqual('/api/videos/?limit=999');
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer cool_token_m8',
        'Content-Type': 'application/json',
      },
    });

    const video1 = videoMockFactory();
    const video2 = videoMockFactory();

    await act(async () =>
      deferred.resolve({
        count: 2,
        next: null,
        previous: null,
        results: [video1, video2],
      }),
    );

    screen.getByRole('columnheader', { name: 'Title' });
    screen.getByRole('columnheader', { name: 'Playlist' });
    screen.getByRole('columnheader', { name: 'Upload state' });

    screen.getByRole('rowheader', { name: video1.title! });
    screen.getByRole('cell', { name: video1.playlist.title });
    screen.getByRole('rowheader', { name: video2.title! });
    screen.getByRole('cell', { name: video2.playlist.title });
  });

  it('shows an explanatory message when the list of playlists is empty', async () => {
    const deferred = new Deferred();
    fetchMock.get('/api/videos/?limit=999', deferred.promise);

    render(<VideosList />);

    screen.getByRole('status', { name: 'Loading videos...' });

    await act(async () =>
      deferred.resolve({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }),
    );

    screen.getByRole('table');
    screen.getByText('There are no videos for this list yet.');
  });

  it('shows an error message when it fails to load the list of videos', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const deferred = new Deferred();
    fetchMock.get('/api/videos/?limit=999', deferred.promise);

    render(<VideosList />, { queryOptions: { client: queryClient } });

    screen.getByRole('status', { name: 'Loading videos...' });
    expect(fetchMock.lastCall()![0]).toEqual('/api/videos/?limit=999');
    expect(fetchMock.lastCall()![1]).toEqual({
      headers: {
        Authorization: 'Bearer cool_token_m8',
        'Content-Type': 'application/json',
      },
    });

    await act(async () => deferred.resolve(500));

    screen.getByText('There was an unexpected error');
  });
});

import { fireEvent, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import {
  useCurrentResourceContext,
  useMaintenance,
  useAppConfig,
  modelName,
  uploadState,
  documentMockFactory,
  videoMockFactory,
} from 'lib-components';
import React from 'react';
import { Router } from 'react-router-dom';

import { DASHBOARD_ROUTE } from 'components/Dashboard/route';
import { PLAYLIST_ROUTE } from 'components/PlaylistPortability/route';
import { PLAYER_ROUTE } from 'components/routes';
import { wrapInIntlProvider } from 'utils/tests/intl';
import render from 'utils/tests/render';

import { LTINav } from '.';

jest.mock('lib-components', () => ({
  ...jest.requireActual('lib-components'),
  useAppConfig: jest.fn(),
  useCurrentResourceContext: jest.fn(),
}));
const mockedUseAppConfig = useAppConfig as jest.MockedFunction<
  typeof useAppConfig
>;

const mockedUseCurrentResourceContext =
  useCurrentResourceContext as jest.MockedFunction<
    typeof useCurrentResourceContext
  >;

describe('<LTINav />', () => {
  beforeEach(() => {
    useMaintenance.setState(() => ({
      isActive: false,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Video', () => {
    it('navigates between routes when video is ready', () => {
      const history = createMemoryHistory();
      const video = videoMockFactory({
        upload_state: uploadState.READY,
      });
      mockedUseAppConfig.mockReturnValue({
        modelName: modelName.VIDEOS,
      } as any);
      mockedUseCurrentResourceContext.mockReturnValue([
        {
          permissions: {
            can_update: true,
          },
        },
      ] as any);

      render(
        <Router history={history}>
          <LTINav object={video} />
        </Router>,
      );

      fireEvent.click(screen.getByRole('link', { name: /dashboard/i }));
      expect(history.location.pathname).toBe(DASHBOARD_ROUTE(modelName.VIDEOS));

      fireEvent.click(screen.getByRole('link', { name: /preview/i }));
      expect(history.location.pathname).toBe(PLAYER_ROUTE(modelName.VIDEOS));

      fireEvent.click(screen.getByRole('link', { name: /playlist/i }));
      expect(history.location.pathname).toBe(PLAYLIST_ROUTE(modelName.VIDEOS));
    });

    it('hides dashboard link when user is not permitted to update video', () => {
      const video = videoMockFactory({
        upload_state: uploadState.READY,
      });
      mockedUseAppConfig.mockReturnValue({
        modelName: modelName.VIDEOS,
      } as any);
      mockedUseCurrentResourceContext.mockReturnValue([
        {
          permissions: {
            can_update: false,
          },
        },
      ] as any);

      render(<LTINav object={video} />);

      expect(screen.queryByRole('link', { name: /dashboard/i })).toBeNull();
      screen.getByRole('link', { name: /preview/i });
      expect(screen.queryByRole('link', { name: /playlist/i })).toBeNull();
    });

    it('hides dashboard link when system is under maintenance', () => {
      useMaintenance.setState(() => ({
        isActive: true,
      }));
      const video = videoMockFactory({
        upload_state: uploadState.READY,
      });
      mockedUseAppConfig.mockReturnValue({
        modelName: modelName.VIDEOS,
      } as any);
      mockedUseCurrentResourceContext.mockReturnValue([
        {
          permissions: {
            can_update: true,
          },
        },
      ] as any);

      render(<LTINav object={video} />);

      expect(screen.queryByRole('link', { name: /dashboard/i })).toBeNull();
      screen.getByRole('link', { name: /preview/i });
      expect(screen.queryByRole('link', { name: /playlist/i })).toBeNull();
    });

    it('hides preview link when video is not ready', () => {
      const video = videoMockFactory({
        upload_state: uploadState.PENDING,
      });
      mockedUseAppConfig.mockReturnValue({
        modelName: modelName.VIDEOS,
      } as any);
      mockedUseCurrentResourceContext.mockReturnValue([
        {
          permissions: {
            can_update: true,
          },
        },
      ] as any);

      render(<LTINav object={video} />);

      screen.getByRole('link', { name: /dashboard/i });
      expect(screen.queryByRole('link', { name: /preview/i })).toBeNull();
      screen.getByRole('link', { name: /playlist/i });
    });
  });

  describe('Document', () => {
    it('navigates between routes when document is ready.', () => {
      const history = createMemoryHistory();
      const document = documentMockFactory({
        upload_state: uploadState.READY,
      });
      mockedUseAppConfig.mockReturnValue({
        modelName: modelName.DOCUMENTS,
      } as any);
      mockedUseCurrentResourceContext.mockReturnValue([
        {
          permissions: {
            can_update: true,
          },
        },
      ] as any);

      render(
        wrapInIntlProvider(
          <Router history={history}>
            <LTINav object={document} />
          </Router>,
        ),
      );

      fireEvent.click(screen.getByRole('link', { name: /dashboard/i }));
      expect(history.location.pathname).toBe(
        DASHBOARD_ROUTE(modelName.DOCUMENTS),
      );

      fireEvent.click(screen.getByRole('link', { name: /preview/i }));
      expect(history.location.pathname).toBe(PLAYER_ROUTE(modelName.DOCUMENTS));

      fireEvent.click(screen.getByRole('link', { name: /playlist/i }));
      expect(history.location.pathname).toBe(
        PLAYLIST_ROUTE(modelName.DOCUMENTS),
      );
    });

    it('hides dashboard link when user is not permitted to update document', () => {
      const document = documentMockFactory({
        upload_state: uploadState.READY,
      });
      mockedUseAppConfig.mockReturnValue({
        modelName: modelName.DOCUMENTS,
      } as any);
      mockedUseCurrentResourceContext.mockReturnValue([
        {
          permissions: {
            can_update: false,
          },
        },
      ] as any);

      render(<LTINav object={document} />);

      expect(screen.queryByRole('link', { name: /dashboard/i })).toBeNull();
      screen.getByRole('link', { name: /preview/i });
      expect(screen.queryByRole('link', { name: /playlist/i })).toBeNull();
    });

    it('hides dashboard link when system is under maintenance', () => {
      useMaintenance.setState(() => ({
        isActive: true,
      }));
      const document = documentMockFactory({
        upload_state: uploadState.READY,
      });
      mockedUseAppConfig.mockReturnValue({
        modelName: modelName.DOCUMENTS,
      } as any);
      mockedUseCurrentResourceContext.mockReturnValue([
        {
          permissions: {
            can_update: true,
          },
        },
      ] as any);

      render(<LTINav object={document} />);

      expect(screen.queryByRole('link', { name: /dashboard/i })).toBeNull();
      screen.getByRole('link', { name: /preview/i });
      expect(screen.queryByRole('link', { name: /playlist/i })).toBeNull();
    });

    it('hides preview link when document not ready.', () => {
      const document = documentMockFactory({
        upload_state: uploadState.PENDING,
      });
      mockedUseAppConfig.mockReturnValue({
        modelName: modelName.DOCUMENTS,
      } as any);
      mockedUseCurrentResourceContext.mockReturnValue([
        {
          permissions: {
            can_update: true,
          },
        },
      ] as any);

      render(<LTINav object={document} />);

      screen.getByRole('link', { name: /dashboard/i });
      expect(screen.queryByRole('link', { name: /preview/i })).toBeNull();
      screen.getByRole('link', { name: /playlist/i });
    });
  });
});

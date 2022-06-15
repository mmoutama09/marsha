import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { setLiveSessionDisplayName } from 'data/sideEffects/setLiveSessionDisplayName';
import { liveSessionFactory, videoMockFactory } from 'utils/tests/factories';
import { wrapInIntlProvider } from 'utils/tests/intl';
import { Nullable } from 'utils/types';
import { converse } from 'utils/window';

import { StudentLiveWaitingRoom } from '.';

jest.mock('data/appData', () => ({
  appData: {
    modelName: 'videos',
    resource: {
      id: '1',
    },
    static: {
      img: {
        liveBackground: 'some_url',
      },
    },
  },
  getDecodedJwt: () => ({
    context_id: 'context_id',
    consumer_site: 'a.site.fr',
    email: 'an.email@openfun.fr',
    locale: 'en',
    maintenance: false,
    permissions: {
      can_access_dashboard: false,
      can_update: false,
    },
    resource_id: 'ressource_id',
    roles: [],
    session_id: 'session_id',
    user: {
      id: 'user_id',
      username: 'username',
      user_fullname: 'hisName',
      email: 'test@openfun.fr',
    },
  }),
}));

jest.mock('data/sideEffects/setLiveSessionDisplayName', () => ({
  setLiveSessionDisplayName: jest.fn(),
}));

jest.mock('utils/window', () => ({
  converse: {
    claimNewNicknameInChatRoom: jest.fn(),
  },
}));

const mockConverse = converse.claimNewNicknameInChatRoom as jest.MockedFunction<
  typeof converse.claimNewNicknameInChatRoom
>;
const mockSetLiveSessionDisplayName =
  setLiveSessionDisplayName as jest.MockedFunction<
    typeof setLiveSessionDisplayName
  >;

describe('<StudentLiveWaitingRoom />', () => {
  it('renders the waiting room', () => {
    const video = videoMockFactory({
      title: 'live title',
      description: 'live description',
    });

    render(wrapInIntlProvider(<StudentLiveWaitingRoom video={video} />));

    screen.getByText('Live has started');
    screen.getByText(
      'You will join the discussion after you entered your name.',
    );
    screen.getByRole('heading', { name: 'live title' });
    screen.getByText('live description');
  });

  it('sets the display name', async () => {
    mockConverse.mockImplementation(
      async (
        _displayName: string,
        callbackSuccess: () => void,
        _callbackError: (stanza: Nullable<HTMLElement>) => void,
      ) => {
        callbackSuccess();
      },
    );
    const video = videoMockFactory({
      title: 'live title',
      description: 'live description',
    });
    mockSetLiveSessionDisplayName.mockResolvedValue({
      success: liveSessionFactory({ display_name: 'John_Doe' }),
    });

    render(wrapInIntlProvider(<StudentLiveWaitingRoom video={video} />));

    const inputTextbox = screen.getByRole('textbox');
    const validateButton = screen.getByRole('button');
    userEvent.clear(inputTextbox);
    userEvent.type(inputTextbox, 'John_Doe');
    act(() => {
      userEvent.click(validateButton);
    });
    await waitFor(() =>
      expect(mockSetLiveSessionDisplayName).toHaveBeenCalled(),
    );
  });
});

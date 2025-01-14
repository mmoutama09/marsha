import { cleanup, screen } from '@testing-library/react';
import {
  videoMockFactory,
  JoinMode,
  LiveModeType,
  liveState,
  PersistentStore,
} from 'lib-components';
import React from 'react';

import {
  LivePanelItem,
  useLivePanelState,
} from 'data/stores/useLivePanelState';
import render from 'utils/tests/render';
import { wrapInVideo } from 'utils/tests/wrapInVideo';

import { StudentLiveControlBar } from '.';

const mockEmptyVideo = videoMockFactory({ live_state: liveState.IDLE });

jest.mock('data/stores/useSetDisplayName', () => ({
  useSetDisplayName: () => [false, jest.fn()],
}));

describe('<StudentLiveControlBar />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders no button', () => {
    useLivePanelState.setState({});

    render(wrapInVideo(<StudentLiveControlBar />, mockEmptyVideo));

    expect(
      screen.queryByRole('button', { name: 'Show apps' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show chat' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Send request to join the discussion',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders apps wrapper button in mobile view', () => {
    useLivePanelState.setState({
      availableItems: [LivePanelItem.APPLICATION],
    });

    render(wrapInVideo(<StudentLiveControlBar />, mockEmptyVideo), {
      grommetOptions: {
        responsiveSize: 'small',
      },
    });

    screen.getByRole('button', { name: 'Show apps' });
    expect(
      screen.queryByRole('button', { name: 'Show chat' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Send request to join the discussion',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders viewers wrapper button in mobile view', () => {
    useLivePanelState.setState({
      availableItems: [LivePanelItem.VIEWERS_LIST],
    });

    render(wrapInVideo(<StudentLiveControlBar />, mockEmptyVideo), {
      grommetOptions: {
        responsiveSize: 'small',
      },
    });

    screen.getByRole('button', { name: 'Show viewers' });
    expect(
      screen.queryByRole('button', { name: 'Show chat' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Send request to join the discussion',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders chat wrapper button in mobile view', () => {
    useLivePanelState.setState({
      availableItems: [LivePanelItem.CHAT],
    });

    render(wrapInVideo(<StudentLiveControlBar />, mockEmptyVideo), {
      grommetOptions: {
        responsiveSize: 'small',
      },
    });

    expect(
      screen.queryByRole('button', { name: 'Show apps' }),
    ).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'Show chat' });
    expect(
      screen.queryByRole('button', {
        name: 'Send request to join the discussion',
      }),
    ).not.toBeInTheDocument();
  });
});

describe('<StudentLiveControlBar /> leave/join discussion wrapper', () => {
  it('does not render wrapper without xmpp available in video', () => {
    useLivePanelState.setState({});

    const mockVideo = videoMockFactory({
      live_type: LiveModeType.JITSI,
      live_state: liveState.RUNNING,
    });

    render(wrapInVideo(<StudentLiveControlBar />, mockVideo));

    expect(
      screen.queryByRole('button', { name: 'Show apps' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show chat' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Send request to join the discussion',
      }),
    ).not.toBeInTheDocument();
  });

  it('does not render wrapper if video_type is not LiveModeType.JITSI', () => {
    useLivePanelState.setState({});

    const mockVideo = videoMockFactory({
      live_type: LiveModeType.RAW,
      live_state: liveState.RUNNING,
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

    render(wrapInVideo(<StudentLiveControlBar />, mockVideo));

    expect(
      screen.queryByRole('button', { name: 'Show apps' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show chat' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Send request to join the discussion',
      }),
    ).not.toBeInTheDocument();
  });

  it('does not render wrapper if live_state is not liveState.RUNNING', () => {
    const values = Object.values(liveState).filter(
      (state) => ![liveState.RUNNING, liveState.ENDED].includes(state),
    );

    values.forEach((myLiveState) => {
      useLivePanelState.setState({});

      const mockVideo = videoMockFactory({
        live_type: LiveModeType.JITSI,
        live_state: myLiveState,
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

      render(wrapInVideo(<StudentLiveControlBar />, mockVideo));

      expect(
        screen.queryByRole('button', { name: 'Show apps' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Show chat' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: 'Send request to join the discussion',
        }),
      ).not.toBeInTheDocument();

      cleanup();
    });
  });

  it('does not render wrapper if join_mode is not JoinMode.ASK_FOR_APPROVAL', () => {
    useLivePanelState.setState({});

    const mockVideo = videoMockFactory({
      join_mode: JoinMode.DENIED,
      live_type: LiveModeType.JITSI,
      live_state: liveState.RUNNING,
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

    render(wrapInVideo(<StudentLiveControlBar />, mockVideo));

    expect(
      screen.queryByRole('button', { name: 'Show apps' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show chat' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Send request to join the discussion',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders leave/join discussion button', () => {
    useLivePanelState.setState({});

    const mockRunningJitsiWithXMPP = videoMockFactory({
      live_type: LiveModeType.JITSI,
      live_state: liveState.RUNNING,
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

    render(wrapInVideo(<StudentLiveControlBar />, mockRunningJitsiWithXMPP));

    expect(
      screen.queryByRole('button', { name: 'Show apps' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show chat' }),
    ).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'Send request to join the discussion' });
  });

  it('renders only leave/join discussion button when in large view', () => {
    useLivePanelState.setState({
      availableItems: [
        LivePanelItem.CHAT,
        LivePanelItem.APPLICATION,
        LivePanelItem.VIEWERS_LIST,
      ],
    });

    const mockRunningJitsiWithXMPP = videoMockFactory({
      live_type: LiveModeType.JITSI,
      live_state: liveState.RUNNING,
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

    render(wrapInVideo(<StudentLiveControlBar />, mockRunningJitsiWithXMPP));

    expect(
      screen.queryByRole('button', { name: 'Show apps' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show chat' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show viewers' }),
    ).not.toBeInTheDocument();
    screen.getByRole('button', {
      name: 'Send request to join the discussion',
    });
  });
});

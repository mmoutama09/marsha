import { act, screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import React from 'react';

import { useChatItemState } from 'data/stores/useChatItemsStore';
import { imageSnapshot } from 'utils/tests/imageSnapshot';
import render from 'utils/tests/render';
import { theme } from 'utils/theme/theme';

import { ChatConversationDisplayer } from '.';

const mockScrollTo = window.HTMLElement.prototype
  .scrollTo as jest.MockedFunction<
  typeof window.HTMLElement.prototype.scrollTo
>;

jest.mock('utils/errors/report', () => ({
  report: jest.fn(),
}));

describe('<ChatConversationDisplayer />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('displays correctly message history and new presences.', () => {
    render(<ChatConversationDisplayer />);

    for (let i = 0; i < 5; i++) {
      act(() =>
        useChatItemState.getState().addMessage({
          content: `This is example message n°${i}`,
          sender: `John Doe n°${i}`,
          sentAt: DateTime.fromISO(`2020-01-01T12:1${i}:12`),
        }),
      );
    }

    for (let i = 0; i < 5; i++) {
      screen.getByText(`(12:1${i})`);
      screen.getByText(`John Doe n°${i}`);
      screen.getByText(`This is example message n°${i}`);
    }
  });

  it('scrolls down to bottom, when scroll bar is previously set to bottom.', async () => {
    render(<ChatConversationDisplayer />);

    expect(mockScrollTo).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 5; i++) {
      act(() =>
        useChatItemState.getState().addMessage({
          content: `This is example message n°${i}`,
          sender: `John Doe n°${i}`,
          sentAt: DateTime.fromISO(`2020-01-01T12:1${i}:12`),
        }),
      );
    }
    expect(mockScrollTo).toHaveBeenCalledTimes(6);
  });

  it('renders components with messages and presences and compares it with previous render. [screenshot]', async () => {
    render(<ChatConversationDisplayer />, { grommetOptions: { theme } });

    for (let i = 0; i < 5; i++) {
      act(() =>
        useChatItemState.getState().addMessage({
          content: `This is example message n°${i}`,
          sender: `John Doe n°${i}`,
          sentAt: DateTime.fromISO(`2020-01-01T12:1${i}:12`),
        }),
      );
    }

    act(() =>
      useChatItemState.getState().addMessage({
        content: 'Hello everyone !',
        sender: 'John_Doe',
        sentAt: DateTime.fromISO('2020-01-01T12:12:10'),
      }),
    );

    act(() =>
      useChatItemState.getState().addMessage({
        content: 'Hello John !',
        sender: 'Jane_Doe',
        sentAt: DateTime.fromISO('2020-01-01T12:12:25'),
      }),
    );
    await imageSnapshot(800, 1000);
  });
});

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useJwt } from 'lib-components';
import React from 'react';

import { useInfoWidgetModal } from 'data/stores/useInfoWidgetModal';
import render from 'utils/tests/render';
import { UploadClosedCaptions } from '.';
import fetchMock from 'fetch-mock';

jest.mock('data/stores/useInfoWidgetModal', () => ({
  useInfoWidgetModal: jest.fn(),
}));

const mockUseInfoWidgetModal = useInfoWidgetModal as jest.MockedFunction<
  typeof useInfoWidgetModal
>;

const languageChoices = [
  { display_name: 'English', value: 'en' },
  { display_name: 'French', value: 'fr' },
];

describe('<UploadClosedCaptions />', () => {
  beforeEach(() => {
    useJwt.setState({
      getDecodedJwt: () => ({ locale: 'en_US' } as any),
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('renders the UploadClosedCaptions', () => {
    fetchMock.mock(
      '/api/timedtexttracks/',
      {
        actions: { POST: { language: { choices: languageChoices } } },
      },
      { method: 'OPTIONS' },
    );
    const mockSetInfoWidgetModalProvider = jest.fn();
    mockUseInfoWidgetModal.mockReturnValue([
      null,
      mockSetInfoWidgetModalProvider,
    ]);

    render(<UploadClosedCaptions />);

    screen.getByText('Closed captions');

    const infoButton = screen.getByRole('button', { name: 'help' });
    act(() => userEvent.click(infoButton));

    expect(mockSetInfoWidgetModalProvider).toHaveBeenCalledTimes(1);
    expect(mockSetInfoWidgetModalProvider).toHaveBeenLastCalledWith({
      title: 'Closed captions',
      text: 'This widget allows you upload closed captions for the video.',
    });
  });
});

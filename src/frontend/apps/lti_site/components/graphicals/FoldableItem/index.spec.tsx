import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { PropsWithChildren } from 'react';

import { InfoWidgetModalProvider } from 'data/stores/useInfoWidgetModal';
import render from 'utils/tests/render';

import { FoldableItem } from '.';

const mockSetInfoWidgetModal = jest.fn();
jest.mock('data/stores/useInfoWidgetModal', () => ({
  useInfoWidgetModal: () => [
    { isVisible: false, text: null, title: null },
    mockSetInfoWidgetModal,
  ],
  InfoWidgetModalProvider: ({ children }: PropsWithChildren<{}>) => children,
}));

const GenericComponent = () => <p>Generic component</p>;

const genericTitle = 'An example title';
const genericInfoText = 'An example info text';

describe('<FoldableItem />', () => {
  it('renders FoldableItem opened, with an info text ', () => {
    render(
      <InfoWidgetModalProvider value={null}>
        <FoldableItem
          initialOpenValue={true}
          infoText={genericInfoText}
          title={genericTitle}
        >
          <GenericComponent />
        </FoldableItem>
      </InfoWidgetModalProvider>,
    );
    screen.getByText(genericTitle);
    screen.getByText('Generic component');
    screen.getByRole('button', { name: genericTitle });
    const infoButton = screen.getAllByRole('button')[0];
    expect(infoButton).not.toBeDisabled();
    expect(screen.queryByText(genericInfoText)).toEqual(null);
  });

  it('renders FoldableItem closed without info text and clicks on the title.', () => {
    render(
      <InfoWidgetModalProvider value={null}>
        <FoldableItem initialOpenValue={false} title={genericTitle}>
          <GenericComponent />
        </FoldableItem>
      </InfoWidgetModalProvider>,
    );
    screen.getByText(genericTitle);
    const openButton = screen.getByRole('button', { name: genericTitle });
    expect(screen.queryByText('Generic component')).toEqual(null);
    const infoButton = screen.getAllByRole('button')[0];
    expect(infoButton).toBeDisabled();
    expect(screen.queryByText(genericInfoText)).toEqual(null);

    act(() => userEvent.click(openButton));
    screen.getByText('Generic component');
  });

  it('renders FoldableItem closed with info text and clicks on info button', async () => {
    render(
      <InfoWidgetModalProvider value={null}>
        <FoldableItem
          initialOpenValue={false}
          infoText={genericInfoText}
          title={genericTitle}
        >
          <GenericComponent />
        </FoldableItem>
      </InfoWidgetModalProvider>,
    );
    screen.getByText(genericTitle);
    screen.getByRole('button', { name: genericTitle });
    expect(screen.queryByText('Generic component')).toEqual(null);
    const infoButton = screen.getAllByRole('button')[0];
    expect(screen.queryByText(genericInfoText)).toEqual(null);

    act(() => userEvent.click(infoButton));
    expect(mockSetInfoWidgetModal).toHaveBeenCalled();
    expect(mockSetInfoWidgetModal).toHaveBeenCalledWith({
      title: genericTitle,
      text: genericInfoText,
    });
  });
});

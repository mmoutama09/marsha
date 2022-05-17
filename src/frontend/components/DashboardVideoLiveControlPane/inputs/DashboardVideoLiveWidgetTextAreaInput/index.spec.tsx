import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { DashboardVideoLiveWidgetTextAreaInput } from '.';

let inputTextValue: string;
let nbrOfCall = 0;
const setValueMock = (value: string) => {
  inputTextValue += value;
  nbrOfCall++;
};

describe('<DashboardVideoLiveWidgetTextAreaInput />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    nbrOfCall = 0;
    inputTextValue = '';
  });

  it('renders the text area with empty string and placeholder and then types some text', () => {
    render(
      <DashboardVideoLiveWidgetTextAreaInput
        placeholder="An example placeholder"
        setValue={setValueMock}
        title="An example title"
        value={''}
      />,
    );

    screen.getByPlaceholderText('An example placeholder');

    const textInput = screen.getByRole('textbox', { name: 'An example title' });
    userEvent.type(textInput, 'An example typed text');

    expect(nbrOfCall).toEqual('An example typed text'.length);
    expect(inputTextValue).toEqual('An example typed text');
  });

  it('renders the text area with text', () => {
    render(
      <DashboardVideoLiveWidgetTextAreaInput
        placeholder="An example placeholder"
        setValue={setValueMock}
        title="An example title"
        value={'An example typed text'}
      />,
    );

    const textInput = screen.getByRole('textbox', { name: 'An example title' });
    expect(textInput).toHaveValue('An example typed text');
    screen.getByPlaceholderText('An example placeholder');
  });
});
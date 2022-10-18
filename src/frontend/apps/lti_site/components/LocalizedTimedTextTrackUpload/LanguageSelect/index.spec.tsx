import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import React from 'react';

import { useTimedTextTrack } from 'data/stores/useTimedTextTrack';
import { useTimedTextTrackLanguageChoices } from 'data/stores/useTimedTextTrackLanguageChoices/index';
import { timedTextMode } from 'types/tracks';
import { timedTextMockFactory } from 'lib-components';
import render from 'utils/tests/render';
import { LanguageSelect } from '.';

jest.mock('utils/errors/report', () => ({ report: jest.fn() }));

const onChangeMock = jest.fn();

const languageChoices = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'Slovenian', value: 'sl' },
  { label: 'Swedish', value: 'sv' },
];

describe('<LanguageSelect />', () => {
  it('renders the component with instructor local language available', () => {
    useTimedTextTrackLanguageChoices.setState({
      choices: languageChoices,
    });

    render(
      <LanguageSelect
        onChange={onChangeMock}
        timedTextModeWidget={timedTextMode.SUBTITLE}
      />,
      { intlOptions: { locale: 'fr-FR' } },
    );

    expect(onChangeMock).toHaveBeenCalledWith({ label: 'French', value: 'fr' });

    screen.getByRole('button', {
      name: 'Select the language for which you want to upload a timed text file; Selected: fr',
    });
    expect(
      screen.getByRole('textbox', {
        name: 'Select the language for which you want to upload a timed text file, fr',
      }),
    ).toHaveValue('French');
  });

  it('renders the component with instructor local language unavailable', () => {
    useTimedTextTrackLanguageChoices.setState({
      choices: languageChoices,
    });

    render(
      <LanguageSelect
        onChange={onChangeMock}
        timedTextModeWidget={timedTextMode.SUBTITLE}
      />,
      { intlOptions: { locale: 'pg-PG' } },
    );

    expect(onChangeMock).toHaveBeenCalledWith({
      label: 'English',
      value: 'en',
    });

    screen.getByRole('button', {
      name: 'Select the language for which you want to upload a timed text file; Selected: en',
    });
    expect(
      screen.getByRole('textbox', {
        name: 'Select the language for which you want to upload a timed text file, en',
      }),
    ).toHaveValue('English');
  });

  it('renders the component with some languages already having some subtitles uploaded', () => {
    useTimedTextTrackLanguageChoices.setState({
      choices: languageChoices,
    });
    useTimedTextTrack.getState().addMultipleResources([
      timedTextMockFactory({
        language: 'fr',
        mode: timedTextMode.TRANSCRIPT,
      }),
      timedTextMockFactory({
        language: 'sv',
        mode: timedTextMode.SUBTITLE,
      }),
    ]);

    render(
      <LanguageSelect
        onChange={onChangeMock}
        timedTextModeWidget={timedTextMode.SUBTITLE}
      />,
      { intlOptions: { locale: 'fr-FR' } },
    );

    expect(onChangeMock).toHaveBeenCalledWith({ label: 'French', value: 'fr' });
    const selectButton = screen.getByRole('button', {
      name: 'Select the language for which you want to upload a timed text file; Selected: fr',
    });
    act(() => userEvent.click(selectButton));

    screen.getByRole('button', {
      name: 'Select the language for which you want to upload a timed text file; Selected: fr',
    });
    expect(
      screen.getByRole('textbox', {
        name: 'Select the language for which you want to upload a timed text file, fr',
      }),
    ).toHaveValue('French');
    screen.getByRole('option', { name: 'English' });
    screen.getByRole('option', { name: 'French' });
    screen.getByRole('option', { name: 'Spanish' });
    screen.getByRole('option', { name: 'Slovenian' });
    expect(
      screen.queryByRole('option', { name: 'Swedish' }),
    ).not.toBeInTheDocument();
  });

  it('renders the component with no languages', () => {
    fetchMock.mock('/api/timedtexttracks/', 500, { method: 'OPTIONS' });

    render(
      <LanguageSelect
        onChange={onChangeMock}
        timedTextModeWidget={timedTextMode.SUBTITLE}
      />,
      { intlOptions: { locale: 'fr-FR' } },
    );

    expect(onChangeMock).toHaveBeenCalledWith({
      label: 'No language availables',
      value: 'error',
    });

    expect(
      screen.queryByRole('button', {
        name: 'Select the language for which you want to upload a timed text file; Selected: fr',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', {
        name: 'Select the language for which you want to upload a timed text file, fr',
      }),
    ).not.toBeInTheDocument();

    screen.getByRole('button', {
      name: 'Select the language for which you want to upload a timed text file; Selected: error',
    });
    expect(
      screen.getByRole('textbox', {
        name: 'Select the language for which you want to upload a timed text file, error',
      }),
    ).toHaveValue('No language availables');
  });

  it('changes the selected language', () => {
    useTimedTextTrackLanguageChoices.setState({
      choices: languageChoices,
    });

    render(
      <LanguageSelect
        onChange={onChangeMock}
        timedTextModeWidget={timedTextMode.SUBTITLE}
      />,
      { intlOptions: { locale: 'fr-FR' } },
    );

    expect(onChangeMock).toHaveBeenCalledWith({ label: 'French', value: 'fr' });
    const selectButton = screen.getByRole('button', {
      name: 'Select the language for which you want to upload a timed text file; Selected: fr',
    });

    act(() => userEvent.click(selectButton));

    screen.getByRole('button', {
      name: 'Select the language for which you want to upload a timed text file; Selected: fr',
    });
    expect(
      screen.getByRole('textbox', {
        name: 'Select the language for which you want to upload a timed text file, fr',
      }),
    ).toHaveValue('French');
    const englishButtonOption = screen.getByRole('option', { name: 'English' });

    act(() => userEvent.click(englishButtonOption));

    screen.getByRole('button', {
      name: 'Select the language for which you want to upload a timed text file; Selected: en',
    });
    expect(
      screen.getByRole('textbox', {
        name: 'Select the language for which you want to upload a timed text file, en',
      }),
    ).toHaveValue('English');
  });
});

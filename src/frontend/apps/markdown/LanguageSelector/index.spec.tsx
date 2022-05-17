import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { wrapInIntlProvider } from 'utils/tests/intl';

import LanguageSelector from '.';

describe('<LanguageSelector />', () => {
  it('displays languages', async () => {
    window.scrollTo = jest.fn(); // required to test, see grommet

    const onLanguageChange = jest.fn();

    const { rerender } = render(
      wrapInIntlProvider(
        <LanguageSelector
          currentLanguage={'en'}
          onLanguageChange={onLanguageChange}
          disabled={false}
        />,
      ),
    );

    userEvent.click(screen.getByRole('button', { name: 'English' }));
    userEvent.click(screen.getByText('French'));

    // Force dropdown to be hidden again: mandatory for rerender...
    userEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(onLanguageChange).toHaveBeenCalledTimes(1);
    expect(onLanguageChange).toHaveBeenCalledWith('fr');

    rerender(
      wrapInIntlProvider(
        <LanguageSelector
          currentLanguage={'fr'}
          onLanguageChange={onLanguageChange}
          disabled={false}
        />,
      ),
    );

    userEvent.click(screen.getByRole('button', { name: 'French' }));
    userEvent.click(screen.getByText('English'));

    expect(onLanguageChange).toHaveBeenCalledTimes(2);
    expect(onLanguageChange).toHaveBeenLastCalledWith('en');
  });

  it('displays available languages', async () => {
    window.scrollTo = jest.fn(); // required to test, see grommet

    const onLanguageChange = jest.fn();

    render(
      wrapInIntlProvider(
        <LanguageSelector
          currentLanguage={'en'}
          onLanguageChange={onLanguageChange}
          disabled={false}
          availableLanguages={['en']}
        />,
      ),
    );

    userEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.queryByText('French')).not.toBeInTheDocument();
  });

  it('displays available languages if current language is not', async () => {
    window.scrollTo = jest.fn(); // required to test, see grommet

    const onLanguageChange = jest.fn();

    render(
      wrapInIntlProvider(
        <LanguageSelector
          currentLanguage={'en'}
          onLanguageChange={onLanguageChange}
          disabled={false}
          availableLanguages={['fr']}
        />,
      ),
    );

    userEvent.click(screen.getByRole('button', { name: 'English' }));
    userEvent.click(screen.getByText('French'));

    expect(onLanguageChange).toHaveBeenCalledTimes(1);
    expect(onLanguageChange).toHaveBeenCalledWith('fr');
  });
});
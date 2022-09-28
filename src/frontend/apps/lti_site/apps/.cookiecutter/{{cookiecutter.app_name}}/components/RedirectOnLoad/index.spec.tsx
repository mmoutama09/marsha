import React from 'react';

import { FULL_SCREEN_ERROR_ROUTE } from 'components/ErrorComponents/route';
import { useAppConfig } from 'data/stores/useAppConfig';
import { appState } from 'types/AppData';
import render from 'utils/tests/render';

import { RedirectOnLoad } from '.';
import { DASHBOARD_{{ cookiecutter.app_name|upper }}_ROUTE } from '../Dashboard{{cookiecutter.model}}/route';

jest.mock('data/stores/useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));
const mockedUseAppConfig = useAppConfig as jest.MockedFunction<
  typeof useAppConfig
>;

describe('<RedirectOnLoad />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('redirects users to the error view on LTI error', () => {
    mockedUseAppConfig.mockReturnValue({
      state: appState.ERROR,
      flags: { {{ cookiecutter.app_name }}: true },
    } as any);

    const { getByText } = render(<RedirectOnLoad />, {
      routerOptions: {
        routes: [
          {
            path: FULL_SCREEN_ERROR_ROUTE(),
            render: ({ match }) => (
              <span>{`Error Component: ${match.params.code}`}</span>
            ),
          },
        ],
      },
    });

    getByText('Error Component: lti');
  });

  it('shows not found error when feature is disabled', () => {
    mockedUseAppConfig.mockReturnValue({
      flags: { {{ cookiecutter.app_name }}: false },
    } as any);

    const { getByText } = render(<RedirectOnLoad />, {
      routerOptions: {
        routes: [
          {
            path: FULL_SCREEN_ERROR_ROUTE(),
            render: ({ match }) => (
              <span>{`Error Component: ${match.params.code}`}</span>
            ),
          },
        ],
      },
    });

    getByText('Error Component: notFound');
  });

  it('shows dashboard', async () => {
    mockedUseAppConfig.mockReturnValue({
      flags: { {{ cookiecutter.app_name }}: true },
    } as any);

    const { getByText } = render(<RedirectOnLoad />, {
      routerOptions: {
        routes: [
          {
            path: DASHBOARD_{{ cookiecutter.app_name|upper }}_ROUTE(),
            render: () => <span>Dashboard</span>,
          },
        ],
      },
    });

    getByText('Dashboard');
  });
});
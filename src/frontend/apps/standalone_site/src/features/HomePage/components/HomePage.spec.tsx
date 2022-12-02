import { screen } from '@testing-library/react';
import { render } from 'lib-tests';
import React from 'react';

import HomePage from './HomePage';

jest.mock('features/Contents', () => ({
  ContentsShuffle: () => <div>My ContentsShuffle</div>,
}));

describe('<HomePage />', () => {
  test('renders HomePage', () => {
    render(<HomePage />);
    expect(screen.getByText(/Homepage/i)).toBeInTheDocument();
    expect(screen.getByText(/My ContentsShuffle/i)).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import Header from './Header';

describe('<Header />', () => {
  test('renders Header', () => {
    render(<Header />);
    expect(screen.getByRole(/menubar/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  test('scroll and update background', () => {
    render(<Header />);

    const menuBar = screen.getByRole(/menubar/i);
    expect(menuBar).toBeInTheDocument();
    expect(menuBar).toHaveStyle('background: transparent');
    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(menuBar).toHaveStyle('background: #fff');
  });
});

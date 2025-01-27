import { screen } from '@testing-library/react';
import React from 'react';

import render from 'utils/tests/render';

import MarkdownNotFoundView from '.';

describe('<MarkdownNotFoundView />', () => {
  it('displays properly', async () => {
    render(<MarkdownNotFoundView />);

    screen.getByText('Resource not found');
    screen.getByText(
      'The resource you are looking for is not available. If you are an instructor try to re-authenticate.',
    );
  });
});

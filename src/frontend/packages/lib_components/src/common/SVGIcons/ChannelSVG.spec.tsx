/* eslint-disable jest/expect-expect */
import { renderIconSnapshot } from 'lib-tests';
import React from 'react';

import { ChannelSVG } from './ChannelSVG';

describe('<ChannelSVG />', () => {
  it('renders ChannelSVG correctly [screenshot]', async () => {
    await renderIconSnapshot(<ChannelSVG iconColor="#035ccd" />);
  });

  it('renders ChannelSVG focus [screenshot]', async () => {
    await renderIconSnapshot(
      <ChannelSVG iconColor="white" focusColor="#035ccd" />,
    );
  });
});

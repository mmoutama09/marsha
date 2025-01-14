/* eslint-disable jest/expect-expect */
import { renderIconSnapshot } from 'lib-tests';
import React from 'react';

import { AppsSVG } from './AppsSVG';

describe('<AppsSVG />', () => {
  it('renders AppsSVG correctly [screenshot]', async () => {
    await renderIconSnapshot(<AppsSVG iconColor="#035ccd" />);
  });

  it('renders AppsSVG focus [screenshot]', async () => {
    await renderIconSnapshot(
      <AppsSVG iconColor="white" focusColor="blue-focus" />,
    );
  });
});

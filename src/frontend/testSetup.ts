// Jest helpers for styled-components
import 'jest-styled-components';
// Jest helpers for testing-library
import '@testing-library/jest-dom';

import { toMatchImageSnapshot } from 'jest-image-snapshot';
expect.extend({ toMatchImageSnapshot });

beforeEach(() => {
  global.ResizeObserver = require('resize-observer-polyfill');
});

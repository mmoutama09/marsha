import React, { lazy, Suspense } from 'react';
import { MemoryRouter, Redirect, Route } from 'react-router-dom';

import { Loader } from 'components/Loader';
import { flags } from 'types/AppData';
import { isFeatureEnabled } from 'utils/isFeatureEnabled';

const MarkdownNotFoundView = lazy(() => import('./MarkdownNotFoundView'));
const MarkdownView = lazy(() => import('./MarkdownView'));

const notFoundPath = '/errors/not-found';

export const Routes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <MemoryRouter>
        {isFeatureEnabled(flags.MARKDOWN) ? (
          <Route path="/" render={() => <MarkdownView />} />
        ) : (
          <Redirect push to={notFoundPath} />
        )}
        <Route
          exact
          path={notFoundPath}
          render={() => <MarkdownNotFoundView />}
        />
      </MemoryRouter>
    </Suspense>
  );
};
import * as React from 'react';
import { Redirect } from 'react-router-dom';

import {
  FULL_SCREEN_ERROR_ROUTE,
  useAppConfig,
  appState,
  flags,
} from 'lib-components';

import { RESOURCE_PORTABILITY_REQUEST_ROUTE } from 'components/PortabilityRequest/route';
import { useIsFeatureEnabled } from 'data/hooks/useIsFeatureEnabled';

import { DASHBOARD_CLASSROOM_ROUTE } from 'lib-classroom';

// RedirectOnLoad assesses the initial state of the application using appData and determines the proper
// route to load in the Router
export const RedirectOnLoad = () => {
  const appData = useAppConfig();
  const isFeatureEnabled = useIsFeatureEnabled();

  // Get LTI errors out of the way
  if (appData.state === appState.ERROR) {
    return <Redirect push to={FULL_SCREEN_ERROR_ROUTE('lti')} />;
  }

  if (!isFeatureEnabled(flags.CLASSROOM)) {
    return <Redirect push to={FULL_SCREEN_ERROR_ROUTE('notFound')} />;
  }

  if (appData.state === appState.PORTABILITY) {
    return <Redirect push to={RESOURCE_PORTABILITY_REQUEST_ROUTE()} />;
  }

  return <Redirect push to={DASHBOARD_CLASSROOM_ROUTE()} />;
};

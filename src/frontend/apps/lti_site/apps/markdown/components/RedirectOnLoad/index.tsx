import * as React from 'react';
import { Redirect } from 'react-router-dom';

import { OrganizationAccessRole, useJwt } from 'lib-components';

import { FULL_SCREEN_ERROR_ROUTE } from 'components/ErrorComponents/route';
import { useIsFeatureEnabled } from 'data/hooks/useIsFeatureEnabled';
import { useAppConfig } from 'data/stores/useAppConfig';

import { appState, flags } from 'types/AppData';

import { MARKDOWN_NOT_FOUND_ROUTE } from '../MarkdownNotFoundView/route';
import { MARKDOWN_EDITOR_ROUTE } from '../MarkdownEditor/route';
import { MARKDOWN_VIEWER_ROUTE } from '../MarkdownViewer/route';

// RedirectOnLoad assesses the initial state of the application using appData and determines the proper
// route to load in the Router
export const RedirectOnLoad = () => {
  const appData = useAppConfig();
  const isFeatureEnabled = useIsFeatureEnabled();

  // Get LTI errors out of the way
  if (appData.state === appState.ERROR) {
    return <Redirect push to={FULL_SCREEN_ERROR_ROUTE('lti')} />;
  }

  if (!isFeatureEnabled(flags.MARKDOWN)) {
    return <Redirect push to={MARKDOWN_NOT_FOUND_ROUTE()} />;
  }

  // Deal with missing JWT (the resource may be not available yet)
  if (!useJwt.getState().jwt) {
    return <Redirect push to={MARKDOWN_NOT_FOUND_ROUTE()} />;
  }

  const decodedJwt = useJwt.getState().getDecodedJwt();
  const userHasEditionRole =
    (decodedJwt.roles.includes(OrganizationAccessRole.ADMINISTRATOR) ||
      decodedJwt.roles.includes(OrganizationAccessRole.INSTRUCTOR)) &&
    decodedJwt.permissions.can_update;

  if (userHasEditionRole) {
    return <Redirect push to={MARKDOWN_EDITOR_ROUTE()} />;
  } else {
    return <Redirect push to={MARKDOWN_VIEWER_ROUTE()} />;
  }
};
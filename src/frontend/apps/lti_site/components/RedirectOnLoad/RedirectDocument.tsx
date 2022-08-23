import React from 'react';
import { Redirect } from 'react-router-dom';

import { DASHBOARD_ROUTE } from 'components/Dashboard/route';
import { FULL_SCREEN_ERROR_ROUTE } from 'components/ErrorComponents/route';
import { PLAYER_ROUTE } from 'components/routes';
import { useJwt } from 'data/stores/useJwt';
import { modelName } from 'types/models';
import { Document } from 'types/file';

interface RedirectDocumentProps {
  document: Document;
}

export const RedirectDocument = ({ document }: RedirectDocumentProps) => {
  const getDecodedJwt = useJwt((state) => state.getDecodedJwt);

  if (document.is_ready_to_show) {
    return <Redirect push to={PLAYER_ROUTE(modelName.DOCUMENTS)} />;
  }

  if (getDecodedJwt().permissions.can_update) {
    return <Redirect push to={DASHBOARD_ROUTE(modelName.DOCUMENTS)} />;
  }

  // For safety default to the 404 view: this is for users without update permission
  // when the document is not ready to show.
  return <Redirect push to={FULL_SCREEN_ERROR_ROUTE('notFound')} />;
};
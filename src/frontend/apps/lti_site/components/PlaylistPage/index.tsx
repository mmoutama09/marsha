import React, { Fragment } from 'react';
import { Redirect } from 'react-router-dom';

import {
  FULL_SCREEN_ERROR_ROUTE,
  useAppConfig,
  modelName,
} from 'lib-components';
import { LTINav } from 'components/LTINav';
import { PlaylistPortability } from 'components/PlaylistPortability';
import { DashboardContainer } from 'components/Styled/DashboardContainer';

const PlaylistPage = () => {
  const appData = useAppConfig();

  let content;
  if (appData.modelName === modelName.DOCUMENTS && appData.document) {
    content = (
      <Fragment>
        <LTINav object={appData.document} />
        <PlaylistPortability object={appData.document} />
      </Fragment>
    );
  } else if (appData.modelName === modelName.VIDEOS && appData.video) {
    content = (
      <Fragment>
        <LTINav object={appData.video} />
        <PlaylistPortability object={appData.video} />
      </Fragment>
    );
  } else {
    content = <Redirect push to={FULL_SCREEN_ERROR_ROUTE('notFound')} />;
  }

  return <DashboardContainer>{content}</DashboardContainer>;
};

export default PlaylistPage;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../Dashboard/route';
import { PLAYER_ROUTE } from '../routes';
import { appData, getDecodedJwt } from '../../data/appData';
import { Box, Nav } from 'grommet';
import { defineMessages, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { uploadState, Video } from '../../types/tracks';
import { Document } from '../../types/file';
import { modelName } from '../../types/models';
import { useVideo } from '../../data/stores/useVideo';
import { useDocument } from '../../data/stores/useDocument';

const messages = defineMessages({
  linkDashboard: {
    defaultMessage: 'Dashboard',
    description: `Title for the dashboard, where the user can see the status of the video/audio/timed text upload
      & processing, and will be able to manage them.`,
    id: 'components.LTINav.linkDashboard',
  },
  linkPreview: {
    defaultMessage: 'Preview',
    description: `Title for the Instructor View. Describes the area appearing right above, which is a preview
      of what the student will see there.`,
    id: 'components.LTINav.linkPreview',
  },
});

const NavItem = styled(NavLink)`
  cursor: pointer;
  padding: 1rem;
  color: #444444;
  text-decoration: none;
  border-bottom: solid 2px #ededed;

  :hover {
    border-bottom-color: #007bff;
  }

  &.active {
    border-bottom-color: #000000;
  }
`;

/** Props shape for the LTINav component. */
interface LTINavProps {
  object: Video | Document;
}

/** Component. Displays LTI navigation depending on object state and user permissions.
 * @param object The video or document for which the navigation is displayed.
 */

export const LTINav = ({ object: baseObject }: LTINavProps) => {
  const videoState = useVideo();
  const documentState = useDocument();
  const object =
    appData.modelName === modelName.VIDEOS
      ? videoState.getVideo(baseObject as Video)
      : documentState.getDocument(baseObject as Document);

  const canAccessDashboard =
    getDecodedJwt().permissions.can_update && !getDecodedJwt().maintenance;
  const canAccessPreview = object.upload_state === uploadState.READY;

  return (
    <Box align="center" alignContent="center" pad="small">
      <Nav direction="row">
        {canAccessDashboard && (
          <NavItem to={DASHBOARD_ROUTE(appData.modelName)}>
            <FormattedMessage {...messages.linkDashboard} />
          </NavItem>
        )}

        {canAccessPreview && (
          <NavItem to={PLAYER_ROUTE(appData.modelName)}>
            <FormattedMessage {...messages.linkPreview} />
          </NavItem>
        )}
      </Nav>
    </Box>
  );
};
import { Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled from 'styled-components';

import { ThumbnailDisplayer } from 'components/graphicals/ThumbnailDisplayer';
import { TeacherLiveInfoBar } from 'components/TeacherLiveInfoBar';
import VideoPlayer from 'components/VideoPlayer';
import {
  liveState,
  useAppConfig,
  useThumbnail,
  useTimedTextTrack,
} from 'lib-components';
import { useCurrentVideo } from 'data/stores/useCurrentRessource/useCurrentVideo';
import { theme } from 'utils/theme/theme';
import { DashboardControlPane } from 'components/Dashboard/DashboardControlPane';
import { VideoWidgetProvider } from 'components/VideoWidgetProvider';

const StyledLiveVideoInformationBarWrapper = styled(Box)`
  -webkit-box-shadow: 0px 0px 7px 5px ${normalizeColor('shadow-1', theme)};
  box-shadow: 0px 0px 7px 5px ${normalizeColor('shadow-1', theme)};
`;

export const DashboardVOD = () => {
  const video = useCurrentVideo();
  const appData = useAppConfig();

  const timedTextTracks = useTimedTextTrack((state) =>
    state.getTimedTextTracks(),
  );
  const thumbnail = useThumbnail((state) => state.getThumbnail());

  return (
    <Box background={{ color: 'bg-marsha' }}>
      {video.is_ready_to_show ? (
        <VideoPlayer
          video={video}
          playerType="videojs"
          timedTextTracks={timedTextTracks}
        />
      ) : (
        <Box>
          <ThumbnailDisplayer
            urlsThumbnail={
              thumbnail && thumbnail.urls
                ? thumbnail.urls
                : { 1080: appData.static.img.liveBackground }
            }
          />
        </Box>
      )}

      <StyledLiveVideoInformationBarWrapper
        align="center"
        background="white"
        direction="row-responsive"
        height="80px"
        justify="between"
        margin="small"
        pad={{
          vertical: 'small',
          horizontal: 'medium',
        }}
        round="xsmall"
      >
        <TeacherLiveInfoBar
          flex={true}
          title={video.title}
          startDate={video.starting_at}
        />
      </StyledLiveVideoInformationBarWrapper>
      {video.live_state === liveState.ENDED ? (
        <DashboardControlPane isLive={false} />
      ) : (
        <VideoWidgetProvider isTeacher isLive={false} />
      )}
    </Box>
  );
};

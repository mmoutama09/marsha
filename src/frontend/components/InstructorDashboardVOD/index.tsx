import { Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled from 'styled-components';

import { DashboardVideoLiveWidgetsContainer } from 'components/DashboardVideoLiveControlPane/widgets/DashboardVideoLiveWidgetsContainer';
import { DashboardVideoLiveWidgetThumbnail } from 'components/DashboardVideoLiveControlPane/widgets/DashboardVideoLiveWidgetThumbnail';
import { TeacherLiveInfoBar } from 'components/TeacherLiveInfoBar';
import VideoPlayer from 'components/VideoPlayer';
import { useCurrentVideo } from 'data/stores/useCurrentRessource/useCurrentVideo';
import { DeleteTimedTextTrackUploadModalProvider } from 'data/stores/useDeleteTimedTextTrackUploadModal';
import { InfoWidgetModalProvider } from 'data/stores/useInfoWidgetModal';
import { useTimedTextTrack } from 'data/stores/useTimedTextTrack';
import { theme } from 'utils/theme/theme';
import { TimedTrackModalWrapper } from './custom/TimedTrackModalWrapper';
import { InstructorDashboardVODWidgetDownloadVideo } from './widgets/InstructorDashboardVODWidgetDownloadVideo';
import { InstructorDashboardVODWidgetGeneralTitle } from './widgets/InstructorDashboardVODWidgetGeneralTitle';
import { InstructorDashboardVODWidgetUploadClosedCaptions } from './widgets/InstructorDashboardVODWidgetUploadClosedCaptions';
import { InstructorDashboardVODWidgetUploadSubtitles } from './widgets/InstructorDashboardVODWidgetUploadSubtitles';
import { InstructorDashboardVODWidgetUploadTranscripts } from './widgets/InstructorDashboardVODWidgetUploadTranscripts';
import { InstructorDashboardVODWidgetUploadVideo } from './widgets/InstructorDashboardVODWidgetUploadVideo';

const StyledLiveVideoInformationBarWrapper = styled(Box)`
  -webkit-box-shadow: 0px 0px 7px 5px ${normalizeColor('shadow-1', theme)};
  box-shadow: 0px 0px 7px 5px ${normalizeColor('shadow-1', theme)};
`;

export const InstructorDashboardVOD = () => {
  const video = useCurrentVideo();

  const timedTextTracks = useTimedTextTrack((state) =>
    state.getTimedTextTracks(),
  );

  return (
    <Box background={{ color: 'bg-marsha' }}>
      <VideoPlayer
        video={video}
        playerType="videojs"
        timedTextTracks={timedTextTracks}
      />

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

      <InfoWidgetModalProvider value={null}>
        <DeleteTimedTextTrackUploadModalProvider value={null}>
          <TimedTrackModalWrapper />
          <DashboardVideoLiveWidgetsContainer>
            <InstructorDashboardVODWidgetGeneralTitle />
            <InstructorDashboardVODWidgetUploadVideo />
            <DashboardVideoLiveWidgetThumbnail isLive={false} />
            <InstructorDashboardVODWidgetDownloadVideo />
            <InstructorDashboardVODWidgetUploadSubtitles />
            <InstructorDashboardVODWidgetUploadTranscripts />
            <InstructorDashboardVODWidgetUploadClosedCaptions />
          </DashboardVideoLiveWidgetsContainer>
        </DeleteTimedTextTrackUploadModalProvider>
      </InfoWidgetModalProvider>
    </Box>
  );
};
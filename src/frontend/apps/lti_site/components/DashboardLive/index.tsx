import { Box, Stack } from 'grommet';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Redirect } from 'react-router-dom';

import { ConverseInitializer } from 'components/ConverseInitializer';
import { toolbarButtons } from 'components/DashboardLiveJitsi/utils';
import {
  FULL_SCREEN_ERROR_ROUTE,
  useAppConfig,
  liveState,
  LiveModeType,
  JoinMode,
} from 'lib-components';
import { AudioControl } from 'components/JitsiControls/AudioControl';
import { CameraControl } from 'components/JitsiControls/CameraControl';
import { LiveModale } from 'components/LiveModale';
import { LiveVideoLayout } from 'components/LiveVideoLayout';
import { LiveVideoPanel } from 'components/LiveVideoPanel';
import { PictureInPictureLayer } from 'components/PictureInPictureLayer';
import { SharedMediaExplorer } from 'components/SharedMediaExplorer';
import { TeacherLiveContent } from 'components/TeacherLiveContent';
import { TeacherLiveLifecycleControls } from 'components/TeacherLiveLifecycleControls';
import { TeacherLiveControlBar } from 'components/TeacherLiveControlBar';
import { TeacherLiveInfoBar } from 'components/TeacherLiveInfoBar';
import { TeacherLiveRecordingActions } from 'components/TeacherLiveRecordingActions';
import { TeacherLiveTypeSwitch } from 'components/TeacherLiveTypeSwitch';
import { useCurrentVideo } from 'data/stores/useCurrentRessource/useCurrentVideo';
import { useJitsiApi } from 'data/stores/useJitsiApi';
import { LiveFeedbackProvider } from 'data/stores/useLiveFeedback';
import {
  LivePanelItem,
  useLivePanelState,
} from 'data/stores/useLivePanelState';
import { useLiveModaleConfiguration } from 'data/stores/useLiveModale';
import { usePictureInPicture } from 'data/stores/usePictureInPicture';
import { converse } from 'utils/window';

import {
  OnStageRequestToast,
  ON_STAGE_REQUEST_TOAST_ID,
} from './OnStageRequestToast';
import { TeacherPIPControls } from './TeacherPIPControls';
import { DashboardControlPane } from 'components/Dashboard/DashboardControlPane';

export const DashboardLive = () => {
  const video = useCurrentVideo();
  const appData = useAppConfig();
  const [showPanelTrigger, setShowPanelTrigger] = useState(true);

  const { isPanelVisible, configPanel, currentItem, setPanelVisibility } =
    useLivePanelState((state) => ({
      isPanelVisible: state.isPanelVisible,
      configPanel: state.setAvailableItems,
      currentItem: state.currentItem,
      setPanelVisibility: state.setPanelVisibility,
    }));
  const [canStartLive, setCanStartLive] = useState(
    video.live_type === LiveModeType.RAW,
  );
  const [canShowStartButton, setCanShowStartButton] = useState(
    video.live_type === LiveModeType.RAW,
  );
  const [pipState] = usePictureInPicture();
  const [jitsiApi] = useJitsiApi();
  const [modaleConfiguration] = useLiveModaleConfiguration();

  useEffect(() => {
    // if the xmpp object is not null, panel state is filled
    if (video.xmpp !== null) {
      const items = [];
      if (video.has_chat) {
        items.push(LivePanelItem.CHAT);
      }
      items.push(LivePanelItem.VIEWERS_LIST);
      configPanel(
        items,
        // If the panel has a previous selected tab, it is this one which is used
        currentItem ? currentItem : LivePanelItem.CHAT,
      );
    }
    // if the xmpp object becomes unavailable, panel is uninitialized (but selected tab stays unchanged)
    else {
      configPanel([]);
    }
  }, [video, configPanel]);

  // On mount and live started, open the livePanel by default
  useEffect(() => {
    if (video.xmpp && currentItem && showPanelTrigger) {
      setPanelVisibility(true);
      setShowPanelTrigger(false);
    }
  }, [video.xmpp, currentItem, showPanelTrigger]);

  useEffect(() => {
    if (video.join_mode !== JoinMode.FORCED) {
      return;
    }

    video.participants_asking_to_join.forEach((participant) => {
      converse.acceptParticipantToJoin(participant, video);
    });
  }, [video.join_mode, video.participants_asking_to_join]);

  useEffect(() => {
    if (
      jitsiApi &&
      video.active_shared_live_media &&
      video.active_shared_live_media.urls &&
      pipState.reversed
    ) {
      jitsiApi.executeCommand('overwriteConfig', {
        toolbarButtons: [],
      });
    } else if (jitsiApi) {
      jitsiApi.executeCommand('overwriteConfig', {
        toolbarButtons,
      });
    }
  }, [pipState, jitsiApi, video]);

  //  When the live is started,
  //  XMPP is ready to be used and therefore we can show chat and viewers buttons
  const isLiveStarted =
    video.live_state !== undefined && video.live_state !== liveState.IDLE;

  const lastArrayOfParticipantsAskingToJoin = useRef(
    video.participants_asking_to_join,
  );

  useEffect(() => {
    if (isPanelVisible && currentItem === LivePanelItem.VIEWERS_LIST) {
      toast.remove(ON_STAGE_REQUEST_TOAST_ID);
    }

    if (
      lastArrayOfParticipantsAskingToJoin.current ===
      video.participants_asking_to_join
    ) {
      return;
    }

    lastArrayOfParticipantsAskingToJoin.current =
      video.participants_asking_to_join;

    const shouldDisplayToast =
      isLiveStarted &&
      video.participants_asking_to_join.length !== 0 &&
      video.join_mode !== JoinMode.FORCED &&
      !(isPanelVisible && currentItem === LivePanelItem.VIEWERS_LIST);

    if (shouldDisplayToast) {
      toast.custom(
        <OnStageRequestToast
          participantsList={video.participants_asking_to_join}
        />,
        {
          id: ON_STAGE_REQUEST_TOAST_ID,
          duration: Infinity,
        },
      );
    }
  }, [
    video.participants_asking_to_join,
    isLiveStarted,
    video.join_mode,
    lastArrayOfParticipantsAskingToJoin.current,
    isPanelVisible,
    currentItem,
    toast,
  ]);

  return (
    <ConverseInitializer>
      <LiveFeedbackProvider value={false}>
        <LiveVideoLayout
          actionsElement={
            <Fragment>
              {isLiveStarted && <TeacherLiveControlBar />}
              <Box flex={isLiveStarted} direction="row">
                <TeacherLiveRecordingActions
                  isJitsiAdministrator={canStartLive}
                />
                <TeacherLiveLifecycleControls
                  canStartStreaming={canShowStartButton}
                  flex={isLiveStarted ? { grow: 1, shrink: 1 } : false}
                  hasRightToStart={canStartLive}
                />
              </Box>
            </Fragment>
          }
          additionalContent={
            <Fragment>
              {appData.flags?.live_raw &&
                video.live_state &&
                [liveState.IDLE, liveState.STOPPED].includes(
                  video.live_state,
                ) && (
                  <Box direction={'row'} justify={'center'} margin={'small'}>
                    <TeacherLiveTypeSwitch />
                  </Box>
                )}
              <DashboardControlPane isLive />
            </Fragment>
          }
          displayActionsElement
          isXmppReady={!!video.xmpp}
          liveTitleElement={
            <TeacherLiveInfoBar
              flex={isLiveStarted ? { grow: 1, shrink: 2 } : true}
              title={video.title}
              startDate={video.starting_at}
            />
          }
          mainElement={
            <Stack fill interactiveChild="last">
              <PictureInPictureLayer
                mainElement={
                  <TeacherLiveContent
                    setCanShowStartButton={setCanShowStartButton}
                    setCanStartLive={setCanStartLive}
                  />
                }
                secondElement={
                  video.active_shared_live_media ? (
                    video.active_shared_live_media.urls ? (
                      <SharedMediaExplorer
                        initialPage={1}
                        pages={video.active_shared_live_media.urls.pages}
                      >
                        {video.active_shared_live_media.nb_pages &&
                          video.active_shared_live_media.nb_pages > 1 && (
                            <TeacherPIPControls
                              maxPage={video.active_shared_live_media.nb_pages}
                            />
                          )}
                      </SharedMediaExplorer>
                    ) : (
                      <Redirect to={FULL_SCREEN_ERROR_ROUTE()} />
                    )
                  ) : null
                }
                reversed={pipState.reversed}
                pictureActions={
                  pipState.reversed
                    ? [<AudioControl />, <CameraControl />]
                    : undefined
                }
              />
              {modaleConfiguration && <LiveModale {...modaleConfiguration} />}
            </Stack>
          }
          sideElement={<LiveVideoPanel />}
        />
      </LiveFeedbackProvider>
    </ConverseInitializer>
  );
};

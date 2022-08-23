import { Button } from 'grommet';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { DASHBOARD_ROUTE } from 'components/Dashboard/route';
import { FULL_SCREEN_ERROR_ROUTE } from 'components/ErrorComponents/route';
import { Loader } from 'components/Loader';
import { initiateLive } from 'data/sideEffects/initiateLive';
import { useVideo } from 'data/stores/useVideo';
import { modelName } from 'types/models';
import { LiveModeType, Video } from 'types/tracks';
import { Nullable } from 'utils/types';

const messages = defineMessages({
  startLiveButtonLabel: {
    defaultMessage: 'Start a live',
    description: 'Label of the button used for creating a new live.',
    id: 'components.DashboardVideoLiveConfigureButtons.startLiveButtonLabel',
  },
});

type configureLiveStatus = 'pending' | 'success' | 'error';

interface ConfigureLiveButtonProps {
  video: Video;
}

export const ConfigureLiveButton = ({ video }: ConfigureLiveButtonProps) => {
  const [status, setStatus] = useState<Nullable<configureLiveStatus>>(null);
  const { updateVideo } = useVideo((state) => ({
    updateVideo: state.addResource,
  }));
  const intl = useIntl();

  const configureLive = async () => {
    setStatus('pending');
    try {
      const updatedVideo = await initiateLive(video, LiveModeType.JITSI);
      setStatus('success');
      updateVideo(updatedVideo);
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <Redirect push to={DASHBOARD_ROUTE(modelName.VIDEOS)} />;
  }

  if (status === 'error') {
    return <Redirect push to={FULL_SCREEN_ERROR_ROUTE('liveInit')} />;
  }

  return (
    <React.Fragment>
      {status === 'pending' && <Loader />}
      <Button
        a11yTitle={intl.formatMessage(messages.startLiveButtonLabel)}
        color="blue-active"
        fill="horizontal"
        label={intl.formatMessage(messages.startLiveButtonLabel)}
        onClick={configureLive}
        primary
        style={{ minHeight: '50px', fontFamily: 'Roboto-Medium' }}
        title={intl.formatMessage(messages.startLiveButtonLabel)}
      />
    </React.Fragment>
  );
};
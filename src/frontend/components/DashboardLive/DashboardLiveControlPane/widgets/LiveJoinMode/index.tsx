import { Box, Select } from 'grommet';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { toast } from 'react-hot-toast';

import { WidgetTemplate } from 'components/common/dashboard/widgets/WidgetTemplate';
import { useUpdateVideo } from 'data/queries';
import { useCurrentVideo } from 'data/stores/useCurrentRessource/useCurrentVideo';
import { JoinMode } from 'types/tracks';
import { report } from 'utils/errors/report';

const { APPROVAL, DENIED, FORCED } = JoinMode;

const messages = defineMessages({
  info: {
    defaultMessage:
      'This widget allows you to select permissions for students to join the discussion.',
    description: 'Info of the widget used for setting join modes.',
    id: 'components.LiveJoinMode.info',
  },
  title: {
    defaultMessage: 'Join the discussion',
    description: 'Title of the widget used for setting join modes.',
    id: 'components.LiveJoinMode.title',
  },
  selectLabel: {
    defaultMessage: 'Select join the discussion mode',
    description: 'The label for the select to set join modes.',
    id: 'components.LiveJoinMode.selectLabel',
  },
  [APPROVAL]: {
    defaultMessage: 'Accept joining the discussion after approval',
    description: 'The label associated to the approval join mode.',
    id: 'components.LiveJoinMode.approvalLabel',
  },
  [DENIED]: {
    defaultMessage: 'Not allowed',
    description: 'The label associated to the denied join mode.',
    id: 'components.LiveJoinMode.deniedLabel',
  },
  [FORCED]: {
    defaultMessage: 'Everybody will join the discussion',
    description: 'The label associated to the forced join mode.',
    id: 'components.LiveJoinMode.forcedLabel',
  },
  updateVideoSucces: {
    defaultMessage: 'Video updated.',
    description: 'Message displayed when video is successfully updated.',
    id: 'component.LiveJoinMode.updateVideoSucces',
  },
  updateVideoFail: {
    defaultMessage: 'Video update has failed !',
    description: 'Message displayed when video update has failed.',
    id: 'component.LiveJoinMode.updateVideoFail',
  },
});

export const LiveJoinMode = () => {
  const video = useCurrentVideo();
  const intl = useIntl();

  const videoMutation = useUpdateVideo(video.id, {
    onSuccess: () => {
      toast.success(intl.formatMessage(messages.updateVideoSucces), {
        position: 'bottom-center',
      });
    },
    onError: (err) => {
      report(err);
      toast.error(intl.formatMessage(messages.updateVideoFail), {
        position: 'bottom-center',
      });
    },
  });

  const options = [
    {
      label: intl.formatMessage(messages[APPROVAL]),
      value: APPROVAL,
    },
    {
      label: intl.formatMessage(messages[DENIED]),
      value: DENIED,
    },
    {
      label: intl.formatMessage(messages[FORCED]),
      value: FORCED,
    },
  ];

  return (
    <WidgetTemplate
      infoText={intl.formatMessage(messages.info)}
      initialOpenValue
      title={intl.formatMessage(messages.title)}
    >
      <Box direction="column" gap="small">
        <Select
          aria-label={intl.formatMessage(messages.selectLabel)}
          options={options}
          labelKey="label"
          replace={false}
          valueKey={{ key: 'value', reduce: true }}
          value={video.join_mode}
          onChange={({ option }) => {
            videoMutation.mutate({
              join_mode: option.value,
            });
          }}
        />
      </Box>
    </WidgetTemplate>
  );
};
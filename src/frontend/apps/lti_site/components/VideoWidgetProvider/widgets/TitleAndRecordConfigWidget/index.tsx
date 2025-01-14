import { Box } from 'grommet';
import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { toast } from 'react-hot-toast';

import { FoldableItem } from 'components/graphicals/FoldableItem';
import { TextInput } from 'components/graphicals/TextInput';
import { ToggleInput } from 'components/graphicals/ToggleInput';
import { useUpdateVideo } from 'data/queries';
import { useCurrentVideo } from 'data/stores/useCurrentRessource/useCurrentVideo';
import { Video, report } from 'lib-components';
import { debounce } from 'utils/widgets/widgets';

const messages = defineMessages({
  info: {
    defaultMessage:
      'This widget allows you to set the title of your live, alongside activate / deactivate recording of it.',
    description:
      'Info of the widget used for setting title and live recording.',
    id: 'components.TitleAndRecordConfigWidget.info',
  },
  title: {
    defaultMessage: 'General',
    description:
      'Title of the widget used for setting live title and activate recording.',
    id: 'components.TitleAndRecordConfigWidget.title',
  },
  placeholderTitleInput: {
    defaultMessage: 'Enter title of your live here',
    description:
      'A placeholder text indicating the purpose of the input and what it is supposed to received.',
    id: 'components.TitleAndRecordConfigWidget.placeholderTitleInput',
  },
  updateVideoSucces: {
    defaultMessage: 'Video updated.',
    description: 'Message displayed when video is successfully updated.',
    id: 'component.TitleAndRecordConfigWidget.updateVideoSuccess',
  },
  updateVideoFail: {
    defaultMessage: 'Video update has failed !',
    description: 'Message displayed when video update has failed.',
    id: 'component.TitleAndRecordConfigWidget.updateVideoFail',
  },
  updateTitleBlank: {
    defaultMessage: "Title can't be blank !",
    description:
      'Message displayed when the user tried to enter a blank title.',
    id: 'component.TitleAndRecordConfigWidget.updateTitleBlank',
  },
  recordingToggleLabel: {
    defaultMessage: 'Activate live recording',
    description:
      'The label associated to the toggle button reponsible of live recording activation / deactivation.',
    id: 'components.TitleAndRecordConfigWidget.liveRecordingToggleLabel',
  },
});

export const TitleAndRecordConfigWidget = () => {
  const video = useCurrentVideo();
  const intl = useIntl();
  const [title, setTitle] = useState(video.title);
  const [checked, setChecked] = useState(video.allow_recording);

  const videoMutation = useUpdateVideo(video.id, {
    onSuccess: () => {
      toast.success(intl.formatMessage(messages.updateVideoSucces), {
        position: 'bottom-center',
      });
    },
    onError: (err, variables) => {
      if ('title' in variables) {
        setTitle(video.title);
      }
      if ('allow_recording' in variables) {
        setChecked(video.allow_recording);
      }
      report(err);
      toast.error(intl.formatMessage(messages.updateVideoFail), {
        position: 'bottom-center',
      });
    },
  });

  const debouncedUpdatedVideo = useCallback(
    debounce<Video>((updatedVideoProperty: Partial<Video>) => {
      if (updatedVideoProperty.title === '') {
        toast.error(intl.formatMessage(messages.updateTitleBlank), {
          position: 'bottom-center',
        });
        setTitle(video.title);
        return;
      }
      videoMutation.mutate(updatedVideoProperty);
    }),
    [debounce, videoMutation.mutate, video.title],
  );

  const handleChange = async (inputText: string) => {
    setTitle(inputText);
    debouncedUpdatedVideo({ title: inputText });
  };

  const onToggleChange = () => {
    setChecked(!video.allow_recording);
    videoMutation.mutate({
      allow_recording: !video.allow_recording,
    });
  };

  return (
    <FoldableItem
      infoText={intl.formatMessage(messages.info)}
      initialOpenValue
      title={intl.formatMessage(messages.title)}
    >
      <Box direction="column" gap="small">
        <TextInput
          placeholder={intl.formatMessage(messages.placeholderTitleInput)}
          value={title || ''}
          setValue={handleChange}
          title={intl.formatMessage(messages.placeholderTitleInput)}
        />
        <ToggleInput
          disabled={video.is_recording}
          checked={checked}
          onChange={onToggleChange}
          label={intl.formatMessage(messages.recordingToggleLabel)}
        />
      </Box>
    </FoldableItem>
  );
};

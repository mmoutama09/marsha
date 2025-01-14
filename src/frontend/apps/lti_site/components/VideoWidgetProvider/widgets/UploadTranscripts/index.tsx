import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { FoldableItem } from 'components/graphicals/FoldableItem';
import { LocalizedTimedTextTrackUpload } from 'components/LocalizedTimedTextTrackUpload';
import { timedTextMode } from 'lib-components';

const messages = defineMessages({
  info: {
    defaultMessage: 'This widget allows you upload transcripts for the video.',
    description: 'Info of the widget used for uploading transcripts.',
    id: 'components.UploadTranscripts.info',
  },
  title: {
    defaultMessage: 'Transcripts',
    description: 'Title of the widget used for uploading transcripts.',
    id: 'components.UploadTranscripts.title',
  },
});

export const UploadTranscripts = () => {
  const intl = useIntl();

  return (
    <FoldableItem
      infoText={intl.formatMessage(messages.info)}
      initialOpenValue
      title={intl.formatMessage(messages.title)}
    >
      <LocalizedTimedTextTrackUpload
        timedTextModeWidget={timedTextMode.TRANSCRIPT}
      />
    </FoldableItem>
  );
};

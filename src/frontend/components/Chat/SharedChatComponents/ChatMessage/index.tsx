import { Box, Text } from 'grommet';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import styled from 'styled-components';

import { ChatMessageType } from 'data/stores/useChatItemsStore/index';
import { chatFonts } from 'utils/theme/theme';

const messages = defineMessages({
  sentAt: {
    defaultMessage: 'sent at {sentAt}',
    description: "'Sent at' text for message's datetime display.",
    id: 'component.ChatMessage.sentAt',
  },
});

const MessageContentTextStyled = styled(Text)`
  line-height: ${chatFonts.secondary.lineHeight};
  letter-spacing: ${chatFonts.secondary.letterSpacing};
  font-family: ${chatFonts.secondary.fontFamily};
`;

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const intl = useIntl();
  const memo = useMemo(
    () => (
      <Box
        background="bg-marsha"
        pad="5px"
        round="6px"
        title={intl.formatMessage(messages.sentAt, {
          sentAt: message.sentAt.toFormat('HH:mm:ss'),
        })}
      >
        <MessageContentTextStyled
          color={chatFonts.secondary.color}
          size={chatFonts.secondary.fontSize}
          wordBreak="break-word"
        >
          {message.content}
        </MessageContentTextStyled>
      </Box>
    ),
    [message],
  );
  return memo;
};

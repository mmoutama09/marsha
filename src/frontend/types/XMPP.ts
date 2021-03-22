import { Nullable } from '../utils/types';

/* XMPP representation */
export interface XMPP {
  bosh_url: Nullable<string>;
  conference_url: string;
  jid: string;
  prebind_url: string;
  websocket_url: Nullable<string>;
}

export enum MessageType {
  EVENT = 'event',
  GROUPCHAT = 'groupchat',
}

export enum EventType {
  ACCEPT = 'accept',
  ACCEPTED = 'accepted',
  KICK = 'kick',
  KICKED = 'kicked',
  LEAVE = 'leave',
  PARTICIPANT_ASK_TO_JOIN = 'participantAskToJoin',
  REJECT = 'reject',
  REJECTED = 'rejected',
}
import { createContext, useContext } from 'react';

import { Live, Video } from 'types/tracks';
import { Nullable } from 'utils/types';

const CurrentVideoContext = createContext<Nullable<Video>>(null);

export const CurrentVideoProvider = CurrentVideoContext.Provider;
export const useCurrentVideo = () => {
  const value = useContext(CurrentVideoContext);
  if (!value) {
    throw new Error(`Missing wrapping Provider for Store CurrentVideoContext`);
  }
  return value;
};

const CurrentLiveContext = createContext<Nullable<Live>>(null);

export const CurrentLiveProvider = CurrentLiveContext.Provider;
export const useCurrentLive = () => {
  const value = useContext(CurrentLiveContext);
  if (!value) {
    throw new Error(`Missing wrapping Provider for Store CurrentLiveContext`);
  }
  return value;
};
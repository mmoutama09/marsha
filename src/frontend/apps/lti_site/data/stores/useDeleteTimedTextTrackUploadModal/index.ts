import { Nullable } from 'lib-common';
import { createStore, TimedText } from 'lib-components';

const store = createStore<Nullable<TimedText>>(
  'DeleteTimedTextTrackUploadModalProvider',
);

export const DeleteTimedTextTrackUploadModalProvider = store.Provider;
export const useDeleteTimedTextTrackUploadModal = store.useStore;

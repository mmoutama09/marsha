import { Maybe } from 'lib-common';

import { createStore } from 'utils/createContext';

const store = createStore<Maybe<JitsiMeetExternalAPI>>('JitsiApiProvider');

export const JitsiApiProvider = store.Provider;
export const useJitsiApi = store.useStore;

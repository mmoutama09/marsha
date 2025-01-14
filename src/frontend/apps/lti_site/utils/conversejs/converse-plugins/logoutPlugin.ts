import { useParticipantWorkflow } from 'data/stores/useParticipantWorkflow';
import { converse } from 'utils/window';

const PLUGIN_NAME = 'logout-plugin';

const addLogoutPlugin = () =>
  converse.plugins.add(PLUGIN_NAME, {
    dependencies: ['converse-muc'],
    initialize() {
      const _converse = this._converse;

      window.addEventListener('beforeunload', () => {
        if (useParticipantWorkflow.getState().accepted) {
          converse.participantLeaves();
        }
        _converse.api.user.logout();
      });
    },
  });

export const logoutPlugin = {
  name: PLUGIN_NAME,
  addPlugin: addLogoutPlugin,
};

import { useJwt } from 'data/stores/useJwt';
import { API_ENDPOINT } from 'settings';
import { LiveSession } from 'types/tracks';

export const getLiveSessions = async (
  anonymousId?: string,
): Promise<{
  count: number;
  results: LiveSession[];
}> => {
  let endpoint = `${API_ENDPOINT}/livesessions/`;
  if (anonymousId) {
    endpoint = `${endpoint}?anonymous_id=${anonymousId}`;
  }

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${useJwt.getState().jwt}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get livesessions');
  }

  return response.json();
};
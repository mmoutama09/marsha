import fetchMock from 'fetch-mock';

import { useJwt } from 'hooks/stores/useJwt';

import { updateOne } from './updateOne';

describe('queries/updateOne', () => {
  afterEach(() => fetchMock.restore());

  it('updates the resource, handles the response and resolves with a success', async () => {
    useJwt.setState({
      jwt: 'some token',
    });
    const objectToUpdate = { object: 'data' };
    fetchMock.mock('/api/model-name/1/', { key: 'value' });

    const response = await updateOne({
      name: 'model-name',
      id: '1',
      object: objectToUpdate,
    });

    expect(fetchMock.lastCall()?.[0]).toEqual('/api/model-name/1/');
    expect(fetchMock.lastCall()?.[1]).toEqual({
      headers: {
        Authorization: 'Bearer some token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(objectToUpdate),
    });
    expect(response).toEqual({ key: 'value' });
  });

  it('updates the resource without JWT token', async () => {
    useJwt.setState({
      jwt: undefined,
    });
    const objectToUpdate = { object: 'data' };
    fetchMock.mock('/api/model-name/1/', { key: 'value' });

    const response = await updateOne({
      name: 'model-name',
      id: '1',
      object: objectToUpdate,
    });

    expect(fetchMock.lastCall()?.[0]).toEqual('/api/model-name/1/');
    expect(fetchMock.lastCall()?.[1]).toEqual({
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(objectToUpdate),
    });
    expect(response).toEqual({ key: 'value' });
  });

  it('resolves with a failure and handles it when it fails to update the resource (local)', async () => {
    useJwt.setState({
      jwt: 'some token',
    });
    const objectToUpdate = { object: 'data' };
    fetchMock.mock(
      '/api/model-name/1/',
      Promise.reject(new Error('Failed to perform the request')),
    );

    await expect(
      updateOne({
        name: 'model-name',
        id: '1',
        object: objectToUpdate,
      }),
    ).rejects.toThrow('Failed to perform the request');

    expect(fetchMock.lastCall()?.[0]).toEqual('/api/model-name/1/');
    expect(fetchMock.lastCall()?.[1]).toEqual({
      headers: {
        Authorization: 'Bearer some token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(objectToUpdate),
    });
  });

  it('resolves with a 404 and handles it when it fails to update the resource (api)', async () => {
    useJwt.setState({
      jwt: 'some token',
    });
    const objectToUpdate = { object: 'data' };
    fetchMock.mock('/api/model-name/1/', 404);

    let thrownError;

    try {
      await updateOne({
        name: 'model-name',
        id: '1',
        object: objectToUpdate,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toEqual({ code: 'exception' });

    expect(fetchMock.lastCall()?.[0]).toEqual('/api/model-name/1/');
    expect(fetchMock.lastCall()?.[1]).toEqual({
      headers: {
        Authorization: 'Bearer some token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(objectToUpdate),
    });
  });

  it('resolves with a 400 and handles it when it fails to update the resource (api)', async () => {
    useJwt.setState({
      jwt: 'some token',
    });
    const objectToUpdate = { object: 'data' };
    fetchMock.mock('/api/model-name/1/', {
      body: JSON.stringify({ error: 'An error occured!' }),
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

    let thrownError;
    try {
      await updateOne({
        name: 'model-name',
        id: '1',
        object: objectToUpdate,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toEqual({
      code: 'invalid',
      error: 'An error occured!',
    });

    expect(fetchMock.lastCall()?.[0]).toEqual('/api/model-name/1/');
    expect(fetchMock.lastCall()?.[1]).toEqual({
      headers: {
        Authorization: 'Bearer some token',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(objectToUpdate),
    });
  });
});

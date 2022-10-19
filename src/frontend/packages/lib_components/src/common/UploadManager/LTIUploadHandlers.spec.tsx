/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { waitFor } from '@testing-library/react';
import { render } from 'lib-tests';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { getResource as fetchResource } from 'data/sideEffects/getResource';
import { updateResource } from 'data/sideEffects/updateResource';
import { addResource, getResource } from 'data/stores/generics';
import { modelName } from 'types/models';
import { Thumbnail, Video } from 'types/tracks';

import { LTIUploadHandlers } from './LTIUploadHandlers';

import { UploadManagerContext, UploadManagerStatus } from '.';

jest.mock('data/stores/useAppConfig', () => ({ useAppConfig: () => ({}) }));

jest.mock('data/sideEffects/updateResource', () => ({
  updateResource: jest.fn(),
}));

jest.mock('data/stores/generics', () => ({
  addResource: jest.fn(),
  getResource: jest.fn(),
}));

jest.mock('data/sideEffects/getResource', () => ({
  getResource: jest.fn(),
}));

const mockAddResource = addResource as jest.MockedFunction<typeof addResource>;
const mockGetResource = getResource as jest.MockedFunction<typeof getResource>;
const mockUpdateResource = updateResource as jest.MockedFunction<
  typeof updateResource
>;
const mockFetResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

describe('<LTIUploadHandlers />', () => {
  const file = new File(['(⌐□_□)'], 'course.mp4', { type: 'video/mp4' });
  const objectState = {
    file,
    objectId: uuidv4(),
    objectType: modelName.VIDEOS,
    progress: 0,
    status: UploadManagerStatus.UPLOADING,
  };
  const object = { id: objectState.objectId, title: '' } as Video;

  beforeEach(() => jest.resetAllMocks());

  it('updates the object name to the file name upon upload success', async () => {
    mockGetResource.mockResolvedValue(object);

    const { rerender } = render(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: { [objectState.objectId]: objectState },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    expect(mockAddResource).not.toHaveBeenCalled();
    expect(mockUpdateResource).not.toHaveBeenCalled();

    rerender(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: {
            [objectState.objectId]: {
              ...objectState,
              status: UploadManagerStatus.SUCCESS,
            },
          },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    await waitFor(() => {
      expect(mockAddResource).toHaveBeenCalledWith(modelName.VIDEOS, {
        id: object.id,
        title: file.name,
      });
      expect(mockUpdateResource).toHaveBeenCalledWith(
        {
          id: object.id,
          title: file.name,
        },
        modelName.VIDEOS,
      );
    });
  });

  it('does not update the object name to the file when the object title is already set', async () => {
    mockGetResource.mockResolvedValue({
      ...object,
      title: 'title already present',
    });

    const { rerender } = render(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: { [objectState.objectId]: objectState },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    expect(mockAddResource).not.toHaveBeenCalled();
    expect(mockUpdateResource).not.toHaveBeenCalled();

    rerender(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: {
            [objectState.objectId]: {
              ...objectState,
              status: UploadManagerStatus.SUCCESS,
            },
          },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    expect(mockAddResource).not.toHaveBeenCalled();
    expect(mockUpdateResource).not.toHaveBeenCalled();
  });

  it('fetch the resource when the upload manager status is UPLOADING', async () => {
    mockFetResource.mockResolvedValue(object);

    const { rerender } = render(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: {
            [objectState.objectId]: {
              ...objectState,
              status: UploadManagerStatus.INIT,
            },
          },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    expect(mockFetResource).not.toHaveBeenCalled();

    rerender(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: {
            [objectState.objectId]: {
              ...objectState,
              status: UploadManagerStatus.UPLOADING,
            },
          },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetResource).toHaveBeenCalledWith(modelName.VIDEOS, object.id);
    });
  });

  it('does not do anything unless the upload manager status for the object becomes SUCCESS', () => {
    mockGetResource.mockResolvedValue(object);

    const { rerender } = render(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: { [objectState.objectId]: objectState },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    expect(mockAddResource).not.toHaveBeenCalled();
    expect(mockUpdateResource).not.toHaveBeenCalled();

    rerender(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: {
            [objectState.objectId]: {
              ...objectState,
              status: UploadManagerStatus.ERR_UPLOAD,
            },
          },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    expect(mockAddResource).not.toHaveBeenCalled();
    expect(mockUpdateResource).not.toHaveBeenCalled();
  });

  it('does not do anything for objects which do not have a title', () => {
    mockGetResource.mockResolvedValue({ id: object.id } as Thumbnail);

    const { rerender } = render(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: { [objectState.objectId]: objectState },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    expect(mockAddResource).not.toHaveBeenCalled();
    expect(mockUpdateResource).not.toHaveBeenCalled();

    rerender(
      <UploadManagerContext.Provider
        value={{
          setUploadState: () => {},
          uploadManagerState: {
            [objectState.objectId]: {
              ...objectState,
              status: UploadManagerStatus.SUCCESS,
            },
          },
        }}
      >
        <LTIUploadHandlers />
      </UploadManagerContext.Provider>,
    );

    expect(mockAddResource).not.toHaveBeenCalled();
    expect(mockUpdateResource).not.toHaveBeenCalled();
  });
});
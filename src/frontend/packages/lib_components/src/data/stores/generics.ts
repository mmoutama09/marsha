/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ClassroomModelName } from 'types/apps/classroom/models';
import { FileDepositoryModelName } from 'types/apps/deposit/models';
import { MarkdownDocumentModelName } from 'types/apps/markdown/models';
import { modelName, uploadableModelName } from 'types/models';
import { UploadableObject } from 'types/tracks';

const getStore = async (objectType: uploadableModelName) => {
  switch (objectType) {
    case modelName.THUMBNAILS:
      const { useThumbnail } = await import('./useThumbnail');
      return useThumbnail;
    case modelName.TIMEDTEXTTRACKS:
      const { useTimedTextTrack } = await import('./useTimedTextTrack');
      return useTimedTextTrack;
    case modelName.VIDEOS:
      const { useVideo } = await import('./useVideo');
      return useVideo;
    case modelName.DOCUMENTS:
      const { useDocument } = await import('./useDocument');
      return useDocument;
    case modelName.SHAREDLIVEMEDIAS:
      const { useSharedLiveMedia } = await import('./useSharedLiveMedia');
      return useSharedLiveMedia;
    case MarkdownDocumentModelName.MARKDOWN_IMAGES:
      const { useMarkdownImage } = await import('./useMarkdownImage');
      return useMarkdownImage;
    case FileDepositoryModelName.DepositedFiles:
      const { useDepositedFile } = await import('./useDepositedFile');
      return useDepositedFile;
    case ClassroomModelName.CLASSROOM_DOCUMENTS:
      const { useClassroomDocument } = await import('./useClassroomDocument');
      return useClassroomDocument;
  }
};

export const addMultipleResources = async (
  objectType: uploadableModelName,
  objects: UploadableObject[],
) => {
  const store = await getStore(objectType);
  store.getState().addMultipleResources(objects as any);
};

export const addResource = async (
  objectType: uploadableModelName,
  object: UploadableObject,
) => {
  const store = await getStore(objectType);
  store.getState().addResource(object as any);
};

export const getResource = async (
  objectType: uploadableModelName,
  objectId: string,
) => {
  const store = await getStore(objectType);
  const state = store.getState();
  return state[objectType] && state[objectType]![objectId];
};
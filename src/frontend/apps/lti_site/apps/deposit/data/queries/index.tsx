import { Maybe } from 'lib-common';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';

import {
  APIList,
  createOne,
  fetchList,
  FetchListQueryKey,
  fetchOne,
  updateOne,
  DepositedFile,
  FileDepository,
  FileDepositoryModelName as modelName,
} from 'lib-components';

type FileDepositoriesResponse = APIList<FileDepository>;
type UseFileDepositoriesParams = { organization: Maybe<string> };
export const useFileDepositories = (
  params: UseFileDepositoriesParams,
  queryConfig?: UseQueryOptions<
    FileDepositoriesResponse,
    modelName.FileDepositories,
    FileDepositoriesResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = [modelName.FileDepositories, params];
  return useQuery<
    FileDepositoriesResponse,
    modelName.FileDepositories,
    FileDepositoriesResponse,
    FetchListQueryKey
  >(key, fetchList, queryConfig);
};

interface FileDepositoriesSelectResponse {
  new_url: string;
  file_depositories: FileDepository[];
}
export const useSelectFileDepository = (
  queryConfig?: UseQueryOptions<
    FileDepositoriesSelectResponse,
    modelName.FileDepositories,
    FileDepositoriesSelectResponse
  >,
) => {
  const key = [modelName.FileDepositories, 'lti-select'];
  return useQuery<FileDepositoriesSelectResponse, modelName.FileDepositories>(
    key,
    fetchOne,
    queryConfig,
  );
};

export const useFileDepository = (
  fileDepositoryId: string,
  queryConfig?: UseQueryOptions<
    FileDepository,
    modelName.FileDepositories,
    FileDepository
  >,
) => {
  const key = [modelName.FileDepositories, fileDepositoryId];
  return useQuery<FileDepository, modelName.FileDepositories>(
    key,
    fetchOne,
    queryConfig,
  );
};

type UseCreateFileDepositoryData = {
  playlist: string;
  title: string;
  description?: string;
  lti_id?: string;
};
type UseCreateFileDepositoryError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseCreateFileDepositoryData]?: string[] }[];
    };
type UseCreateFileDepositoryOptions = UseMutationOptions<
  FileDepository,
  UseCreateFileDepositoryError,
  UseCreateFileDepositoryData
>;
export const useCreateFileDepository = (
  options?: UseCreateFileDepositoryOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    FileDepository,
    UseCreateFileDepositoryError,
    UseCreateFileDepositoryData
  >(
    (newFileDepository) =>
      createOne({
        name: modelName.FileDepositories,
        object: newFileDepository,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(modelName.FileDepositories);
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
    },
  );
};

type UseUpdateFileDepositoryData = Partial<
  Omit<FileDepository, 'portable_to'> & { portable_to: string[] }
>;
type UseUpdateFileDepositoryError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseUpdateFileDepositoryData]?: string[] }[];
    };
type UseUpdateFileDepositoryOptions = UseMutationOptions<
  FileDepository,
  UseUpdateFileDepositoryError,
  UseUpdateFileDepositoryData
>;
export const useUpdateFileDepository = (
  id: string,
  options?: UseUpdateFileDepositoryOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    FileDepository,
    UseUpdateFileDepositoryError,
    UseUpdateFileDepositoryData
  >(
    (updatedFileDepository) =>
      updateOne({
        name: modelName.FileDepositories,
        id,
        object: updatedFileDepository,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(modelName.FileDepositories);
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries(modelName.FileDepositories);
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

type DepositedFilesResponse = APIList<DepositedFile>;
type UseDepositedFilesParams = {};
export const useDepositedFiles = (
  fileDepositoryId: string,
  params: UseDepositedFilesParams,
  queryConfig?: UseQueryOptions<
    DepositedFilesResponse,
    modelName.DepositedFiles,
    DepositedFilesResponse,
    FetchListQueryKey
  >,
) => {
  const key: FetchListQueryKey = [
    `${modelName.FileDepositories}/${fileDepositoryId}/${modelName.DepositedFiles}`,
    params,
  ];
  return useQuery<
    DepositedFilesResponse,
    modelName.DepositedFiles,
    DepositedFilesResponse,
    FetchListQueryKey
  >(key, fetchList, queryConfig);
};

type UseUpdateDepositedFileData = Partial<DepositedFile>;
type UseUpdateDepositedFileError =
  | { code: 'exception' }
  | {
      code: 'invalid';
      errors: { [key in keyof UseUpdateDepositedFileData]?: string[] }[];
    };
type UseUpdateDepositedFileOptions = UseMutationOptions<
  DepositedFile,
  UseUpdateDepositedFileError,
  UseUpdateDepositedFileData
>;
export const useUpdateDepositedFile = (
  id: string,
  options?: UseUpdateDepositedFileOptions,
) => {
  const queryClient = useQueryClient();
  return useMutation<
    DepositedFile,
    UseUpdateDepositedFileError,
    UseUpdateDepositedFileData
  >(
    (updatedDepositedFile) =>
      updateOne({
        name: modelName.DepositedFiles,
        id,
        object: updatedDepositedFile,
      }),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(modelName.DepositedFiles);
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        queryClient.invalidateQueries(modelName.DepositedFiles);
        if (options?.onError) {
          options.onError(error, variables, context);
        }
      },
    },
  );
};

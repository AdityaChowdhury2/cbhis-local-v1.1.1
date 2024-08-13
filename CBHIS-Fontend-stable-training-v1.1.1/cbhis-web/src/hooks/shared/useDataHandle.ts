type Props = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  length: number;
};

const useDataHandling = ({ isLoading, isError, isSuccess, length }: Props) => {
  if (isLoading && !isError && !isSuccess) {
    return {
      isDataLoading: true,
      dataNotFound: false,
      isDataSuccess: false,
      isDataError: false,
    };
  }

  if (!isLoading && !isError && isSuccess && length < 1) {
    return {
      isDataLoading: false,
      dataNotFound: true,
      isDataSuccess: false,
      isDataError: false,
    };
  }

  if (!isLoading && !isError && isSuccess && length > 0) {
    return {
      isDataLoading: false,
      dataNotFound: false,
      isDataSuccess: true,
      isDataError: false,
    };
  }

  return {
    isDataLoading: false,
    dataNotFound: false,
    isDataSuccess: false,
    isDataError: true,
  };
};

export default useDataHandling;

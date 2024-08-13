const useCreateBase = ({}) => {
  const createBase = {
    createdBy: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    dateCreated: new Date().toISOString(),
    isDeleted: false,
    isSynced: false,
  };
  return { createBase };
};
export default useCreateBase

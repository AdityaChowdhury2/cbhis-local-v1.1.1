export const filterEmptyString = (data: Object) => {
  const removeEmptyString = { ...data };
  Object.keys(removeEmptyString).forEach((key) => {
    if (removeEmptyString[key] === "") {
      removeEmptyString[key] = null;
    }
  });
  return removeEmptyString;
};

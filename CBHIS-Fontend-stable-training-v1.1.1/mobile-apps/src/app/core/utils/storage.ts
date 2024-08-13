export const saveItem = (key:any, data:any) => {
  const serializedState = JSON.stringify(data);
  localStorage.setItem(key, serializedState);
};

export const getItemByKey = (key:any) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const deleteItemByKey = (key:any) => localStorage.setItem(key, "");
 export const clearStorage = () => localStorage.clear();

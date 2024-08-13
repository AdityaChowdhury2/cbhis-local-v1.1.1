export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// handle change username with debounce
// const debouncedChangeHandler = useCallback(
//   debounce(({ name, value }) => {
//     // if (name === "username") setCheckUsername(value);
//     // if (name === "cellphone") setCheckPhone(value);
//     console.log("Debounced Value: " + name + "=", value);
//     // Handle the debounced value here
//   }, 500),
//   []
// );

// username and phone no
// const handleChangeWithDebounce = (
//   event: React.ChangeEvent<HTMLInputElement>
// ) => {
//   const { name, value } = event.target;
//   setUserData((prev) => ({ ...prev, [name]: value }));
//   setInputError((prev) => ({ ...prev, [name]: "" }));
//   debouncedChangeHandler({ name, value });
// };

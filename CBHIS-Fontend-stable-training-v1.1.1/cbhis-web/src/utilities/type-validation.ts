export class TypeValidation {
  static isEmail(value: string): boolean {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
  }
  static isUserNameInput(value: string): boolean {
    return /^[A-Za-z0-9]{0,30}$/.test(value);
  }
  static isOnlyNumber(value: string): boolean {
    return /^\d{0,20}$/.test(value);
  }
}

export const typeValidation = new TypeValidation();

export const RegexPattern = {
  floatingNumberMatch: /^-?\d*\.?\d+$/,
  floatingNumberInput: /^-?\d*\.?\d*$/,
  onlyNumberMatch: /^(\d+)$/,
  onlyNumberInput: /^(\d+|)$/,
  nameInput: /^[A-Za-z ]*$/,
  surnameInput: /^[A-Za-z ]*$/,

  // Spuose SurName on client form
  spouseSurnameInput: /^[A-Za-z]*$/,
};

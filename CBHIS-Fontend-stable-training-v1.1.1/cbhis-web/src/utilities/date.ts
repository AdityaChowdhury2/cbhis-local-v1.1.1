import { format } from "date-fns";
import dayjs from "dayjs";

export class DateFunc {
  static formatDate(dateString: string) {
    // Convert the input date string to a Date object
    const dateObj = new Date(dateString);
    // Define month names to be used for formatting
    // prettier-ignore
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Format the date in the desired format
    const day = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;

    // Return the formatted date
    return year && month && year ? formattedDate : "";
  }

  static convertDateToDateObject = (dateString: string) => {
    const dateObj = new Date(dateString);
    return dateObj;
  };

  static convertDateObjectToDateString = (dateObj: Date) => {
    const dateString = dateObj?.toISOString();
    return dateString;
  };

  static isDateInFuture(givenDateStr: string) {
    const givenDate = new Date(givenDateStr);
    const now = new Date();
    return givenDate > now;
  }
  static toDay() {
    const date = new Date().toISOString();

    return date;
  }

  static isOverYears(inputDate: string, years: number) {
    const currentDate = new Date().getTime();
    const inputDateObj = new Date(inputDate).getTime();

    const differenceMillisecond = currentDate - inputDateObj;
    const eighteenYearsMillisecond = years * 365 * 24 * 60 * 60 * 1000;

    return differenceMillisecond >= eighteenYearsMillisecond;
  }

  static isBetweenHours(inputDate = new Date(), hours: number) {
    const currentDate = new Date().getTime();
    const inputDateObj = new Date(inputDate).getTime();

    const differenceMillisecond = currentDate - inputDateObj;
    const twentyFourHoursMillisecond = hours * 60 * 60 * 1000;

    return differenceMillisecond <= twentyFourHoursMillisecond;
  }
  static isBetween24Hours(inputDate: string) {
    return dayjs().diff(new Date(inputDate), "hour") <= 24;
  }

  // format human readable date
  static toFormatted = (dateString: string) => {
    return format(new Date(dateString), "dd-MMM-yyyy ");
  };
}

export const getAgeMessage = (dateString: string) => {
  const DOB = new Date(dateString);
  const now = new Date();

  // if date is error select
  if (now.getTime() - DOB.getTime() < 0) {
    return { error: true, ageMessage: "Invalid date of birth" };
  } else {
    const yearNow = now.getFullYear();
    const monthNow = now.getMonth();
    const dateNow = now.getDate();

    const dob = new Date(dateString);

    const yearDob = dob.getFullYear();
    const monthDob = dob.getMonth();
    const dateDob = dob.getDate();

    let yearAge = yearNow - yearDob;
    let monthAge: number;

    if (monthNow >= monthDob) {
      monthAge = monthNow - monthDob;
    } else {
      yearAge--;
      monthAge = 12 + monthNow - monthDob;
    }

    let dateAge: number;
    if (dateNow >= dateDob) {
      dateAge = dateNow - dateDob;
    } else {
      monthAge--;
      dateAge = 31 + dateNow - dateDob;

      if (monthAge < 0) {
        monthAge = 11;
        yearAge--;
      }
    }

    const age = { years: yearAge, months: monthAge, days: dateAge };

    // PLURAL STRING RETURN
    const formatYearString = yearAge > 1 ? " years " : " year ";
    const formatMonthString = monthAge > 1 ? " months " : " month ";
    const formatDayString = age.days > 1 ? " days" : " day";

    // IF VALUE ZERO THEN EMPTY RETURN
    const showYear = yearAge > 0 ? yearAge + formatYearString : "";
    const showMonth = monthAge > 0 ? monthAge + formatMonthString : "";
    const showDays = dateAge > 0 ? dateAge + formatDayString : "";

    const ageMessage = showYear + showMonth + showDays;

    return {
      ageMessage,
      error: false,
      age,
    };
  }
};

export const datePickerToString = (picker: Date | null | string) => {
  if (!picker) {
    return null;
  } else {
    const currentSub = "T00:00:00.000Z";
    //
    const pickerDate = new Date(picker);
    const day = pickerDate.getDate().toString().padStart(2, "0");
    const month = (pickerDate.getMonth() + 1).toString().padStart(2, "0");
    const year = pickerDate.getFullYear();
    const pickedCustom = `${year}-${month}-${day}`;
    //
    const returnDate = pickedCustom + currentSub;
    return returnDate;
  }
};

export const getSingleYear = (inputDate: string) => {
  const currentDate = new Date();
  const inputDateTime = new Date(inputDate);

  // Calculate the time difference in milliseconds
  const timeDifference = currentDate.getTime() - inputDateTime.getTime();

  // Convert milliseconds to days, weeks, months, and years
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  // const weeksDifference = Math.floor(daysDifference / 7);

  // Calculate the difference in months and years
  const currentYear = currentDate.getFullYear();
  const inputYear = inputDateTime.getFullYear();
  const yearsDifference = currentYear - inputYear;
  const currentMonth = currentDate.getMonth();
  const inputMonth = inputDateTime.getMonth();
  const monthsDifference =
    (currentYear - inputYear) * 12 + (currentMonth - inputMonth);

  // Format the result based on the time difference
  if (daysDifference < 30) {
    return `${daysDifference}D`;
  }
  // else if (weeksDifference <= 4) {
  //   return `${weeksDifference}W`;
  // }
  else if (monthsDifference <= 12) {
    return `${monthsDifference}M`;
  } else {
    return `${yearsDifference}Y`;
  }
};

// get date string to specifics day month year hours
export const getDateTimeDetails = (dateString: string | Date) => {
  const date = new Date(dateString);
  const day = date?.getDate();
  const month = date?.getMonth() + 1;
  const newMonth = date?.getMonth() + 1;
  const year = date?.getFullYear();

  const hour = date?.getHours();
  const minute = date?.getMinutes();
  const second = date?.getSeconds();
  const millisecond = date.getMilliseconds();

  const dayMonthYear = `${day < 10 ? "0" + day : day}/${
    month < 10 ? "0" + month : month
  }/${year}`;
  const monthDayYear = `${month < 10 ? "0" + month : month}/${
    day < 10 ? "0" + day : day
  }/${year}`;
  const hourMinuteSecond = dateString
    ? `${hour < 10 ? "0" + hour : hour}:${
        minute < 10 ? "0" + minute : minute
      }:${second < 10 ? "0" + second : second}`
    : "00:00:00";
  const hourMinute = `${hour < 10 ? "0" + hour : hour}:${
    minute < 10 ? "0" + minute : minute
  }`;
  const getActualMonth = `${day < 10 ? "0" + day : day}/${
    newMonth < 10 ? "0" + newMonth : newMonth
  }/${year}`;

  if (dateString) {
    return {
      dateObj: date,
      day,
      month,
      year,
      hour,
      minute,
      second,
      millisecond,
      dayMonthYear,
      hourMinute,
      hourMinuteSecond,
      monthDayYear,
      getActualMonth,
    };
  } else {
    return null; //<SkeletonList width={500} />;
  }
};

export const sortByDate = <T extends { messageDate: string }>(data: T[]) => {
  if (data?.length > 0) {
    return data?.slice()?.sort((a, b) => {
      const aDate = new Date(a.messageDate).getTime();
      const bDate = new Date(b.messageDate).getTime();
      return bDate - aDate;
    });
  }
};

export const sortByDateCreated = <T extends { dateCreated: string }>(data: T[]) => {
  if (data?.length > 0) {
    return data?.slice()?.sort((a, b) => {
      const aDate = new Date(a.dateCreated).getTime();
      const bDate = new Date(b.dateCreated).getTime();
      return bDate - aDate;
    });
  }
};
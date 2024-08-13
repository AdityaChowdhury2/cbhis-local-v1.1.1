type Props = {
  password: string;
};

export const PassStrength = ({ password }: Props) => {
  const { message, color, score, text } = getPasswordStrength(password);
  if (score)
    return (
      <div className="!w-full grid grid-cols-8 items-center  gap-3 leading-none mb-1 mt-0 px-[1px]">
        <div className="col-span-5 leading-none">
          <div className="w-full rounded leading-none">
            <span
              style={{ width: `${score * 20}%` }}
              className={` ${color} h-1.5 rounded `}
            ></span>
          </div>{" "}
        </div>
        <div className="h-fit col-span-3 text-right">
          <span
            className={`${text} text-[11px] 2xl:text-[13px] leading-none font-medium `}
          >
            {message}
          </span>
        </div>
      </div>
    );
};

export const getPasswordStrength = (password: string) => {
  let color = "";
  let message = "";
  let text = "";

  const length = password.length > 8 ? 1 : 0;
  const number = /[0-9]/.test(password) ? 1 : 0;
  const specialChar = /[!@#$%^&*(),.?"_+`/\\:{}|<>]/.test(password) ? 1 : 0;
  const uppercase = /[A-Z]/.test(password) ? 1 : 0;
  const lowercase = /[a-z]/.test(password) ? 1 : 0;
  const score = length + number + specialChar + uppercase + lowercase;

  if (score === 5) {
    message = "Strong";
    color = "bg-green-600";
    text = "text-green-600";
  } else if (score === 4) {
    message = "Medium";
    color = "bg-orange-400";
    text = "text-orange-400";
  } else if (score === 3) {
    message = "Medium";
    color = "bg-orange-300";
    text = "text-orange-300";
  } else if (score === 2) {
    message = "Weak";
    color = "bg-yellow-400";
    text = "text-yellow-400";
  } else if (score === 1) {
    message = "Very Weak";
    color = "bg-red-500";
    text = "text-red-500";
  } else if (score === 0) {
    message = "";
    color = "";
    text = "";
  }

  return { message, color, score, text };
};

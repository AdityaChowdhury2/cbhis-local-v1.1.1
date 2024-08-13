/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";
import { useEffect, useState } from "react";
import { BsBrilliance } from "react-icons/bs";
import { LuSunMedium } from "react-icons/lu";
import { MdOutlineDarkMode } from "react-icons/md";

// ThemeSwitcher component props
type Props = {
  isHeader?: boolean;
};

// ThemeSwitcher component
const ThemeSwitcher = ({ isHeader }: Props) => {
  // current theme mode
  const storedMode = localStorage.getItem("theme") || "cLight";

  // state for theme mode
  const [mode, setMode] = useState(storedMode);

  // toggle theme mode
  const toggleMode = (mod: string) => {
    localStorage.setItem("theme", mod);
    setMode(mod);
  };

  // change theme mode
  useEffect(() => {
    const colorThemeElement = document.getElementById("colorTheme");
    if (colorThemeElement) {
      colorThemeElement.setAttribute("data-theme", mode);
    }
  }, [mode]);

  return (
    <>
      {isHeader && (
        <div className="grid grid-cols-3 w-[250px] 2xl:w-[300px] text-[11px]">
          {/* LIGHT BUTTON */}
          <button
            className={styles(
              "bg-white text-black h-full w-full py-2 px-3 flex gap-1 items-center justify-center",
              { "bg-blueColor text-whiteColor": mode === "cLight" }
            )}
            onClick={() => toggleMode("cLight")}
          >
            <LuSunMedium size={16} /> Light
          </button>

          {/* DARK BUTTON */}
          <button
            className={styles(
              "bg-black h-full w-full py-2 px-3 flex gap-1 items-center justify-center text-white",
              { "bg-blueColor text-white": mode === "cDark" }
            )}
            onClick={() => toggleMode("cDark")}
          >
            <MdOutlineDarkMode size={16} /> Dark
          </button>

          {/* GRAY BUTTON */}
          <button
            className={styles(
              "bg-gray-500 h-full w-full py-2 px-3 flex gap-1 items-center justify-center text-white",
              {
                "bg-gray-800 text-white border-x-2 border-white":
                  mode === "cGray",
              }
            )}
            onClick={() => toggleMode("cGray")}
          >
            <BsBrilliance size={16} /> Gray
          </button>
        </div>
      )}
      {!isHeader && (
        <>
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="gap-1 flex items-center text-textColor"
              title="Change Mode"
            >
              <div
                className={`h-[30px] w-[30px] xs:h-[40px] xs:w-[40px] bg-black cursor-pointer dark:bg-gray-800 rounded-full flex justify-center items-center`}
              >
                {/* LIGHT ICON */}
                {mode === "cLight" && (
                  <MdOutlineDarkMode
                    color="#fff"
                    className="text-lg xs:text-2xl"
                  />
                )}

                {/* DARK ICON */}
                {mode === "cDark" && (
                  <LuSunMedium color="#fff" className="text-lg xs:text-2xl" />
                )}

                {/* GRAY ICON */}
                {mode === "cGray" && (
                  <BsBrilliance color="#fff" className="text-lg xs:text-2xl" />
                )}
              </div>
            </button>

            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu shadow bg-base-100 rounded overflow-hidden p-0 m-0 w-[150px]"
            >
              <li
                className={styles(
                  "rounded-none border-b hover:!bg-blueColor hover:text-white transition-all",
                  { "bg-blueColor text-whiteColor": mode === "cLight" }
                )}
              >
                <button className="" onClick={() => toggleMode("cLight")}>
                  <LuSunMedium size={20} className="w-[30px]" /> Light
                </button>
              </li>
              <li
                className={styles(
                  "rounded-none border-b hover:!bg-blueColor hover:text-white transition-all",
                  { "bg-blueColor text-white": mode === "cDark" }
                )}
              >
                <button onClick={() => toggleMode("cDark")}>
                  <MdOutlineDarkMode size={20} className="w-[30px]" /> Dark
                </button>
              </li>
              <li
                className={styles(
                  "rounded-none border-b hover:!bg-blueColor hover:text-white transition-all",
                  { "bg-blueColor text-white": mode === "cGray" }
                )}
              >
                <button onClick={() => toggleMode("cGray")}>
                  <BsBrilliance size={20} className="w-[30px]" /> Gray
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default ThemeSwitcher;

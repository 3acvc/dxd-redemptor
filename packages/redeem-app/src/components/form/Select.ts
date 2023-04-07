import { StylesConfig } from "react-select";

import {} from "ui/components/Button";

interface SelectStylesParams {
  marginBottom?: number;
  fontSize?: string | number;
}

const DEFAULT_FONT_SIZE = "14px";
const background = "#121312";

const backgroundHover = "#12ff80";
const colorHover = "#000";

const borderColor = "#646669";
const borderRadius = "4px";
const border = `1px solid ${borderColor}`;

export function getStyles<T>(
  { marginBottom, fontSize = DEFAULT_FONT_SIZE }: SelectStylesParams = {
    fontSize: DEFAULT_FONT_SIZE,
  }
) {
  return {
    container: (provided) => ({
      ...provided,
      minWidth: "80px",
    }),
    control: (provided, state) => ({
      ...provided,
      borderRadius,
      background,
      fontSize,
      border,
      boxShadow: "none",
      cursor: "pointer",
      width: "100%",
      padding: "8px 8px",
      marginBottom,
      transition: "all 0.2s ease",
      ":hover": {
        borderColor: "#fff",
      },
      ...(state.isFocused && {
        borderColor: `${backgroundHover} !important`,
      }),

    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: 0,
      fontSize,
            maxHeight: "80px",
      overflow: "hidden",
    }),
    input: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius,
      background,
      border,
      boxShadow: "none",
      overflow: "hidden",
      zIndex: 10,
      padding: 0,
      borderColor: backgroundHover,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#000" : background,
      color: "#fff",
      cursor: "pointer",
      fontSize,
      ":hover": {
        background: backgroundHover,
        color: colorHover,
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize,
      color: "#fff",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "90px",
      paddingTop: 0,
      paddingBottom: 0,
    }),
    multiValue: (provided) => ({
      ...provided,
      background: backgroundHover,
      color: colorHover,
      borderRadius,
      fontSize,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: colorHover,
    }),
  } as StylesConfig<T>;
}

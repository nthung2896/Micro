// =============================================
// NAV TYPE
// =============================================
export const NAV_TYPE_SIDE = "SIDE";
export const NAV_TYPE_TOP = "TOP";

// =============================================
// SIDE NAV
// =============================================
export const SIDE_NAV_WIDTH = 220;
export const SIDE_NAV_COLLAPSED_WIDTH = 70;

// =============================================
// TEMPLATE / LAYOUT
// =============================================
export const TEMPLATE = {
  HEADER_HEIGHT: 56,
  LAYOUT_CONTENT_GUTTER: 10,
  LAYOUT_CONTENT_GUTTER_SM: 10,
  SIDE_NAV_WIDTH: 220,
  SIDE_NAV_COLLAPSED_WIDTH: 70,
};

// =============================================
// MEDIA QUERIES
// =============================================
export const MEDIA_QUERIES = {
  MOBILE: "(max-width: 991px)",
  TABLET: "(max-width: 1199px)",
  LAPTOP: "(max-width: 992px)",
  LAPTOP_ABOVE: `(min-width: 992px)`,
  DESKTOP: "(min-width: 1200px)",
};

// =============================================
// GRAY SCALE
// =============================================
export const GRAY_SCALE = {
  WHITE: "#ffffff",
  GRAY_1: "#fafafa",
  GRAY_2: "#f5f5f5",
  GRAY_3: "#f0f0f0",
  GRAY_4: "#e9e9e9",
  GRAY_5: "#d9d9d9",
  GRAY_6: "#bfbfbf",
  GRAY_7: "#8c8c8c",
  GRAY_8: "#595959",
  GRAY_9: "#434343",
  GRAY_10: "#262626",
  GRAY_11: "#1f1f1f",
  GRAY_12: "#141414",
  BLACK: "#000000",
};

// =============================================
// FONT
// =============================================
export const FONT_WEIGHT = {
  LIGHT: 300,
  REGULAR: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
};

export const FONT_SIZES = {
  XS: "0.75rem", // 12px
  SM: "0.875rem", // 14px
  MD: "1rem", // 16px
  LG: "1.125rem", // 18px
  XL: "1.25rem", // 20px
  XXL: "1.5rem", // 24px
};

// =============================================
// SPACER
// =============================================
export const SPACER: Record<number, string> = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "2rem",
  8: "2.5rem",
  9: "3rem",
};

// =============================================
// THEMES
// =============================================
export const lightTheme = {
  token: {
    colorPrimary: "#0355a2",
    fontFamily: `'Inter', system-ui, sans-serif`,
    fontSize: 14,
    borderRadius: 6,
  },

  components: {
    Table: {
      colorText: "#1f1f1f",
      colorTextHeading: "#1a1a1a",

      headerBg: "#f3f4f6",
      headerColor: "#1f1f1f",

      rowHoverBg: "#E6EFFD",
      borderColor: "#cfcfcf",
    },

    Input: {
      borderRadius: 6,
      colorBorder: "#a5a5a5",
      colorTextPlaceholder: "#bfbfbf",
      colorText: "#333",
    },

    Select: {
      borderRadius: 6,
      colorBorder: "#a5a5a5",
      colorTextPlaceholder: "#bfbfbf",
    },

    DatePicker: {
      borderRadius: 6,
      colorBorder: "#a5a5a5",
      colorTextPlaceholder: "#bfbfbf",
    },

    Radio: {
      colorBorder: "#a5a5a5",
    },

    Form: {
      colorText: "#222",
    },

    InputNumber: {
      borderRadius: 6,
      colorBorder: "#a5a5a5",
      colorTextPlaceholder: "#bfbfbf",
      colorText: "#333",
    },

    Button: {
      borderRadius: 6,
      controlHeight: 36,
      fontWeight: 500,
    },

    Card: {
      borderRadiusLG: 10,
      paddingLG: 10,
    },

    Modal: {
      borderRadiusLG: 10,
    },

    Drawer: {
      paddingLG: 20,
    },
  },
};

export const baseTheme = {
  fontFamily: `'Inter', system-ui, sans-serif`,
  primaryColor: "#0355a2",
};

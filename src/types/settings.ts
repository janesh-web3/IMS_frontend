export interface Setting {
  _id: string;
  name: string;
  isDefault: boolean;
  settings: {
    headerBgColor: string;
    footerBgColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    borderWidth: number;
    borderColor: string;
    fontStyle: string;
    fontSize: {
      header: string;
      name: string;
      details: string;
    };
    fontWeight: {
      header: number;
      name: number;
      details: number;
    };
    patternColor: string;
    patternOpacity: number;
    backgroundPattern: string;
    layout: string;
    showQR: boolean;
    showLogo: boolean;
    customFields: Array<{
      label: string;
      value: string;
      show: boolean;
    }>;
  };
}

export const defaultSettings = {
  headerBgColor: "#3b82f6",
  footerBgColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  borderRadius: "md",
  borderWidth: 1,
  borderColor: "#e2e8f0",
  fontStyle: "sans",
  fontSize: {
    header: "lg",
    name: "md",
    details: "sm",
  },
  fontWeight: {
    header: 600,
    name: 500,
    details: 400,
  },
  patternColor: "#f1f5f9",
  patternOpacity: 0.5,
  backgroundPattern: "none",
  layout: "standard",
  showQR: true,
  showLogo: true,
  customFields: [],
};

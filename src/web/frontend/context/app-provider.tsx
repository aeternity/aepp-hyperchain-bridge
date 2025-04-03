import { OptionsObject, useSnackbar } from "notistack";
import { createContext } from "react";

export const AppContext = createContext({
  showInfo: (message: string) => {},
  showError: (message: string) => {},
  showSuccess: (message: string) => {},
});

const defaultSettings: OptionsObject = {
  autoHideDuration: 3000,
  preventDuplicate: true,
  anchorOrigin: { vertical: "bottom", horizontal: "center" },
};

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { enqueueSnackbar } = useSnackbar();

  const showSnack = (
    message: string,
    variant: "success" | "error" | "info"
  ) => {
    enqueueSnackbar(message, {
      ...defaultSettings,
      variant,
    });
  };

  const showInfo = (message: string) => showSnack(message, "info");
  const showError = (message: string) => showSnack(message, "error");
  const showSuccess = (message: string) => showSnack(message, "success");

  return (
    <AppContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}
    </AppContext.Provider>
  );
}

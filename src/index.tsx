import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { platforms, getPlatform } from "./Platforms";
import InstallDialog from "./InstallDialog";

interface InstallDialogOptions {
  [key: string]: any; // Adjust this according to the actual options used in InstallDialog
}

interface ReactPWAInstallContextProps {
  supported: () => boolean;
  isInstalled: () => boolean;
  pwaInstall: (options?: InstallDialogOptions) => Promise<void>;
}

const ReactPWAInstallContext = createContext<ReactPWAInstallContextProps | undefined>(undefined);

export const useReactPWAInstall = () => {
  const context = useContext(ReactPWAInstallContext);
  if (!context) {
    throw new Error("useReactPWAInstall must be used within a ReactPWAInstallProvider");
  }
  return context;
};

const platform = getPlatform();

interface ReactPWAInstallProviderProps {
  children: ReactNode;
  enableLogging?: boolean;
}

export const ReactPWAInstallProvider: React.FC<ReactPWAInstallProviderProps> = ({ children, enableLogging }) => {
  const awaitingPromiseRef = useRef<{ resolve: () => void; reject: () => void } | null>(null);
  const deferredprompt = useRef<any>(null);
  const [dialogState, setDialogState] = useState<InstallDialogOptions | null>(null);
  const [contextValue, setContextValue] = useState<ReactPWAInstallContextProps>({
    supported: supported,
    isInstalled: isInstalled,
    pwaInstall: openDialog,
  });

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPromptEvent);
    return function cleanup() {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPromptEvent);
    };
  }, [handleBeforeInstallPromptEvent]);

  function logger(message: string) {
    if (enableLogging) {
      console.log(message);
    }
  }

  function isInstalled(): boolean {
    const nav: any = window.navigator;
    if (nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches) {
      logger("isInstalled: true. Already in standalone mode");
      return true;
    }
    logger("isInstalled: false.");
    return false;
  }

  function supported(): boolean {
    if (deferredprompt.current != null && platform === platforms.NATIVE) {
      logger("supported: true - native platform");
      return true;
    }
    if (platform !== platforms.NATIVE && platform !== platforms.OTHER) {
      logger("supported: true - manual support");
      return true;
    }
    logger("supported: false");
    return false;
  }

  function handleBeforeInstallPromptEvent(event: Event) {
    event.preventDefault();
    deferredprompt.current = event;
    logger("beforeinstallprompt event fired and captured");
    setContextValue({
      supported: supported,
      isInstalled: isInstalled,
      pwaInstall: openDialog,
    });
  }

  function openDialog(options?: InstallDialogOptions): Promise<void> {
    setDialogState(options || {});
    return new Promise((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  }

  function handleClose() {
    setDialogState(null);
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject();
    }
  }

  function handleInstall() {
    logger("handleInstall called");
    setDialogState(null);
    if (deferredprompt.current != null) {
      return deferredprompt.current
        .prompt()
        .then(() => deferredprompt.current.userChoice)
        .then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === "accepted") {
            logger("PWA native installation successful");
            if (awaitingPromiseRef.current) {
              awaitingPromiseRef.current.resolve();
            }
          } else {
            logger("User opted out by cancelling native installation");
            if (awaitingPromiseRef.current) {
              awaitingPromiseRef.current.reject();
            }
          }
        })
        .catch((err: Error) => {
          if (awaitingPromiseRef.current) {
            awaitingPromiseRef.current.resolve();
          }
          logger("Error occurred in the installing process: " + err);
        });
    } else {
      if (awaitingPromiseRef.current) {
        awaitingPromiseRef.current.resolve();
      }
    }
  }

  return (
    <>
      <ReactPWAInstallContext.Provider value={contextValue}>
        {children}
      </ReactPWAInstallContext.Provider>

      <InstallDialog
        open={Boolean(dialogState)}
        onSubmit={handleInstall}
        onClose={handleClose}
        platform={platform}
        {...dialogState}
      />
    </>
  );
};

export default ReactPWAInstallProvider;
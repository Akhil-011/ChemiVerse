import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, RefreshCw, WifiOff, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

import { cn } from "@/lib/utils";
import { modalVariants } from "@/lib/animationVariants";
import { cardTransition, modalTransition, springTapTransition } from "@/lib/motionPresets";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaManager() {
  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW() {
      // Registration handled by the plugin; UI reacts to SW state below.
    },
  });

  const [installed, setInstalled] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const displayModeStandalone = window.matchMedia?.("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(displayModeStandalone);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const showInstall = useMemo(() => Boolean(installPrompt) && !installed, [installPrompt, installed]);

  const acceptInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const dismissInstall = () => setInstallPrompt(null);

  return (
    <>
      <AnimatePresence>
        {!online && (
          <motion.div
            key="pwa-offline"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}
            className="fixed left-1/2 top-4 z-[70] w-[min(92vw,420px)] -translate-x-1/2"
          >
            <div className="glass-card border border-amber-400/20 bg-amber-500/10 px-4 py-3 shadow-xl backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <WifiOff className="mt-0.5 h-4 w-4 text-amber-200" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-50">You are offline</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-50/80">
                    Cached app shell and static assets remain available. Chemistry APIs, voice, and AI features will resume when you reconnect.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed right-4 top-20 z-[70] flex max-w-[92vw] flex-col gap-3 sm:right-6">
        <AnimatePresence>
          {showInstall && (
            <motion.div
              key="pwa-install"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={modalTransition}
              className="pointer-events-auto w-[min(92vw,340px)]"
            >
              <div className="glass-card border border-cyan-400/20 bg-background/90 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Install ChemiVerse</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Add the app to your device for a faster launch, offline shell access, and a native app feel.
                    </p>
                  </div>
                  <button
                    onClick={dismissInstall}
                    className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Dismiss install prompt"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <motion.button
                    onClick={acceptInstall}
                    whileTap={{ scale: 0.96 }}
                    transition={springTapTransition}
                    className={cn("btn-neon inline-flex items-center gap-2 px-4 py-2 text-xs text-white")}
                  >
                    <Download size={14} />
                    Install App
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {needRefresh[0] && (
            <motion.div
              key="pwa-update"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={modalTransition}
              className="pointer-events-auto w-[min(92vw,340px)]"
            >
              <div className="glass-card border border-cyan-400/20 bg-background/90 p-4 shadow-2xl backdrop-blur-xl">
                <p className="text-sm font-semibold text-foreground">Update available</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  A new version is ready. Refresh to load the latest chemistry experience and cached assets.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <motion.button
                    onClick={() => updateServiceWorker(true)}
                    whileTap={{ scale: 0.96 }}
                    transition={springTapTransition}
                    className="btn-neon inline-flex items-center gap-2 px-4 py-2 text-xs text-white"
                  >
                    <RefreshCw size={14} />
                    Refresh Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {offlineReady[0] && !needRefresh[0] && (
            <motion.div
              key="pwa-ready"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={modalTransition}
              className="pointer-events-auto w-[min(92vw,300px)]"
            >
              <div className="glass-card border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 shadow-xl backdrop-blur-xl">
                <p className="text-sm font-semibold text-emerald-50">App shell ready offline</p>
                <p className="mt-1 text-xs text-emerald-50/80">Static assets are cached for faster repeat launches.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

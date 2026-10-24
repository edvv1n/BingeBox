import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Play, Copy, Check, X } from "lucide-react";
import { serverUrl, mobilePlatform, appUrl } from "@/lib/watch-settings";
const server = serverUrl(import.meta.env.VITE_JELLYFIN_SERVER_URL);
export default function WatchNow({
  className = "button",
  onLaunch,
}: {
  className?: string;
  onLaunch?: () => void;
}) {
  const [open, setOpen] = useState(false),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => dialog.current?.showModal());
    return () => {
      cancelAnimationFrame(frame);
      dialog.current?.close();
    };
  }, [open]);
  function launch(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const platform = mobilePlatform(
      navigator.userAgent,
      navigator.maxTouchPoints
    );
    if (server && !platform) {
      onLaunch?.();
      return;
    }
    e.preventDefault();
    onLaunch?.();
    setCopied(false);
    setCopyError(false);
    setOpen(true);
    if (!server) return;
    const link =
      platform === "android"
        ? appUrl(import.meta.env.VITE_JELLYFIN_ANDROID_APP_URL, "jellyfin://")
        : appUrl(
            import.meta.env.VITE_JELLYFIN_IOS_APP_URL,
            "org.jellyfin.expo://"
          );
    try {
      window.location.assign(link);
    } catch {
      /* The browser fallback stays visible. */
    }
  }
  return (
    <>
      <a
        ref={launcher}
        className={className}
        href={server || "#watch"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={launch}
      >
        <Play size={17} aria-hidden="true" />
        Watch Now
      </a>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="payment-modal watch-modal"
            aria-labelledby="watch-heading"
            onCancel={() => setOpen(false)}
          >
            <button
              className="close icon-button"
              aria-label="Close watch options"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
            <p className="eyebrow">ALREADY PART OF BINGEBOX?</p>
            <h2 id="watch-heading">
              {server ? "Your next binge awaits." : "Let’s get you watching."}
            </h2>
            {server ? (
              <>
                <p>
                  If Jellyfin didn’t open, launch the app from your home screen
                  or continue in your browser. Sign in with your existing
                  BingeBox credentials.
                </p>
                <a
                  className="button full"
                  href={server}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch in browser
                </a>
                <div className="watch-server">
                  <span>Server address</span>
                  <code>{server}</code>
                  <button
                    className="text-link"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(server);
                        setCopied(true);
                        setCopyError(false);
                      } catch {
                        setCopyError(true);
                      }
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                    {copied ? "Copied!" : "Copy server address"}
                  </button>
                  {copyError && (
                    <p role="status">Select and copy the address above.</p>
                  )}
                </div>
                <a
                  className="text-link"
                  href="https://jellyfin.org/downloads/clients/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get the Jellyfin app
                </a>
              </>
            ) : (
              <p>
                Contact{" "}
                <a href="mailto:b1ng3b0x@gmail.com">b1ng3b0x@gmail.com</a> for
                help accessing your account.
              </p>
            )}
          </dialog>,
          document.body
        )}
    </>
  );
}

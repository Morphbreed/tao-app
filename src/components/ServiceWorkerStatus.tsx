"use client";

import { useEffect, useState } from "react";
import styles from "./ServiceWorkerStatus.module.css";

type Progress = { done: number; total: number };

/** How long the finished notice stays before it withdraws. */
const SETTLE_MS = 3500;

/**
 * The one place that says what the service worker is doing: how far it has got
 * taking the app into the cache, and whether a newer version has taken over.
 *
 * Both share a single bar — two fixed bars would sit on top of each other.
 *
 * Without this the work is invisible, and the reader cannot tell whether the
 * app is ready for a journey without reception, nor whether a change has
 * arrived.
 */
export default function ServiceWorkerStatus() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [settled, setSettled] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; done?: number; total?: number };
      if (data?.type !== "precache") return;
      if (typeof data.done !== "number" || typeof data.total !== "number") return;
      setSettled(false);
      setProgress({ done: data.done, total: data.total });
    };

    // Whether a worker was already in charge decides what a change of guard
    // means: on the very first visit it is the initial install, not an update,
    // and announcing a new version there would simply be wrong.
    const hadController = Boolean(navigator.serviceWorker.controller);
    const onControllerChange = () => {
      if (hadController) setUpdated(true);
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  // Once complete, let the notice stand for a moment, then take it away.
  useEffect(() => {
    if (!progress || progress.done < progress.total) return;
    const timer = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [progress]);

  // The new version outranks the loading notice: it is the one thing that asks
  // something of the reader.
  if (updated) {
    return (
      <div className={styles.bar} role="status" aria-live="polite">
        <div className={`${styles.inner} ${styles.row}`}>
          <p className={styles.text}>Eine neue Fassung ist da.</p>
          <button type="button" className={styles.action} onClick={() => location.reload()}>
            Neu laden
          </button>
        </div>
      </div>
    );
  }

  if (!progress || settled) return null;

  const complete = progress.done >= progress.total;
  const share = progress.total > 0 ? progress.done / progress.total : 0;

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <div className={styles.inner}>
        <p className={styles.text}>
          {complete
            ? "Vollständig offline verfügbar."
            : `Inhalte werden für den Offline-Betrieb geladen … ${progress.done} von ${progress.total}`}
        </p>
        <div className={styles.track} aria-hidden="true">
          <span className={styles.fill} style={{ transform: `scaleX(${share})` }} />
        </div>
      </div>
    </div>
  );
}

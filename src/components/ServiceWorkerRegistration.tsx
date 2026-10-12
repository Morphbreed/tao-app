"use client";

import { useEffect } from "react";

import { BASE_PATH } from "@/lib/base-path";

/** Registers the service worker so the app stays readable offline. */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      // Der Worker liegt neben der App und bekommt deren Verzeichnis als
      // Geltungsbereich — sonst duerfte er unter /tao-app/ nichts ausliefern.
      navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` }).catch(() => {
        // Without a service worker the app still works — just not offline.
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}

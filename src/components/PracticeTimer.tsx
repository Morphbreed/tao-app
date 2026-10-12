"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatMinutes } from "@/lib/duration";
import styles from "./PracticeTimer.module.css";

type Status = "idle" | "running" | "done";

/** Seconds a tone takes to fade out. */
const TONE_LENGTH = 4;

/** Bounds for a freely entered duration. */
const MIN_MINUTES = 1;
const MAX_MINUTES = 120;

/** Fundamental and a quiet octave — rounder than a bare sine. */
const PARTIALS: [frequency: number, level: number][] = [
  [432, 1],
  [864, 0.3],
];

/**
 * Sounds a soft bell at a point on the audio clock. The oscillators are handed
 * back so a practice that is ended early can silence a tone already scheduled.
 *
 * The tone is synthesised rather than loaded: no binary in the repository and
 * nothing that could be missing from the offline cache.
 */
function ring(context: AudioContext, at: number): OscillatorNode[] {
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(0.22, at + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + TONE_LENGTH);
  envelope.connect(context.destination);

  return PARTIALS.map(([frequency, level]) => {
    const mix = context.createGain();
    mix.gain.value = level;
    mix.connect(envelope);

    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(mix);
    oscillator.start(at);
    oscillator.stop(at + TONE_LENGTH + 0.1);
    return oscillator;
  });
}

function clock(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * A quiet companion for a practice: a tone at the start, a tone at the end and
 * nothing in between. Deliberately keeps no record — no streaks, no totals,
 * nothing stored.
 */
export default function PracticeTimer({ minutes }: { minutes: number[] }) {
  const [selected, setSelected] = useState(minutes[0]);
  const [ownOpen, setOwnOpen] = useState(false);
  const [ownText, setOwnText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [endsAt, setEndsAt] = useState(0);
  // The duration actually started, so a changed selection cannot distort the
  // progress of a practice already running.
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [showTime, setShowTime] = useState(false);

  const ownField = useRef<HTMLInputElement>(null);

  const typed = Number.parseInt(ownText, 10);
  const typedValid = typed >= MIN_MINUTES && typed <= MAX_MINUTES;
  // Null while the field is open but not yet usable — the practice cannot start.
  const chosen = ownOpen ? (typedValid ? typed : null) : selected;

  const contextRef = useRef<AudioContext | null>(null);
  const scheduledRef = useRef<OscillatorNode[]>([]);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const silence = useCallback(() => {
    for (const oscillator of scheduledRef.current) {
      try {
        oscillator.stop();
      } catch {
        // Already finished — nothing left to stop.
      }
    }
    scheduledRef.current = [];
  }, []);

  const releaseWakeLock = useCallback(() => {
    void wakeLockRef.current?.release().catch(() => undefined);
    wakeLockRef.current = null;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      // Refused or unsupported. The practice runs either way.
    }
  }, []);

  const start = useCallback(() => {
    if (chosen === null) return;

    if (!contextRef.current) {
      // Created inside the click: browsers refuse audio without a gesture.
      contextRef.current = new AudioContext();
    }
    const context = contextRef.current;
    void context.resume();

    ring(context, context.currentTime);
    // The closing tone is scheduled on the audio clock straight away. Timers in
    // a background tab get throttled; the audio scheduler stays accurate.
    scheduledRef.current = ring(context, context.currentTime + chosen * 60);

    const span = chosen * 60_000;
    setDuration(span);
    setEndsAt(Date.now() + span);
    setRemaining(span);
    setStatus("running");
    void requestWakeLock();
  }, [chosen, requestWakeLock]);

  const stop = useCallback(() => {
    silence();
    releaseWakeLock();
    setShowTime(false);
    setStatus("idle");
  }, [silence, releaseWakeLock]);

  const finish = useCallback(() => {
    // The closing tone is already sounding — let it ring out.
    scheduledRef.current = [];
    releaseWakeLock();
    setShowTime(false);
    setStatus("done");
  }, [releaseWakeLock]);

  useEffect(() => {
    if (status !== "running") return;

    const tick = () => {
      const left = endsAt - Date.now();
      if (left <= 0) finish();
      else setRemaining(left);
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    // Coming back from a throttled background tab: recompute against the clock
    // instead of trusting how often the interval actually fired. The screen
    // lock is dropped by the browser while hidden, so ask for it again.
    const onVisible = () => {
      tick();
      if (document.visibilityState !== "visible") return;
      if (!wakeLockRef.current || wakeLockRef.current.released) void requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status, endsAt, finish, requestWakeLock]);

  useEffect(() => {
    if (ownOpen) ownField.current?.select();
  }, [ownOpen]);

  // Leaving the page must not leave a tone or a screen lock behind.
  useEffect(
    () => () => {
      silence();
      releaseWakeLock();
      void contextRef.current?.close().catch(() => undefined);
      contextRef.current = null;
    },
    [silence, releaseWakeLock]
  );

  const progress = status === "running" && duration > 0 ? 1 - remaining / duration : 0;

  return (
    <section className={styles.block} aria-labelledby="practice-timer-heading">
      <p id="practice-timer-heading" className={styles.heading}>
        Üben
      </p>

      <div className={styles.frame}>
        {status === "running" ? (
          <>
            <div className={styles.track} aria-hidden="true">
              <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
            </div>

            <p className={styles.state}>
              {showTime ? `Noch ${clock(remaining)}` : "Die Zeit läuft."}
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.quietButton}
                onClick={() => setShowTime((shown) => !shown)}
              >
                {showTime ? "Zeit verbergen" : "Zeit anzeigen"}
              </button>
              <button type="button" className={styles.quietButton} onClick={stop}>
                Beenden
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.choices} role="group" aria-label="Dauer">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  className={styles.choice}
                  aria-label={formatMinutes(minute)}
                  aria-pressed={!ownOpen && minute === selected}
                  onClick={() => {
                    setOwnOpen(false);
                    setSelected(minute);
                  }}
                >
                  {minute}
                </button>
              ))}

              {ownOpen ? (
                <input
                  ref={ownField}
                  type="number"
                  inputMode="numeric"
                  className={styles.own}
                  min={MIN_MINUTES}
                  max={MAX_MINUTES}
                  value={ownText}
                  aria-label={`Eigene Dauer in Minuten, ${MIN_MINUTES} bis ${MAX_MINUTES}`}
                  onChange={(event) => setOwnText(event.target.value)}
                />
              ) : (
                <button
                  type="button"
                  className={styles.choice}
                  aria-pressed={false}
                  onClick={() => {
                    setOwnText(String(selected));
                    setOwnOpen(true);
                  }}
                >
                  eigene
                </button>
              )}

              <span className={styles.unit} aria-hidden="true">
                Minuten
              </span>
            </div>

            <button
              type="button"
              className={styles.start}
              onClick={start}
              disabled={chosen === null}
            >
              Beginnen
            </button>

            <p className={styles.note}>
              {ownOpen && !typedValid
                ? `Eine Zahl zwischen ${MIN_MINUTES} und ${MAX_MINUTES}.`
                : "Ein leiser Ton am Anfang und am Ende, dazwischen nichts. Es wird nichts gespeichert und nichts gezählt."}
            </p>
          </>
        )}

        <p role="status" aria-live="polite" className={styles.announcement}>
          {status === "done" ? "Die Übungszeit ist vorüber." : ""}
        </p>
      </div>
    </section>
  );
}

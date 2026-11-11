"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background video for the homepage header.
 * - Muted, looping, plays inline on phones.
 * - Does NOT autoplay for people who turned on "reduce motion".
 * - Always has a visible Pause/Play button (accessibility rule for moving content).
 */
export function HeroVideo({ src, poster, label }: { src: string; poster: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {label && (
          <p className="rounded-full bg-black/55 px-3 py-1 text-base text-white">{label}</p>
        )}
        <button
          type="button"
          onClick={toggle}
          className="min-h-12 rounded-full border-2 border-white/80 bg-black/55 px-5 text-lg font-semibold text-white hover:bg-black/75"
        >
          {playing ? "Pause video" : "Play video"}
        </button>
      </div>
    </>
  );
}

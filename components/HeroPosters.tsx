import { Popcorn, Play } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { posters, type Movie } from "@/lib/posters";

export default function HeroPosters() {
  const [movies, setMovies] = useState<Movie[]>(posters);
  const [offset, setOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const artwork = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    const controller = new AbortController();
    fetch("/api/movies?v=2", { signal: controller.signal })
      .then((response) =>
        response.ok ? (response.json() as Promise<{ movies: Movie[] }>) : null
      )
      .then((data) => {
        if (data && data.movies.length >= 3) setMovies(data.movies);
      })
      .catch(() => {});
    return () => {
      media.removeEventListener("change", sync);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden)
        setOffset((current) => (current + 3) % movies.length);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [movies.length, reducedMotion]);

  function resetTilt() {
    artwork.current?.style.setProperty("--cursor-x", "0");
    artwork.current?.style.setProperty("--cursor-y", "0");
  }

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(
      -1,
      Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1)
    );
    const y = Math.max(
      -1,
      Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1)
    );
    event.currentTarget.style.setProperty("--cursor-x", String(x));
    event.currentTarget.style.setProperty("--cursor-y", String(y));
  }

  return (
    <div
      className="hero-art"
      ref={artwork}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
      aria-label="Featured movie artwork"
    >
      <div className="orb" />
      {["back-left", "back-right", "front"].map((position, index) => {
        const movie = movies[(offset + index) % movies.length];
        return (
          <a
            href={`#movie/${movie.id}`}
            aria-label={`View details for ${movie.title}`}
            className={`hero-poster ${position}`}
            key={position}
          >
            <img
              key={movie.poster_path}
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`${movie.title} poster`}
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </a>
        );
      })}
      <div className="floating-caption">
        <span className="tiny-play">
          <Play size={17} aria-hidden="true" />
        </span>
        <div>
          Tonight’s plans? Sorted.<small>Make room for a good story.</small>
        </div>
        <span className="sparkle">
          <Popcorn size={23} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

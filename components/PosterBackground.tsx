import { useEffect, useState } from "react";
import { posters, type Movie } from "@/lib/posters";

/** Decorative movie artwork, with theme overlays defined in index.css. */
export default function PosterBackground({
  intervalMs = 5_000,
}: {
  intervalMs?: number;
}) {
  const [movies, setMovies] = useState<Movie[]>(posters.slice(0, 5));
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    const controller = new AbortController();
    fetch("/api/movies", { signal: controller.signal })
      .then((response) =>
        response.ok ? (response.json() as Promise<{ movies: Movie[] }>) : null
      )
      .then((data) => {
        if (data?.movies?.length) {
          setActive(0);
          setMovies(data.movies.slice(0, 5));
        }
      })
      .catch(() => {});
    return () => {
      controller.abort();
      media.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || movies.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden)
        setActive((current) => (current + 1) % movies.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [movies.length, reducedMotion, intervalMs]);

  return (
    <div className="poster-background" aria-hidden="true">
      {movies.map((movie, index) => (
        <img
          key={movie.poster_path}
          className={index === active ? "is-active" : ""}
          src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
          alt=""
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      ))}
      <div className="poster-background-veil" />
    </div>
  );
}

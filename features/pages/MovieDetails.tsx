import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play, Star, UserRound, Film } from "lucide-react";
type Video = {
  key: string;
  site: "YouTube" | "Vimeo";
  name: string;
  type: string;
  official: boolean;
};
type Details = {
  id: number;
  title: string;
  overview: string;
  tagline: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  rating: number | null;
  vote_count: number;
  genres: string[];
  directors: string[];
  cast: { name: string; character: string; profile_path: string | null }[];
  videos: Video[];
};
const img = (path: string, size = "w500") =>
  "https://image.tmdb.org/t/p/" + size + path;
export default function MovieDetails({ id }: { id: string }) {
  const [movie, setMovie] = useState<Details | null>(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(0),
    [playing, setPlaying] = useState(false);
  const trailers = useRef<HTMLElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let active = true;
    setError("");
    setMovie(null);
    setPlaying(false);
    setSelected(0);
    fetch("/api/movies?id=" + encodeURIComponent(id), {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.movie)
          throw Error(
            data.error || "Movie information is temporarily unavailable."
          );
        return data.movie as Details;
      })
      .then((data) => {
        if (active) setMovie(data);
      })
      .catch((error) => {
        if (active)
          setError(
            error.name === "AbortError"
              ? "This is taking longer than expected. Please try again."
              : "Movie information could not be loaded. Please try again."
          );
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, attempt]);
  useEffect(() => {
    const previous = document.title;
    if (movie) document.title = movie.title + " — BingeBox";
    return () => {
      document.title = previous;
    };
  }, [movie]);
  if (error)
    return (
      <section className="movie-state">
        <Film size={36} />
        <h1>We couldn’t load this movie.</h1>
        <p role="alert">{error}</p>
        <button
          className="button"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </button>
        <a className="text-link" href="#home">
          Back to discovery
        </a>
      </section>
    );
  if (!movie)
    return (
      <section className="movie-state" aria-busy="true">
        <div className="movie-loading" />
        <p role="status">Getting the story ready…</p>
        <a className="text-link" href="#home">
          Back to discovery
        </a>
      </section>
    );
  const video = movie.videos[selected];
  const external = video
    ? video.site === "YouTube"
      ? "https://www.youtube.com/watch?v=" + video.key
      : "https://vimeo.com/" + video.key
    : "";
  function play() {
    setPlaying(true);
    trailers.current?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }
  return (
    <article className="movie-detail">
      <a className="text-link movie-back" href="#home">
        <ArrowLeft size={17} />
        Back to discovery
      </a>
      <section className="movie-hero">
        {movie.backdrop_path && (
          <img
            className="movie-backdrop"
            src={img(movie.backdrop_path, "w1280")}
            alt=""
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
        <div className="movie-hero-content">
          <div className="movie-cover">
            {movie.poster_path ? (
              <img
                src={img(movie.poster_path)}
                alt={movie.title + " poster"}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Film size={64} aria-hidden="true" />
            )}
          </div>
          <div className="movie-intro">
            <p className="eyebrow">THE STORY BEHIND YOUR NEXT BINGE</p>
            <h1>{movie.title}</h1>
            <div className="movie-meta">
              {movie.release_date && (
                <span>{movie.release_date.slice(0, 4)}</span>
              )}
              {movie.runtime && (
                <span>
                  {Math.floor(movie.runtime / 60) > 0
                    ? Math.floor(movie.runtime / 60) + "h "
                    : ""}
                  {movie.runtime % 60}m
                </span>
              )}
              {movie.vote_count > 0 && movie.rating !== null && (
                <span>
                  <Star size={15} aria-hidden="true" />
                  {movie.rating.toFixed(1)}/10{" "}
                  <small>
                    TMDB · {movie.vote_count.toLocaleString()} votes
                  </small>
                </span>
              )}
            </div>
            <div className="movie-genres">
              {movie.genres.map((genre) => (
                <span key={genre}>{genre}</span>
              ))}
            </div>
            {movie.tagline && <p className="movie-tagline">{movie.tagline}</p>}
            <p className="movie-overview">
              {movie.overview ||
                "A synopsis is not available for this movie yet."}
            </p>
            {!!movie.directors.length && (
              <p className="movie-director">
                Directed by <strong>{movie.directors.join(", ")}</strong>
              </p>
            )}
            <div className="movie-actions">
              {video && (
                <button className="button" onClick={play}>
                  <Play size={18} aria-hidden="true" />
                  Play trailer
                </button>
              )}
              <a className="button secondary" href="#request">
                Request a title
              </a>
            </div>
            <p className="movie-availability">
              Discovering a movie here does not confirm its availability on
              BingeBox.
            </p>
          </div>
        </div>
      </section>
      <section
        className="movie-trailers"
        ref={trailers}
        aria-labelledby="trailers-heading"
      >
        <p className="eyebrow">A LITTLE TASTE OF WHAT’S TO COME</p>
        <h2 id="trailers-heading">Trailers & teasers</h2>
        {video ? (
          <>
            <div className="trailer-frame">
              {playing ? (
                <iframe
                  key={video.site + video.key}
                  src={
                    video.site === "YouTube"
                      ? "https://www.youtube-nocookie.com/embed/" +
                        video.key +
                        "?autoplay=1&rel=0"
                      : "https://player.vimeo.com/video/" +
                        video.key +
                        "?autoplay=1"
                  }
                  title={movie.title + " — " + video.name}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <button
                  className="trailer-placeholder"
                  onClick={() => setPlaying(true)}
                >
                  {movie.backdrop_path && (
                    <img src={img(movie.backdrop_path, "w1280")} alt="" />
                  )}
                  <span className="trailer-play">
                    <Play size={32} aria-hidden="true" />
                  </span>
                  <strong>Play {video.type.toLowerCase()}</strong>
                  <span>{video.name}</span>
                </button>
              )}
            </div>
            {movie.videos.length > 1 && (
              <div className="trailer-choices" aria-label="Choose a trailer">
                {movie.videos.map((item, index) => (
                  <button
                    key={item.site + item.key}
                    className={index === selected ? "is-selected" : ""}
                    aria-pressed={index === selected}
                    onClick={() => {
                      setSelected(index);
                      setPlaying(false);
                    }}
                  >
                    {item.name || item.type}
                    {item.official && <small>Official</small>}
                  </button>
                ))}
              </div>
            )}
            <p className="trailer-note">
              Playback is provided by {video.site}. If the video is unavailable
              or embedding is blocked,{" "}
              <a href={external} target="_blank" rel="noopener noreferrer">
                watch on {video.site}
              </a>
              .
            </p>
          </>
        ) : (
          <div className="movie-empty">
            <Film size={26} aria-hidden="true" />
            <p>No trailer or teaser is currently available from TMDB.</p>
          </div>
        )}
      </section>
      {!!movie.cast.length && (
        <section className="movie-cast">
          <p className="eyebrow">THE FACES THAT MAKE THE STORY</p>
          <h2>Featured cast</h2>
          <div className="cast-grid">
            {movie.cast.map((person, index) => (
              <div className="cast-card" key={person.name + index}>
                <div className="cast-photo">
                  <UserRound size={34} aria-hidden="true" />
                  {person.profile_path && (
                    <img
                      src={img(person.profile_path, "w185")}
                      alt={person.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
                <h3>{person.name}</h3>
                <p>{person.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <p className="source-note movie-attribution">
        Movie information and images provided by{" "}
        <a
          href={"https://www.themoviedb.org/movie/" + movie.id}
          target="_blank"
          rel="noopener noreferrer"
        >
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </p>
    </article>
  );
}

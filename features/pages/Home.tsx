import WatchNow from "../../components/WatchNow";
import HeroPosters from "@/components/HeroPosters";
import {
  Play,
  Monitor,
  Smartphone,
  Tv,
  Check,
  Popcorn,
  Ticket,
  Clapperboard,
  Film,
} from "lucide-react";
import PosterReel from "@/components/PosterReel";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-badge">
            <Popcorn size={17} aria-hidden="true" /> A better kind of movie
            night
          </p>
          <h1>
            Less scrolling.
            <br />
            More <em>“one more.”</em>
          </h1>
          <p className="hero-description">
            Big stories. Unforgettable characters. Your next obsession.
            <br className="desktop" /> Welcome to BingeBox, your little escape
            from the everyday.
          </p>
          <div className="hero-actions">
            <a className="button" href="#signup">
              <Ticket size={18} aria-hidden="true" />
              Find your next binge
            </a>
            <a
              className="text-link"
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="play-circle">
                <Play size={12} />
              </span>{" "}
              How it works
            </a>
          </div>
          <div className="existing-member">
            <span>Already a member?</span>
            <WatchNow className="text-link" />
          </div>
          <div className="hero-perks">
            <span>
              <Check size={14} /> Powered by Jellyfin
            </span>
            <span>
              <Check size={14} /> Made for your screens
            </span>
          </div>
        </div>
        <HeroPosters />
      </section>
      <div className="device-strip">
        <span>ONE GREAT ESCAPE. EVERY SCREEN.</span>
        <div>
          <Tv size={21} /> Smart TV
        </div>
        <div>
          <Monitor size={21} /> Desktop
        </div>
        <div>
          <Smartphone size={21} /> Mobile & tablet
        </div>
        <span className="jellyfin-label">
          Powered by <b>Jellyfin</b>
        </span>
      </div>
      <PosterReel />
      <section className="how-section" id="how-it-works">
        <div>
          <p className="eyebrow icon-eyebrow">
            <Film size={16} aria-hidden="true" />
            FROM SIGNUP TO SCREEN TIME
          </p>
          <h2>
            Your next movie night,
            <br />
            in three simple steps.
          </h2>
          <a className="text-link" href="#signup">
            Let’s get you started
          </a>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "Make yourself at home",
              "Sign up with your name and email. No long forms.",
            ],
            [
              "02",
              "Confirm your subscription",
              "Follow the bank transfer instructions to complete payment.",
            ],
            [
              "03",
              "Press play",
              "We’ll email your login credentials once your subscription is confirmed.",
            ],
          ].map(([n, t, d]) => (
            <article key={n}>
              <span>{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="request-banner">
        <div className="request-symbol">
          <Clapperboard size={34} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">YOUR WATCHLIST HAS A VOICE</p>
          <h2>Got something in mind?</h2>
          <p>
            That film everyone’s talking about. That series you can’t find.
            <br />
            Tell us what you’d love to watch next.
          </p>
        </div>
        <a className="button secondary" href="#request">
          Request a title
        </a>
      </section>
      <div className="tmdb-note">
        <b>TMDB</b>
        <span>
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </span>
      </div>
    </>
  );
}

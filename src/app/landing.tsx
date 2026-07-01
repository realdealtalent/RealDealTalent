"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const LOGO_SRC = "/logo.png";

const CLIENT_LOGOS = [
  { src: "/Mistras%20Logo.png",                      alt: "Mistras Group",                  href: "https://www.mistrasgroup.com",      cls: "" },
  { src: "/IIA%20Logo.png",                           alt: "Industrial Inspection & Analysis", href: "https://industrial-ia.com",        cls: "" },
  { src: "/Kova%20Engineering%20Logo.png",            alt: "Kova Engineering",               href: "https://www.kova.com",              cls: "client-logo--kova", linkCls: "client-logo-link--multiply" },
  { src: "/ISS%20Logo.png",                           alt: "Industrial Specialty Services",  href: "https://isservices.com",            cls: "client-logo--tall" },
  { src: "/DarkVision%20Logo.webp",                   alt: "DarkVision",                     href: "https://darkvisiontech.com",        cls: "" },
  { src: "/PUPCO%20Logo.webp",                        alt: "PUPCO",                          href: "https://pupco.com",                 cls: "" },
  { src: "/Rent%20Equip%20Logo.svg",                  alt: "Rent Equip",                     href: "https://www.getrentequip.com",      cls: "client-logo--tall" },
  { src: "/Wilcoxon%20Sensing%20Technologies.webp",   alt: "Wilcoxon Sensing Technologies",  href: "https://wilcoxon.com",              cls: "" },
  { src: "/Ultimate%20Tool%20%26%20Safety%20Logo.png", alt: "Ultimate Tool & Safety",        href: "https://ultimatetoolandsafety.com", cls: "client-logo--lg" },
];

const TESTIMONIALS = [
  {
    name: `Gennaro "Jerry" D'Alterio`,
    role: "Chief Commercial Officer · Mistras Group",
    photo: "/Jerry%20D'Alterio.jpeg",
    type: "Client",
    quote: `Over the past three years, I've had the pleasure of working with Imran Walji and can confidently say he is one of the most authentic and effective recruiters I've encountered in my career. What sets Imran apart is that he is not focused on simply filling a position or closing a deal. He genuinely strives to create a win-win outcome for both the organization and the candidate. He takes the time to thoroughly understand the company, its culture, leadership, and objectives so he can accurately represent the opportunity and identify candidates who are truly the right fit. Imran is exceptionally detail-oriented, responsive, and well-prepared. By the time he presents a candidate, he has done his homework, vetted the individual thoroughly, and addressed the key questions and considerations upfront. This level of diligence saves valuable time and consistently leads to better outcomes. Perhaps most importantly, Imran operates with complete transparency and integrity. He has no hidden agenda, communicates openly and directly, and is committed to building long-term relationships rather than pursuing short-term transactions. His honesty, professionalism, and genuine care for both clients and candidates are refreshing in an industry where those qualities can sometimes be hard to find. If you are looking for a recruiting partner who is trustworthy, thorough, and invested in your long-term success, I highly recommend Imran. He truly lives up to the title of "The Honest Headhunter."`,
  },
  {
    name: "Doug Vail",
    role: "Chief Revenue Officer · Industrial Inspection & Analysis",
    photo: "/Doug%20Vail.jpg",
    type: "Client",
    quote: `I have had the pleasure of working with Imran on several sales professional hires. Imran brings energy and creativity to the recruitment process as he works through the candidate search process. His diligence early in the process to discover the "ideal candidate" profile has made the greatest difference for us in each hiring scenario regardless of where we are looking to hire; US or Canada roles have been filled through Im. He also preps candidates on our interests as the hiring team so the candidates showcase well, but also uses that process to see potential weaknesses that WE collectively agreed too after the interview stages. He is a valuable partner for IIA and I am confident he can help source the kind of teammate you need to grow your business.`,
  },
  {
    name: "Shane Walsh",
    role: "President · Rent Equip",
    photo: "/Shane%20Walsh.jpg",
    type: "Client",
    quote: `Im may be the most energetic person I've ever met! His hard work, over many months, to find us the perfect candidate has been absolutely invaluable to our company and to me personally. He gets results, is outstanding at follow up and most importantly — he does every single thing he says he will do. Dependable, professional and a heck of a good guy. Will definitely give Im a call again! He is a rock star.`,
  },
  {
    name: "Cliff Schaffer",
    role: "SVP of Aerospace & Defense · Mistras Group",
    photo: "/Cliff%20Schaffer.jpeg",
    type: "Client",
    quote: `Imran is an exceptional recruiter. We worked together on a few searches and his process yields not only exceptional candidates, but ones that we can get onboarded quickly. I was extremely impressed with his vetting process to limit the amount of "close, but not quite" candidates that were presented to the group and I for consideration. I would highly recommend Imran as a recruiting partner, and I will continue to partner with him. He's my first call when I have an opening!`,
  },
  {
    name: "Josh Sweeney",
    role: "VP of Sales & Marketing · PUPCO",
    photo: "/Josh%20Sweeney.jpg",
    type: "Client",
    quote: `I've had a great experience working with Im. He is honest, persistent, organized, and communicates well throughout the process. What stands out most is his follow-through. When he is working on something, he stays on it and keeps pushing until there is clarity or resolution. He brings a strong sense of urgency without being difficult to work with, and I've appreciated both his professionalism and his relentlessness.`,
  },
  {
    name: "Sam Yank",
    role: "Vice President of Sales · Industrial Inspection & Analysis",
    photo: "/Sam%20Yank.jpg",
    type: "Client",
    quote: `Imran is one of the most dedicated and effective recruiters I've encountered. He has a strong ability to understand both the needs of the organization and the goals of candidates, which allows him to make thoughtful, well-aligned matches. What sets Imran apart is his commitment to building real relationships, not just filling roles. He took the time to ensure the right fit for everyone involved, which leads to better long-term outcomes.`,
  },
  {
    name: "Kelly Terry",
    role: "Director of Talent Acquisition · Mistras Group",
    photo: "/Kelly%20Terry.jpg",
    type: "Client",
    quote: `Imran is an extremely talented recruiter who provides excellent service to both the customers he is representing as well as the candidates he is supporting. He has helped us with over 20 sales and operations hires across our primary NDT business, as well as Onstream Inline Inspection, Plant Condition Management Software (PCMS), and New Century Software (NCS). I highly recommend him as a partner to any industrial services business looking to add sales and operations talent.`,
  },
  {
    name: "Jim Habeck",
    role: "Director of Sales, Electrical & Datacom · PUPCO",
    photo: "/Jim%20Habeck.jpg",
    type: "Client",
    quote: `Imran is one of the most tenacious and hardworking recruiters I've partnered with. He consistently goes the extra mile to source strong, high-quality candidates and doesn't stop until he finds the right match. What truly sets him apart is the time he takes to deeply understand our business — our goals, our challenges, and our culture. Im approaches recruiting as a true business partner, not just a vendor.`,
  },
  {
    name: "Clint Maners",
    role: "Gulf Regional Sales Manager · Industrial Inspection & Analysis",
    photo: "/Clint%20Maners.jpeg",
    type: "Candidate",
    quote: `From a random phone call on a job opportunity that I eventually got, thanks to Imran and his negotiating skills. Imran is by far one of the best recruiters I've ever worked with. He does a great job of talking through things and helping prep throughout the process. It's been well over a year and we still talk on the regular just to ensure all is well. Highly recommend working with Imran and Real Deal Talent!`,
  },
  {
    name: "Connor Seebach",
    role: "British Columbia Regional Sales Manager · Industrial Inspection & Analysis/KOVA",
    photo: "/Connor%20Seebach.jpeg",
    type: "Candidate",
    quote: `I had an excellent experience working with Imran. Throughout the process, he was professional, responsive, and genuinely invested in finding the right fit for both the candidate and employer. Imran's communication was clear, and he provided valuable guidance every step of the way. I appreciated his attention to detail, and commitment to ensuring a smooth recruitment process. I would highly recommend Imran to anyone seeking career opportunities or recruitment support.`,
  },
  {
    name: "Amanda Wright",
    role: "Texas Sales Executive · Mistras Group",
    photo: "/Amanda%20Wright.jpg",
    type: "Candidate",
    quote: `Imran is the most amazing recruiter! Not only does he do a deep dive into the industry, company, and position he's hiring for, he's also a great coach to his candidates. Thorough professional with integrity. 5 out of 5 stars!`,
  },
  {
    name: "Trey Albin",
    role: "Outside Sales · Rent Equip",
    photo: "/Trey%20Albin.png",
    type: "Candidate",
    quote: `Working with Imran was a pleasure! The first time he cold-called me, it was for a sales role that we both decided wasn't the right fit. Most recruiters would disappear after that, but he stayed in touch, built rapport, and even met me for coffee. A few months later, he ended up placing me in my current outside sales role in Heavy Equipment. If you're in sales or operations in the Industrial Services or Heavy Equipment space, Imran should be your first call. He has more industry knowledge and contacts than any recruiter I've ever dealt with and always kept my best interests at heart throughout the entire hiring process. I wouldn't hesitate to recommend him to any candidate looking for a change or any company needing a solid headhunter.`,
  },
  {
    name: "Gregory Poser",
    role: "Sr. Technical Program Manager · Blue Origin",
    photo: "/Greg%20Poser.jpg",
    type: "Candidate",
    quote: `Imran was far and away the best recruiter experience I've ever had. He was responsive, communicative, professional, and warm. Most importantly, Imran went to great lengths to ensure the role was a good fit and that compensation and role expectations were in-line with my desires. There was never a moment where I felt that he was pushing me into the role, it felt very collaborative. I could not recommend Imran enough for anyone requiring recruiting services.`,
  },
  {
    name: "Josh Parker",
    role: "Pacific NW Sales Executive · Mistras Group",
    photo: "/Josh%20Parker.jpg",
    type: "Candidate",
    quote: `From our very first conversation, Imran demonstrated a deep understanding of the company, the role, and the broader industry landscape. What truly set Imran apart was his authentic care and attention to detail. He wasn't just trying to fill a position — he was genuinely invested in making sure the opportunity was the right long-term fit for both me and the company. His approach made the experience feel collaborative rather than transactional.`,
  },
  {
    name: "Ronald Venters",
    role: "West Coast Sales Executive · Mistras Group",
    photo: "/Ronald%20Venters.jpg",
    type: "Candidate",
    quote: `Imran placed me in my previous role and, when that tenure ended, guided me seamlessly into the next opportunity. He didn't just forward my résumé — he refined it to highlight the skills that mattered most and made sure it landed on the right desks. What sets Imran apart is his balance of candor and care. I always knew exactly where we stood in the process, and I never doubted that my best interests were top of mind.`,
  },
  {
    name: "Larry Ferguson",
    role: "Northeast Sales Executive · Mistras Group",
    photo: "/Larry%20Ferguson%20Updated.jpeg",
    type: "Candidate",
    quote: `Working with Imran has been a sincere pleasure. He was always responsive and truly listened to my needs and wants as a sales professional. Imran also had a strong understanding of the market I was looking to work in — he knew the strong companies and the ones that were not going to be a good fit for me. Would I recommend Imran, yes 100%!`,
  },
  {
    name: "Kurt Kalousek",
    role: "Texas Territory Sales Manager · PUPCO",
    photo: "/Kurt%20Kalousek.jpg",
    type: "Candidate",
    quote: `Imran was nothing short of amazing the whole way through my placement process. Professional, kind, and energetic. The same qualities that he looks for in the people he places. He leads by example, and goes above and beyond for the people he believes in. Even during the inevitable bumps in the road, he was there with solutions and guidance to keep my energy up. I was very lucky to have taken his call when I did.`,
  },
  {
    name: "John Kissel",
    role: "Southeast Sales Executive · Mistras Group",
    photo: "/John%20Kissel.jpg",
    type: "Candidate",
    quote: `I cannot recommend Imran Walji highly enough. Working with him during my job search was one of the best professional experiences I've had. From day one, he was transparent, honest, and incredibly thorough throughout the entire process. He prepared me for every interview, every response, and every step along the way, which gave me a level of confidence I honestly hadn't experienced before with recruiters. What truly separates him from others is that he is completely upfront about the company, the opportunity, and the expectations. There are no surprises, no sales pitch, just honest guidance and professional insight.`,
  },
  {
    name: "Steve Gunter",
    role: "Sales Manager · John Crane",
    photo: "/Steve%20Gunter.jpg",
    type: "Candidate",
    quote: `Imran is truly in a league of his own for recruiters. I've had many who talk a big game and make promises of what they can do. Imran just puts action in place. He gets to know you and what makes you motivated and finds the right place for you. He is a class act and I will recommend all who are looking to reach out to Imran first.`,
  },
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [quoteExpanded, setQuoteExpanded] = useState(false);
  const [logoIndex, setLogoIndex] = useState(0);
  const [logoOffset, setLogoOffset] = useState(0);
  const [logoAnimate, setLogoAnimate] = useState(true);
  const [logoPaused, setLogoPaused] = useState(false);
  const logoTrackRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    // Navbar scroll effect
    const navbar = document.getElementById("navbar");
    const handleScroll = () => {
      navbar?.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    if (prefersReducedMotion) {
      document
        .querySelectorAll(".fade-up")
        .forEach((el) => el.classList.add("visible"));
    }

    const observer = prefersReducedMotion
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
              }
            });
          },
          { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

    if (observer) {
      document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer?.disconnect();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Measure actual slide position for translateX
  useEffect(() => {
    const slide = logoTrackRef.current?.children[logoIndex] as HTMLElement | undefined;
    if (slide) setLogoOffset(slide.offsetLeft);
  }, [logoIndex]);

  // Logo step carousel: advance one slot every 3s, pause on hover
  useEffect(() => {
    if (logoPaused) return;
    const tick = setInterval(() => setLogoIndex(i => i + 1), 3000);
    return () => clearInterval(tick);
  }, [logoPaused]);

  // Seamless wrap: when we hit the clone set, snap back to start
  useEffect(() => {
    if (logoIndex === CLIENT_LOGOS.length) {
      const t = setTimeout(() => {
        setLogoAnimate(false);
        setLogoIndex(0);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [logoIndex]);

  // Re-enable transition one frame after the snap
  useEffect(() => {
    if (!logoAnimate) {
      const t = setTimeout(() => setLogoAnimate(true), 50);
      return () => clearTimeout(t);
    }
  }, [logoAnimate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { setTestimonialIndex(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); setQuoteExpanded(false); }
      if (e.key === "ArrowRight") { setTestimonialIndex(i => (i + 1) % TESTIMONIALS.length); setQuoteExpanded(false); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) { setTestimonialIndex(i => (i + 1) % TESTIMONIALS.length); setQuoteExpanded(false); }
      else { setTestimonialIndex(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); setQuoteExpanded(false); }
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => { el.removeEventListener("touchstart", onTouchStart); el.removeEventListener("touchend", onTouchEnd); };
  }, []);

  return (
    <>
      {/* NAVIGATION */}
      <nav id="navbar">
        <div className="nav-inner">
          <a href="/admin/login" className="nav-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Real Deal Talent" className="nav-logo-img" />
          </a>
          <ul className="nav-links">
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#industries">Industries</a></li>
            <li><a href="#specialties">What We Recruit</a></li>
            <li><a href="#contact" className="nav-cta">Let&apos;s Talk</a></li>
          </ul>
          <button
            className={`hamburger${mobileMenuOpen ? " open" : ""}`}
            id="hamburger"
            aria-controls="mobileMenu"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}
        id="mobileMenu"
      >
        <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
        <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
        <a href="#industries" onClick={() => setMobileMenuOpen(false)}>Industries</a>
        <a href="#specialties" onClick={() => setMobileMenuOpen(false)}>What We Recruit</a>
        <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Let&apos;s Talk</a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text fade-up">
              <h1>Your next <em>game-changing</em> hire starts here.</h1>
              <p>Real Deal Talent places Sales &amp; Operations professionals with Industrial Services, Heavy Equipment, Manufacturing &amp; Distribution companies across the US &amp; Canada. No fluff. No runaround. Just results.</p>
              <div className="hero-buttons">
                <a href="#contact" className="btn-primary">
                  Start a Search
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            </div>
            <div className="hero-visual fade-up" style={{ transitionDelay: "0.15s" }}>
              <div className="hero-card">
                <div className="hero-stat">
                  <div className="hero-stat-number">9+</div>
                  <div className="hero-stat-label">Years of headhunting in industrial markets</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">100+</div>
                  <div className="hero-stat-label">Placements across Sales &amp; Operations</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">US &amp; Canada</div>
                  <div className="hero-stat-label">Nationwide reach, coast to coast</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR CLIENTS */}
      <section className="our-clients-section">
        <div className="container">
          <div className="fade-up">
            <div className="section-label section-label--center">Our Clients</div>
          </div>
          <div
            className="logo-marquee fade-up"
            onMouseEnter={() => setLogoPaused(true)}
            onMouseLeave={() => setLogoPaused(false)}
          >
            <div
              className="logos-track"
              ref={logoTrackRef}
              style={{
                transform: `translateX(-${logoOffset}px)`,
                transition: logoAnimate ? 'transform 0.5s ease' : 'none',
              }}
            >
              {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, i) => (
                <div key={i} className="logo-slide">
                  <a href={logo.href} target="_blank" rel="noopener noreferrer" className={`client-logo-link ${logo.linkCls ?? ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.src} alt={logo.alt} className={`client-logo ${logo.cls}`} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="fade-up">
            <div className="section-label section-label--center">Testimonials</div>
          </div>
          <div className="testimonials-carousel fade-up" style={{ transitionDelay: "0.1s" }}>
            <div className="testimonials-row">
              <button
                className="carousel-btn"
                onClick={() => { setTestimonialIndex(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); setQuoteExpanded(false); }}
                aria-label="Previous testimonial"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11 14l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="testimonials-outer" ref={swipeRef}>
                {(() => { const t = TESTIMONIALS[testimonialIndex]; const LIMIT = t.name === "Kurt Kalousek" ? 245 : 250; const isLong = t.quote.length > LIMIT; return (
                  <div className="testimonial-card" key={testimonialIndex}>
                    <div className="testimonial-card-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.photo} alt={t.name} className="testimonial-avatar" width={88} height={88} />
                      <p className="testimonial-quote">
                        {isLong && !quoteExpanded ? `${t.quote.slice(0, LIMIT).trimEnd()}…` : t.quote}
                        {isLong && (
                          <button className="quote-toggle" onClick={() => setQuoteExpanded(e => !e)}>
                            {quoteExpanded ? " show less" : " read more"}
                          </button>
                        )}
                      </p>
                      <div className="testimonial-attribution">
                        <div className="testimonial-name">{t.name}</div>
                        <div className="testimonial-role">{t.role}</div>
                        <span className={`testimonial-type ${t.type.toLowerCase()}`}>{t.type}</span>
                      </div>
                    </div>
                  </div>
                ); })()}
              </div>
              <button
                className="carousel-btn"
                onClick={() => { setTestimonialIndex(i => (i + 1) % TESTIMONIALS.length); setQuoteExpanded(false); }}
                aria-label="Next testimonial"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="fade-up">
              <div className="section-label">About Real Deal Talent</div>
              <h2 className="section-title">An honest headhunter who bet on himself.</h2>
              <p className="section-subtitle">After eight years in the agency recruiting world placing talent across Wall Street, Oil &amp; Gas, Industrial Services, IIoT, and SaaS, I decided to go all in on my own. I launched Real Deal Talent because I saw a gap in the market for a recruiter who actually knows these industries &mdash; not just the buzzwords, but the people, the roles, and what it takes to build winning teams.</p>
              <p className="about-quote">Every client and candidate who&apos;s ever worked with me comes to the same conclusion &mdash; I&apos;m the best recruiter they&apos;ve ever dealt with.</p>
            </div>
            <div className="about-visual fade-up" style={{ transitionDelay: "0.1s" }}>
              <ul className="about-values">
                <li>
                  <span className="value-number">01</span>
                  <div>
                    <div className="value-title">No Fluff, Just Results</div>
                    <div className="value-desc">I don&apos;t send you a stack of resumes and hope for the best. I send you the right candidate, vetted and ready.</div>
                  </div>
                </li>
                <li>
                  <span className="value-number">02</span>
                  <div>
                    <div className="value-title">Deep Industry Knowledge</div>
                    <div className="value-desc">NDT, SIPA, ILI, TICC, pipeline integrity, heavy equipment &mdash; I speak the language because I&apos;ve lived in these spaces for nearly a decade.</div>
                  </div>
                </li>
                <li>
                  <span className="value-number">03</span>
                  <div>
                    <div className="value-title">PE-Backed &amp; Public Companies</div>
                    <div className="value-desc">Strong track record building out Sales &amp; Operations teams for privately-held, PE-backed, and publicly-traded companies.</div>
                  </div>
                </li>
                <li>
                  <span className="value-number">04</span>
                  <div>
                    <div className="value-title">Relationships Over Transactions</div>
                    <div className="value-desc">I&apos;m in this for the long haul. My clients become repeat clients because I deliver every single time.</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="industries" id="industries">
        <div className="container">
          <div className="fade-up">
            <div className="section-label section-label--center">Industries We Serve</div>
          </div>
          <div className="industry-grid">
            <div className="industry-card fade-up">
              <div className="industry-icon"><svg viewBox="0 0 24 24"><path d="M2 20h20M5 20V8l7-5 7 5v12M9 20v-6h6v6"/></svg></div>
              <h3>SIPA Contractors</h3>
              <p>Scaffolding, insulation, painting, and abatement services. Companies like BrandSafway, Brock Group, and specialty access providers.</p>
            </div>
            <div className="industry-card fade-up" style={{ transitionDelay: "0.08s" }}>
              <div className="industry-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
              <h3>TICC Contractors</h3>
              <p>Testing, inspection, certification, and compliance. Working with leaders like Mistras Group, Acuren, SGS, Bureau Veritas, Intertek, and more.</p>
            </div>
            <div className="industry-card fade-up" style={{ transitionDelay: "0.16s" }}>
              <div className="industry-icon"><svg viewBox="0 0 24 24"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20M14 12h.01"/></svg></div>
              <h3>Heavy Equipment</h3>
              <p>Equipment rental, sales, and service. Earthmoving, aerial platforms, telehandlers, concrete, and general jobsite machines.</p>
            </div>
            <div className="industry-card fade-up" style={{ transitionDelay: "0.24s" }}>
              <div className="industry-icon"><svg viewBox="0 0 24 24"><path d="M20 7h-9M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg></div>
              <h3>Master Distribution</h3>
              <p>Electrical hardware, components, power utility products. Serving wholesalers, distributors, OEMs, municipalities, and end-users.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="specialties" id="specialties">
        <div className="container">
          <div className="fade-up">
            <div className="section-label section-label--center">What We Recruit</div>


          </div>
          <div className="spec-grid">
            <div className="spec-card fade-up">
              <h3>Sales Talent</h3>
              <p>From boots-on-the-ground territory reps to the VP building the entire go-to-market strategy, we find revenue-driving talent that fits your culture and hits the ground running.</p>
              <div className="spec-roles">
                <span>Outside Sales Reps</span><span>Account Managers</span><span>BD Managers</span><span>Territory Sales Managers</span><span>Regional Sales Managers</span><span>Directors of Sales</span><span>VPs of Sales</span><span>Strategic Account Managers</span>
              </div>
            </div>
            <div className="spec-card fade-up" style={{ transitionDelay: "0.1s" }}>
              <h3>Operations Talent</h3>
              <p>The people who keep the machine running. We place operational leaders who manage teams, hit KPIs, and drive growth from the front lines to the C-suite.</p>
              <div className="spec-roles">
                <span>Operations Managers</span><span>Branch Managers</span><span>General Managers</span><span>Regional Managers</span><span>District Managers</span><span>Division Managers</span><span>Directors of Operations</span><span>VPs of Operations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner" id="contact">
        <div className="container">
          <h2 className="fade-up">Ready to make your next great hire?</h2>
          <p className="fade-up">Whether you need one critical placement or want to build an entire team, let&apos;s have a conversation about how Real Deal Talent can help.</p>
          <a href="https://www.linkedin.com/in/iwalji/" target="_blank" rel="noopener noreferrer" className="btn-white fade-up">
            Connect on LinkedIn
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12l8-8M6 4h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_SRC} alt="Real Deal Talent" className="footer-logo-img" />
              </div>
              <p className="footer-desc">Placing Sales &amp; Operations talent with Industrial Services, Heavy Equipment, Manufacturing &amp; Distribution companies across the US &amp; Canada.</p>
            </div>
            <div className="footer-col">
              <h4>Navigate</h4>
              <a href="#testimonials">Testimonials</a><a href="#about">About</a><a href="#industries">Industries</a><a href="#specialties">What We Recruit</a>
            </div>
            <div className="footer-col">
              <h4>Industries</h4>
              <a href="#industries">SIPA Contractors</a><a href="#industries">TICC Contractors</a><a href="#industries">Heavy Equipment</a><a href="#industries">Master Distribution</a>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="https://www.linkedin.com/in/iwalji/" target="_blank" rel="noopener noreferrer">LinkedIn Profile</a>
              <a href="https://www.linkedin.com/company/realdealtalent/" target="_blank" rel="noopener noreferrer">Company Page</a>
              <a href="mailto:info@realdealtalent.com">Email Us</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Real Deal Talent LLC. Austin, Texas. All rights reserved.</p>
            <div className="footer-social">
              <a href="https://www.linkedin.com/in/iwalji/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

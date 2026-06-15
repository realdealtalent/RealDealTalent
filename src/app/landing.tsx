"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const LOGO_SRC = "/logo.png";

const TESTIMONIALS = [
  {
    name: "Doug Vail",
    role: "Chief Revenue Officer · Industrial Inspection & Analysis",
    photo: "/Doug%20Vail.jpg",
    type: "Client",
    quote: `I have had the pleasure of working with Imran on several sales professional hires. Imran brings energy and creativity to the recruitment process as he works through the candidate search process. His diligence early in the process to discover the "ideal candidate" profile has made the greatest difference for us in each hiring scenario regardless of where we are looking to hire; US or Canada roles have been filled through Im. He also preps candidates on our interests as the hiring team so the candidates showcase well, but also uses that process to see potential weaknesses that WE collectively agreed too after the interview stages. He is a valuable partner for IIA and I am confident he can help source the kind of teammate you need to grow your business.`,
  },
  {
    name: "Sam Yank",
    role: "Vice President of Sales · Industrial Inspection & Analysis",
    photo: "/Sam%20Yank.jpg",
    type: "Client",
    quote: `Imran is one of the most dedicated and effective recruiters I've encountered. He has a strong ability to understand both the needs of the organization and the goals of candidates, which allows him to make thoughtful, well-aligned matches. What sets Imran apart is his commitment to building real relationships, not just filling roles. He took the time to ensure the right fit for everyone involved, which leads to better long-term outcomes.`,
  },
  {
    name: "Shane Walsh",
    role: "President · Rent Equip",
    photo: "/Shane%20Walsh.jpg",
    type: "Client",
    quote: `Im may be the most energetic person I've ever met! His hard work, over many months, to find us the perfect candidate has been absolutely invaluable to our company and to me personally. He gets results, is outstanding at follow up and most importantly — he does every single thing he says he will do. Dependable, professional and a heck of a good guy. Will definitely give Im a call again! He is a rock star.`,
  },
  {
    name: "Josh Sweeney",
    role: "VP of Sales & Marketing · PUPCO",
    photo: "/Josh%20Sweeney.jpg",
    type: "Client",
    quote: `I've had a great experience working with Im. He is honest, persistent, organized, and communicates well throughout the process. What stands out most is his follow-through. When he is working on something, he stays on it and keeps pushing until there is clarity or resolution. He brings a strong sense of urgency without being difficult to work with, and I've appreciated both his professionalism and his relentlessness.`,
  },
  {
    name: "Jim Habeck",
    role: "Director of Sales, Electrical & Datacom · PUPCO",
    photo: "/Jim%20Habeck.jpg",
    type: "Client",
    quote: `Imran is one of the most tenacious and hardworking recruiters I've partnered with. He consistently goes the extra mile to source strong, high-quality candidates and doesn't stop until he finds the right match. What truly sets him apart is the time he takes to deeply understand our business — our goals, our challenges, and our culture. Im approaches recruiting as a true business partner, not just a vendor.`,
  },
  {
    name: "Kelly Terry",
    role: "Director of Talent Acquisition · Mistras Group",
    photo: "/Kelly%20Terry.jpg",
    type: "Client",
    quote: `Imran is an extremely talented recruiter who provides excellent service to both the customers he is representing as well as the candidates he is supporting. He has helped MISTRAS with over 20 sales and operations hires across our primary MISTRAS NDT business, as well as Onstream Inline Inspection, Plant Condition Management Software (PCMS), and New Century Software (NCS). I highly recommend him as a partner to any industrial services business looking to add sales and operations talent.`,
  },
  {
    name: "Gregory Poser",
    role: "Sr. Technical Program Manager · Blue Origin",
    photo: "/Greg%20Poser.jpg",
    type: "Candidate",
    quote: `Imran was far and away the best recruiter experience I've ever had. He was responsive, communicative, professional, and warm. Most importantly, Imran went to great lengths to ensure the role was a good fit and that compensation and role expectations were in-line with my desires. There was never a moment where I felt that he was pushing me into the role, it felt very collaborative. I could not recommend Imran enough for anyone requiring recruiting services.`,
  },
  {
    name: "Amanda Wright",
    role: "Texas Sales Executive · Mistras Group",
    photo: "/Amanda%20Wright.jpg",
    type: "Candidate",
    quote: `Imran is the most amazing recruiter! Not only does he do a deep dive into the industry, company, and position he's hiring for, he's also a great coach to his candidates. Thorough professional with integrity. 5 out of 5 stars!`,
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
    photo: "/Larry%20Ferguson.jpg",
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
  const [testimonialsPerPage, setTestimonialsPerPage] = useState(3);

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

  useEffect(() => {
    const update = () => {
      const perPage = window.innerWidth < 768 ? 1 : 3;
      setTestimonialsPerPage(perPage);
      setTestimonialIndex(0);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
            <li><a href="#about">About</a></li>
            <li><a href="#industries">Industries</a></li>
            <li><a href="#specialties">Specialties</a></li>
            <li><a href="#placements">Track Record</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
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
        <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
        <a href="#industries" onClick={() => setMobileMenuOpen(false)}>Industries</a>
        <a href="#specialties" onClick={() => setMobileMenuOpen(false)}>Specialties</a>
        <a href="#placements" onClick={() => setMobileMenuOpen(false)}>Track Record</a>
        <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
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
                <a href="#placements" className="btn-secondary">See Our Track Record</a>
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

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="fade-up">
              <div className="section-label">About Real Deal Talent</div>
              <h2 className="section-title">An honest headhunter who bet on himself.</h2>
              <p className="section-subtitle">After eight years in the agency recruiting world placing talent across Wall Street, Oil &amp; Gas, Industrial Services, IIoT, and SaaS, I decided to go all in on my own. I launched Real Deal Talent in February 2025 because I saw a gap in the market for a recruiter who actually knows these industries &mdash; not just the buzzwords, but the people, the roles, and what it takes to build winning teams.</p>
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
            <div className="section-label">Industries We Serve</div>
            <h2 className="section-title" style={{ color: "var(--paper)" }}>Built for the toughest industries.</h2>
            <p className="section-subtitle">We recruit where the work is hard, the stakes are high, and the right hire makes all the difference.</p>
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
            <div className="section-label">What We Recruit</div>
            <h2 className="section-title">Sales &amp; Operations. That&apos;s our lane.</h2>
            <p className="section-subtitle">We stay focused so we can stay the best at what we do.</p>
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

      {/* TRACK RECORD */}
      <section className="track-record" id="placements">
        <div className="container">
          <div className="fade-up">
            <div className="section-label">Recent Placements</div>
            <h2 className="section-title">Results speak louder than resumes.</h2>
            <p className="section-subtitle">A snapshot of talent placed since launching Real Deal Talent in 2025.</p>
          </div>
          <div className="placements-grid">
            {[
              { role: "Director of Strategic Accounts", loc: "O&G Field Services — US & Canada", tag: "Sales" },
              { role: "Regional Sales Manager", loc: "Gulf Coast", tag: "Sales" },
              { role: "Regional Sales Manager", loc: "Alberta, Canada", tag: "Sales" },
              { role: "Regional Sales Manager", loc: "British Columbia, Canada", tag: "Sales" },
              { role: "General Manager, Field Services", loc: "Ohio", tag: "Operations" },
              { role: "General Manager, Field Services", loc: "Tennessee", tag: "Operations" },
              { role: "General Manager, Lab Services", loc: "Ohio", tag: "Operations" },
              { role: "General Manager, Lab Services", loc: "Washington", tag: "Operations" },
              { role: "Territory Sales Manager", loc: "South Carolina", tag: "Sales" },
              { role: "Territory Sales Manager", loc: "Texas", tag: "Sales" },
              { role: "Sales Executive", loc: "Texas", tag: "Sales" },
              { role: "Sales Executive", loc: "Western Canada", tag: "Sales" },
              { role: "Outside Sales Rep", loc: "Central Texas", tag: "Sales" },
              { role: "Account Manager", loc: "West Texas", tag: "Sales" },
            ].map((p, i) => (
              <div className="placement-item fade-up" key={i}>
                <div className="placement-role">{p.role}</div>
                <div className="placement-loc">{p.loc}</div>
                <div className="placement-tag">{p.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT TYPES */}
      <section className="clients-section">
        <div className="container">
          <div className="fade-up">
            <div className="section-label" style={{ justifyContent: "center" }}>Who We Work With</div>
            <h2 className="section-title" style={{ textAlign: "center" }}>Built for companies that build things.</h2>
          </div>
          <div className="client-types fade-up">
            <div className="client-type">
              <div className="client-type-icon"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <h3>PE-Backed Companies</h3>
              <p>Portfolio companies needing to scale sales and ops teams on a timeline</p>
            </div>
            <div className="client-type">
              <div className="client-type-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3zM12 8v8M8 12h8"/></svg></div>
              <h3>Publicly-Traded Firms</h3>
              <p>Large-cap industrials and services companies expanding market coverage</p>
            </div>
            <div className="client-type">
              <div className="client-type-icon"><svg viewBox="0 0 24 24"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <h3>Privately-Held Operators</h3>
              <p>Family-owned and founder-led industrial businesses ready to grow</p>
            </div>
            <div className="client-type">
              <div className="client-type-icon"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <h3>VC-Backed Startups</h3>
              <p>IIoT, SaaS, and industrial tech companies hiring their first sales leaders</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="fade-up">
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">What clients &amp; candidates say:</h2>
          </div>
          <div className="testimonials-carousel fade-up" style={{ transitionDelay: "0.1s" }}>
            <div className="testimonials-outer">
              <div
                className="testimonials-inner"
                style={{ transform: `translateX(-${testimonialIndex * (100 / testimonialsPerPage)}%)` }}
              >
                {TESTIMONIALS.map((t, i) => (
                  <div className="testimonial-card" key={i}>
                    <div className="testimonial-card-inner">
                      <p className="testimonial-quote">{t.quote}</p>
                      <div className="testimonial-footer">
                        <div className="testimonial-author">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.photo} alt={t.name} className="testimonial-avatar" width={42} height={42} />
                          <div>
                            <div className="testimonial-name">{t.name}</div>
                            <div className="testimonial-role">{t.role}</div>
                          </div>
                        </div>
                        <span className={`testimonial-type ${t.type.toLowerCase()}`}>{t.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="carousel-controls">
              <button
                className="carousel-btn"
                onClick={() => setTestimonialIndex(i => Math.max(0, i - 1))}
                disabled={testimonialIndex === 0}
                aria-label="Previous testimonials"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11 14l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="carousel-btn"
                onClick={() => setTestimonialIndex(i => Math.min(TESTIMONIALS.length - testimonialsPerPage, i + 1))}
                disabled={testimonialIndex === TESTIMONIALS.length - testimonialsPerPage}
                aria-label="Next testimonials"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
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
              <a href="#about">About</a><a href="#industries">Industries</a><a href="#specialties">Specialties</a><a href="#placements">Track Record</a><a href="#testimonials">Testimonials</a>
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

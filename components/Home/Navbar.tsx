"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// const COURSE_LINKS = [
//   { label: "Salesforce", href: "/salesforce-training/" },
//   { label: "Marketing Cloud", href: "/marketing-cloud/" },
//   { label: "Marketing Cloud Next", href: "/marketing-cloud-next/" },
//   { label: "Salesforce + LWC", href: "/salesforce-lwc/" },
//   { label: "Sales Cloud", href: "/sales-cloud/" },
//   { label: "Data Cloud", href: "/data-cloud/" },
//   { label: "AgentForce", href: "/agentforce/" },
//   { label: "Web Developement", href: "/web-developement/" },
//   { label: "Digital Marketing", href: "/digital-marketing/" },
// ];

const PAGE_LINKS = [
  { label: "Internship", href: "/more/internship/" },
  { label: "Blogs", href: "/more/blogs/" },
  // { label: "Salesforce Marketing Cloud", href:"/more/salesforce-marketing-cloud/"}
];

const HOME_LINK = { label: "Home", href: "/" };
const ABOUT_LINK = { label: "About Us", href: "/about-us/" };
const CONTACT_LINK = { label: "Contact", href: "/contact-us/" };
const ENROLL_LINK = { label: "Enroll Now", href: "/contact-us/" };
const COURSE_LINK = { label: "Courses", href: "/courses/" };

const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";

// Strips trailing slashes (except for "/") so "/courses" and "/courses/"
// are treated as the same route when comparing against the current path.
function normalizePath(path: string): string {
  if (path === "/") return path;
  return path.replace(/\/+$/, "");
}

function isPathActive(pathname: string, href: string): boolean {
  return normalizePath(pathname) === normalizePath(href);
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 10 6"
      className="h-[6px] w-[10px] transition-transform duration-300"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path
        d="M1 1l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DesktopLink({
  label,
  href,
  innerRef,
  active,
}: {
  label: string;
  href: string;
  innerRef?: (el: HTMLAnchorElement | null) => void;
  active: boolean;
}) {
  const underlineRef = useRef<HTMLSpanElement>(null);

  // On hover, always grow the underline in. On leave, only shrink it back
  // out if this link ISN'T the active page — the active page's underline
  // should stay put regardless of mouse position, since it represents
  // "you are here," not "you're currently hovering here."
  const handleEnter = () => {
    if (!underlineRef.current) return;
    gsap.to(underlineRef.current, {
      scaleX: 1,
      duration: 0.32,
      ease: "power3.out",
    });
  };
  const handleLeave = () => {
    if (!underlineRef.current || active) return;
    gsap.to(underlineRef.current, {
      scaleX: 0,
      duration: 0.25,
      ease: "power2.in",
    });
  };

  return (
    <Link
      href={href}
      ref={innerRef}
      aria-current={active ? "page" : undefined}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative py-2 text-[14.5px] font-medium transition-colors duration-200 hover:text-[#5B4FE0]"
      style={{ color: active ? ACCENT : "#1B1B24" }}
    >
      {label}
      <span
        ref={underlineRef}
        className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full"
        style={{
          background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})`,
          transform: active ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </Link>
  );
}

function DropdownNav({
  label,
  items,
  wide = false,
  active = false,
}: {
  label: string;
  items: { label: string; href: string }[];
  wide?: boolean;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const openNow = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
    if (underlineRef.current) {
      gsap.to(underlineRef.current, {
        scaleX: 1,
        duration: 0.32,
        ease: "power3.out",
      });
    }
  };
  const scheduleClose = () => {
    closeTimeout.current = setTimeout(() => setOpen(false), 140);
    // Same rule as DesktopLink: don't shrink the underline back out if one
    // of this dropdown's own pages is the currently active route.
    if (underlineRef.current && !active) {
      gsap.to(underlineRef.current, {
        scaleX: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  };

  useEffect(() => {
    if (!panelRef.current) return;
    if (open) {
      gsap.set(panelRef.current, {
        display: wide ? "grid" : "flex",
        pointerEvents: "auto",
      });
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: -10, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "power3.out" },
      );
      gsap.fromTo(
        itemRefs.current.filter(Boolean),
        { opacity: 0, y: -6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.22,
          stagger: 0.03,
          ease: "power2.out",
          delay: 0.04,
        },
      );
    } else {
      gsap.to(panelRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.98,
        duration: 0.18,
        ease: "power2.in",
        onComplete: () => {
          if (panelRef.current)
            gsap.set(panelRef.current, {
              display: "none",
              pointerEvents: "none",
            });
        },
      });
    }
  }, [open, wide]);

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openNow())}
        className="relative flex items-center gap-1 py-2 text-[14.5px] font-medium transition-colors duration-200 hover:text-[#5B4FE0]"
        style={{ color: active ? ACCENT : "#1B1B24" }}
      >
        {label}
        <ChevronIcon open={open} />
        <span
          ref={underlineRef}
          className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full"
          style={{
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})`,
            transform: active ? "scaleX(1)" : "scaleX(0)",
          }}
        />
      </button>

      <div
        ref={panelRef}
        className={[
          "absolute left-1/2 top-full hidden -translate-x-1/2 rounded-2xl border border-black/[.06] bg-white p-3 shadow-[0_20px_45px_-15px_rgba(20,20,40,0.25)]",
          wide
            ? "grid w-[540px] grid-cols-2 gap-x-4 gap-y-1 pt-4"
            : "flex w-56 flex-col gap-1",
        ].join(" ")}
        style={{ marginTop: 16 }}
      >
        {items.map((item, i) => {
          const itemActive = isPathActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              aria-current={itemActive ? "page" : undefined}
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-[#5B4FE0]/[.07] hover:text-[#5B4FE0]"
              style={{ color: itemActive ? ACCENT : "#3A3A46" }}
            >
              {item.label}
              <span className="translate-x-[-4px] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const navRef = useRef<HTMLDivElement>(null);
  const introRefs = useRef<Array<HTMLElement | null>>([]);
  const logoDotRef = useRef<HTMLSpanElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mobileItemRefs = useRef<Array<HTMLElement | null>>([]);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);
  const mobileCoursesRef = useRef<HTMLDivElement>(null);
  const mobilePagesRef = useRef<HTMLDivElement>(null);

  const isHomeActive = isPathActive(pathname, HOME_LINK.href);
  const isCoursesActive = isPathActive(pathname, COURSE_LINK.href);
  const isAboutActive = isPathActive(pathname, ABOUT_LINK.href);
  const isContactActive = isPathActive(pathname, CONTACT_LINK.href);
  const isMoreActive = PAGE_LINKS.some((link) => isPathActive(pathname, link.href));

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(navRef.current, { yPercent: -100, duration: 0.6 })
        .from(
          introRefs.current.filter(Boolean),
          { y: -10, opacity: 0, duration: 0.4, stagger: 0.05 },
          "-=0.25",
        )
        .from(
          logoDotRef.current,
          { scale: 0, duration: 0.5, ease: "back.out(3)" },
          "-=0.6",
        );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!logoDotRef.current) return;
    const tween = gsap.to(logoDotRef.current, {
      scale: 1.15,
      duration: 1.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => {
      tween.kill();
    };
  }, []);


  useEffect(() => {
    if (!navRef.current) return;
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "90px top",
      scrub: 0.3,
      onUpdate: (self) => {
        gsap.to(navRef.current, {
          height: gsap.utils.interpolate(80, 66, self.progress),
          boxShadow: `0 12px 30px -18px rgba(20,20,40,${0.25 * self.progress})`,
          duration: 0.15,
          overwrite: "auto",
          ease: "none",
        });
      },
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.set(overlayRef.current, { display: "block" });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25 },
      )
        .fromTo(
          panelRef.current,
          { xPercent: 100 },
          { xPercent: 0, duration: 0.45, ease: "power4.out" },
          "-=0.2",
        )
        .fromTo(
          mobileItemRefs.current.filter(Boolean),
          { x: 24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, stagger: 0.05 },
          "-=0.2",
        );
    } else {
      document.body.style.overflow = "";
      const tl = gsap.timeline({
        defaults: { ease: "power2.in" },
        onComplete: () => {
          if (overlayRef.current)
            gsap.set(overlayRef.current, { display: "none" });
          setMobileCoursesOpen(false);
          setMobilePagesOpen(false);
        },
      });
      tl.to(panelRef.current, {
        xPercent: 100,
        duration: 0.35,
        ease: "power3.in",
      }).to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.15");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mobileCoursesRef.current) return;
    gsap.to(mobileCoursesRef.current, {
      height: mobileCoursesOpen ? "auto" : 0,
      opacity: mobileCoursesOpen ? 1 : 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [mobileCoursesOpen]);

  useEffect(() => {
    if (!mobilePagesRef.current) return;
    gsap.to(mobilePagesRef.current, {
      height: mobilePagesOpen ? "auto" : 0,
      opacity: mobilePagesOpen ? 1 : 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [mobilePagesOpen]);

  return (
    <>
      <div
        ref={navRef}
        className="sticky top-0 z-50 flex w-full items-center border-b border-black/[.05] bg-white/85 backdrop-blur-md"
        style={{ height: 80 }}
      >
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            ref={(el) => {
              introRefs.current[0] = el;
            }}
            className="group flex shrink-0 items-center gap-2"
          >
           
              <Image
                src="/navbar/ceptra-infotech-icon.png"
                alt="Ceptra Infotech"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
     
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            <DesktopLink
              label={HOME_LINK.label}
              href={HOME_LINK.href}
              active={isHomeActive}
              innerRef={(el) => {
                introRefs.current[1] = el;
              }}
            />
            {/* <div
              ref={(el) => {
                introRefs.current[2] = el;
              }}
            >
              <DropdownNav label="Courses" items={COURSE_LINKS} wide />
            </div> */}
            <DesktopLink
              label={COURSE_LINK.label}
              href={COURSE_LINK.href}
              active={isCoursesActive}
              innerRef={(el) => {
                introRefs.current[1] = el;
              }}
            />
            <DesktopLink
              label={ABOUT_LINK.label}
              href={ABOUT_LINK.href}
              active={isAboutActive}
              innerRef={(el) => {
                introRefs.current[3] = el;
              }}
            />
            <DesktopLink
              label={CONTACT_LINK.label}
              href={CONTACT_LINK.href}
              active={isContactActive}
              innerRef={(el) => {
                introRefs.current[5] = el;
              }}
            />
            <div
              ref={(el) => {
                introRefs.current[4] = el;
              }}
            >
              <DropdownNav label="More" items={PAGE_LINKS} active={isMoreActive} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={ENROLL_LINK.href}
              ref={(el) => {
                introRefs.current[6] = el as unknown as HTMLElement;
              }}
              className="hidden h-10 items-center justify-center whitespace-nowrap rounded-full px-5 text-[13.5px] font-semibold text-white shadow-[0_10px_25px_-8px_rgba(91,79,224,0.6)] transition-transform duration-200 hover:scale-[1.04] lg:inline-flex"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
              }}
            >
              {ENROLL_LINK.label}
            </Link>

            <button
              aria-label="Open menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(true)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-black/[.08] lg:hidden"
            >
              <span className="h-[1.5px] w-5 bg-[#12121a]" />
              <span className="h-[1.5px] w-5 bg-[#12121a]" />
              <span className="h-[1.5px] w-3.5 self-end mr-[9px] bg-[#12121a]" />
            </button>
          </div>
        </nav>
      </div>

      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] hidden bg-black/40 backdrop-blur-sm lg:hidden"
        style={{ display: "none" }}
        onClick={(e) => {
          if (e.target === overlayRef.current) setIsOpen(false);
        }}
      >
        <div
          ref={panelRef}
          className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-black/[.06] px-6 py-5">
            <span className="text-[17px] font-bold tracking-tight text-[#12121a]">
              Ceptra
            </span>
            <button
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[.08]"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4">
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="#12121a"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-4">
            <Link
              href={HOME_LINK.href}
              ref={(el) => {
                mobileItemRefs.current[0] = el;
              }}
              onClick={() => setIsOpen(false)}
              aria-current={isHomeActive ? "page" : undefined}
              className="py-3 text-[16px] font-semibold"
              style={{ color: isHomeActive ? ACCENT : "#12121a" }}
            >
              {HOME_LINK.label}
            </Link>

            <Link
              href={COURSE_LINK.href}
              ref={(el) => {
                mobileItemRefs.current[2] = el;
              }}
              onClick={() => setIsOpen(false)}
              aria-current={isCoursesActive ? "page" : undefined}
              className="border-t border-black/[.06] py-3 text-[16px] font-semibold"
              style={{ color: isCoursesActive ? ACCENT : "#12121a" }}
            >
              {COURSE_LINK.label}
            </Link>

            <Link
              href={ABOUT_LINK.href}
              ref={(el) => {
                mobileItemRefs.current[2] = el;
              }}
              onClick={() => setIsOpen(false)}
              aria-current={isAboutActive ? "page" : undefined}
              className="border-t border-black/[.06] py-3 text-[16px] font-semibold"
              style={{ color: isAboutActive ? ACCENT : "#12121a" }}
            >
              {ABOUT_LINK.label}
            </Link>

            <Link
              href={CONTACT_LINK.href}
              ref={(el) => {
                mobileItemRefs.current[4] = el;
              }}
              onClick={() => setIsOpen(false)}
              aria-current={isContactActive ? "page" : undefined}
              className="border-t border-black/[.06] py-3 text-[16px] font-semibold"
              style={{ color: isContactActive ? ACCENT : "#12121a" }}
            >
              {CONTACT_LINK.label}
            </Link>

            <div
              ref={(el) => {
                mobileItemRefs.current[3] = el;
              }}
              className="border-t border-black/[.06]"
            >
              <button
                type="button"
                onClick={() => setMobilePagesOpen((v) => !v)}
                aria-expanded={mobilePagesOpen}
                className="flex w-full items-center justify-between py-3 text-[16px] font-semibold"
                style={{ color: isMoreActive ? ACCENT : "#12121a" }}
              >
                More
                <ChevronIcon open={mobilePagesOpen} />
              </button>
              <div
                ref={mobilePagesRef}
                className="flex flex-col overflow-hidden"
                style={{ height: 0, opacity: 0 }}
              >
                {PAGE_LINKS.map((link) => {
                  const linkActive = isPathActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={linkActive ? "page" : undefined}
                      className="py-2 pl-2 text-[14.5px]"
                      style={{ color: linkActive ? ACCENT : "#3A3A46" }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-black/[.06] px-6 py-5">
            <Link
              href={ENROLL_LINK.href}
              onClick={() => setIsOpen(false)}
              className="flex h-11 items-center justify-center rounded-full text-[14px] font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
              }}
            >
              {ENROLL_LINK.label}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
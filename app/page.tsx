'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { cvData } from './data/cv';

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: false, margin: '-60px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 font-mono text-xs tracking-[0.25em] uppercase text-muted">
      <span className="text-accent">{index}</span>
      <span>{title}</span>
      <span className="hidden sm:block flex-1 border-t border-line self-center" />
    </div>
  );
}

const projectAwards: (string | null)[] = [
  'Global-CENG · 1.lik',
  'En Yenilikçi Çözüm Ödülü',
  'Teknofest · 3.lük',
  null,
];

const navLinks = [
  { href: '#hakkimda', label: 'Hakkımda' },
  { href: '#deneyim', label: 'Deneyim' },
  { href: '#projeler', label: 'Projeler' },
  { href: '#iletisim', label: 'İletişim' },
];

export default function Home() {
  const [time, setTime] = useState('');
  const heroRef = useRef<HTMLElement>(null);

  // Smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      anchors: { offset: -80 },
    });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  });

  // Hero parallax
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 140]);
  const heroOpacity = useTransform(heroProgress, [0, 0.85], [1, 0]);

  const marqueeSkills = [...cvData.skills, ...cvData.skills];

  return (
    <main className="relative">
      {/* Scroll progress */}
      <motion.div
        style={{ scaleX: progressX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent origin-left z-[60]"
      />

      {/* ─── Nav ─── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-base/70 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="font-serif text-xl tracking-tight">
            Emre <span className="italic text-accent">Atalay</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="link-underline hover:text-fg transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            İstanbul {time && <span className="text-fg">— {time}</span>}
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section
        id="top"
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-end pt-32 overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute -top-48 right-[-10%] w-[640px] h-[640px] rounded-full bg-accent/10 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-15%] w-[480px] h-[480px] rounded-full bg-accent/5 blur-[140px] pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="flex-1 flex flex-col justify-center py-16 max-w-6xl mx-auto px-6 w-full"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-mono text-xs tracking-[0.3em] uppercase text-muted mb-8"
          >
            Yapay Zekâ Mühendisi · İstanbul — Trabzon
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="font-serif text-[clamp(3.2rem,10vw,8.5rem)] leading-[1.02] tracking-tight max-w-5xl"
          >
            Yunus Emre <em className="italic text-accent">Atalay</em>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            {[
              'Doğal Dil İşleme',
              'Görüntü İşleme',
              'Açıklanabilir YZ (XAI)',
              'Büyük Dil Modelleri',
            ].map((tag) => (
              <span
                key={tag}
                className="font-mono text-[11px] tracking-[0.15em] uppercase text-muted border border-line rounded-full px-4 py-2 bg-surface/70"
              >
                {tag}
              </span>
            ))}
            <div className="flex items-center gap-3 border border-line rounded-full px-5 py-2.5 bg-surface">
              <span className="pulse-dot w-2 h-2 rounded-full bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase">
                Zephlex — Yapay Zekâ Mühendisi
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="border-t border-line max-w-6xl mx-auto px-6 w-full pb-2 pt-4 flex justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-muted"
        >
          <span>Portfolyo — 2026</span>
          <span>Aşağı kaydırın ↓</span>
        </motion.div>
      </section>

      {/* ─── Skills marquee ─── */}
      <section className="border-y border-line bg-surface/40 overflow-hidden py-5 select-none">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {marqueeSkills.map((skill, i) => (
            <span
              key={i}
              className="mx-6 font-mono text-sm tracking-wider text-muted flex items-center gap-12"
            >
              {skill} <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ─── Hakkımda ─── */}
      <section id="hakkimda" className="scroll-mt-24 max-w-6xl mx-auto px-6 py-28 md:py-36">
        <Reveal>
          <SectionLabel index="01" title="Hakkımda" />
        </Reveal>

        <div className="mt-14 grid md:grid-cols-12 gap-12">
          <Reveal className="md:col-span-7">
            <p className="font-serif text-3xl md:text-4xl leading-snug tracking-tight">
              Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği mezunuyum;
              doğal dil işleme, görüntü işleme,{' '}
              <em className="italic text-accent">
                açıklanabilir yapay zekâ ve büyük dil modelleri
              </em>{' '}
              üzerine çalışmalar yapıyorum.
            </p>
            <p className="mt-8 text-muted leading-relaxed max-w-xl">
              Aktif olarak aynı üniversitede yüksek lisans eğitimime devam ediyorum.
              Akademik hayatım boyunca çeşitli yapay zekâ projelerinde ve
              yarışmalarında aktif roller üstlendim.
            </p>
            <p className="mt-4 text-muted leading-relaxed max-w-xl">
              Bitirme projemle, Turkcell Global Bilgi ve KTÜ ortaklığında düzenlenen
              chatbot yarışmasında birincilik ödülü kazandım. Teknofest ve kurumsal
              hackathonlarda derece ve finalistliklerim bulunuyor.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="md:col-span-5">
            <dl className="border-t border-line">
              {[
                { value: `${cvData.experience.length}`, label: 'Profesyonel deneyim' },
                { value: `${cvData.projects.length}+`, label: 'Öne çıkan proje' },
                { value: `${cvData.achievements.length}`, label: 'Ödül & finalistlik' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-baseline justify-between py-6 border-b border-line"
                >
                  <dt className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
                    {stat.label}
                  </dt>
                  <dd className="font-serif text-5xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ─── Deneyim ─── */}
      <section id="deneyim" className="scroll-mt-24 max-w-6xl mx-auto px-6 pb-28 md:pb-36">
        <Reveal>
          <SectionLabel index="02" title="Deneyim" />
        </Reveal>

        <div className="mt-14">
          {cvData.experience.map((exp, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="group grid md:grid-cols-12 gap-2 md:gap-8 py-8 border-t border-line transition-colors duration-300 hover:bg-surface/60 md:px-4 md:-mx-4 rounded-lg">
                <div className="md:col-span-3 font-mono text-xs tracking-wider text-muted pt-1.5">
                  {exp.date}
                </div>
                <div className="md:col-span-9">
                  <h3 className="font-serif text-2xl md:text-3xl tracking-tight group-hover:text-accent transition-colors duration-300">
                    {exp.role}
                  </h3>
                  <p className="mt-1 font-mono text-xs tracking-[0.15em] uppercase text-muted">
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ''}
                  </p>
                  <p className="mt-4 text-muted leading-relaxed max-w-2xl">
                    {exp.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-line" />
        </div>

        {/* Eğitim */}
        <Reveal className="mt-20">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted mb-8">
            Eğitim
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {cvData.education.map((edu, i) => (
              <div
                key={i}
                className="border border-line bg-surface/40 rounded-2xl p-8 hover:border-accent/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="font-serif text-xl tracking-tight">{edu.school}</h3>
                  <span className="font-mono text-[10px] tracking-widest text-muted whitespace-nowrap pt-1.5">
                    {edu.date}
                  </span>
                </div>
                <p className="text-sm">{edu.degree}</p>
                <p className="mt-2 font-mono text-xs text-muted">
                  GPA {edu.gpa} · {edu.location}
                </p>
                {edu.details && (
                  <p className="mt-4 text-sm text-muted leading-relaxed">{edu.details}</p>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ─── Projeler ─── */}
      <section id="projeler" className="scroll-mt-24 relative border-y border-line bg-surface/30 py-28 md:py-36 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[400px] rounded-full bg-accent/[0.07] blur-[160px] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionLabel index="03" title="Seçili Projeler" />
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {cvData.projects.map((project, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <article className="group h-full p-8 md:p-10 flex flex-col bg-base border border-line rounded-2xl hover:border-accent/50 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-24px_rgba(234,88,12,0.25)] transition-all duration-500">
                  <div className="flex items-start justify-between gap-4 mb-10">
                    <span className="font-serif italic text-5xl text-accent/90">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {projectAwards[i] && (
                      <span className="font-mono text-[10px] tracking-widest uppercase border border-accent/50 text-accent px-3 py-1.5 rounded-full whitespace-nowrap">
                        {projectAwards[i]}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl md:text-[1.7rem] leading-tight tracking-tight">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted flex-1">
                    {project.description}
                  </p>
                  <p className="mt-8 font-mono text-[10px] tracking-[0.2em] uppercase text-muted/70">
                    {project.date}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ödüller ─── */}
      <section className="max-w-6xl mx-auto px-6 py-28 md:py-36">
        <Reveal>
          <SectionLabel index="04" title="Ödüller & Başarılar" />
        </Reveal>

        <div className="mt-14">
          {cvData.achievements.map((achievement, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className="group flex items-baseline gap-6 md:gap-10 py-6 border-t border-line hover:bg-surface/60 transition-colors duration-300 md:px-4 md:-mx-4 rounded-lg">
                <span className="font-serif italic text-2xl text-accent shrink-0 w-10">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-serif text-lg md:text-2xl tracking-tight leading-snug">
                  {achievement}
                </p>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-line" />
        </div>
      </section>

      {/* ─── İletişim / Footer ─── */}
      <footer id="iletisim" className="scroll-mt-24 relative border-t border-line overflow-hidden">
        <div className="absolute -bottom-56 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-accent/10 blur-[180px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-36">
          <Reveal>
            <SectionLabel index="05" title="İletişim" />
          </Reveal>

          <Reveal delay={0.1}>
            <a href={`mailto:${cvData.personal.email}`} className="group block mt-14">
              <span className="font-serif text-[clamp(2.4rem,7vw,6rem)] leading-[1.05] tracking-tight">
                Birlikte <em className="italic text-accent">çalışalım</em>
                <span className="inline-block ml-4 text-accent transition-transform duration-500 group-hover:translate-x-3 group-hover:-translate-y-3">
                  ↗
                </span>
              </span>
            </a>
            <p className="mt-6 text-muted max-w-md leading-relaxed">
              Yeni projeler, iş birlikleri ve danışmanlık talepleri için iletişime
              geçebilirsiniz.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-20 grid sm:grid-cols-2 md:grid-cols-4 gap-8 font-mono text-xs tracking-wider">
              <div>
                <p className="text-muted uppercase tracking-[0.2em] mb-3">E-posta</p>
                <a
                  href={`mailto:${cvData.personal.email}`}
                  className="link-underline break-all"
                >
                  {cvData.personal.email}
                </a>
              </div>
              <div>
                <p className="text-muted uppercase tracking-[0.2em] mb-3">Telefon</p>
                <span>{cvData.personal.phone}</span>
              </div>
              <div>
                <p className="text-muted uppercase tracking-[0.2em] mb-3">GitHub</p>
                <a
                  href={cvData.personal.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  @emreatalayy ↗
                </a>
              </div>
              <div>
                <p className="text-muted uppercase tracking-[0.2em] mb-3">LinkedIn</p>
                <a
                  href={cvData.personal.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  /in/emreatalayy ↗
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="relative border-t border-line">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-muted">
            <span>© 2026 Yunus Emre Atalay — Tüm hakları saklıdır</span>
            <span>İstanbul, Türkiye</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

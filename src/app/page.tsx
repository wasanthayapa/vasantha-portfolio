// app/page.tsx
import Link from "next/link";
import { caseStudies, competencies } from "@/lib/data";

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
    {children}
  </span>
);

const SectionTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    {sub ? <p className="mt-2 text-sm text-white/70 max-w-3xl">{sub}</p> : null}
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#070b14] to-[#0b1220] text-white">
      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* Top Nav */}
        <div className="flex items-center justify-between gap-4">
          <div className="font-semibold tracking-wide">Vasantha Yapa</div>
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <a href="#focus" className="hover:text-white">Focus</a>
            <a href="#case-studies" className="hover:text-white">Case Studies</a>
            <a href="#competencies" className="hover:text-white">Competencies</a>
            <a href="#contact" className="hover:text-white">Contact</a>
            <Link
              href="/cse"
              className="rounded-full border border-[#6ea8fe]/30 bg-[#6ea8fe]/10 px-3 py-0.5 text-[#6ea8fe] hover:bg-[#6ea8fe]/20"
            >
              CSE Analyzer
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <Pill>Senior Java Full-Stack</Pill>
              <Pill>Microservices Architect</Pill>
              <Pill>Azure DevOps • Kubernetes</Pill>
              <Pill>OAuth2/JWT • Auth0</Pill>
            </div>

            <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
              Cloud-Native Java Architect building secure, scalable SaaS platforms.
            </h1>

            <p className="max-w-3xl text-white/70 leading-relaxed">
              9+ years delivering enterprise systems across workforce, insurance, and finance domains.
              I design multi-tenant microservices, API gateways, distributed scheduling, and CI/CD pipelines
              for reliable cloud deployments using Spring Boot, PostgreSQL, MongoDB, Docker, and Kubernetes.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {/* Put your PDF in /public/resume.pdf */}
              <a
                href="/resume.pdf"
                className="rounded-xl border border-white/10 bg-[#6ea8fe]/20 px-4 py-2 text-sm font-semibold hover:bg-[#6ea8fe]/30"
              >
                Download Resume
              </a>
              <a
                href="https://www.linkedin.com/in/vasanthayapa/"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                LinkedIn
              </a>
              <a
                href="#contact"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                Contact
              </a>
            </div>
          </div>
        </section>

        {/* Focus */}
        <section id="focus" className="mt-12">
          <SectionTitle
            title="Architecture Focus"
            sub="High-impact areas I consistently deliver: security, distributed systems, multi-tenant SaaS, and cloud delivery."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Microservices & Multi-Tenant SaaS",
                desc: "Designing modular services and shared platform capabilities (user, roster, time tracking, forecasting) with clean boundaries and scalable patterns.",
              },
              {
                title: "API Gateway & Security",
                desc: "Centralized error handling, policy enforcement, and JWT/OAuth2 authentication flows using Auth0 and secure integration practices.",
              },
              {
                title: "Distributed Scheduling & Reliability",
                desc: "Single-instance job execution across pods using distributed locks (e.g., ShedLock + Mongo provider), improving operational stability.",
              },
              {
                title: "Data Modeling & Performance",
                desc: "PostgreSQL/MySQL schema design, MongoDB modeling, indexing strategy, query tuning, and performance optimization for production workloads.",
              },
              {
                title: "Cloud Delivery (CI/CD)",
                desc: "Azure DevOps pipelines for container build, test, and deployment using Docker and Kubernetes; quality gates and release hygiene.",
              },
              {
                title: "Engineering Leadership",
                desc: "Code reviews, mentoring, architectural direction, and delivery alignment with business outcomes in Agile teams.",
              },
            ].map((x) => (
              <div key={x.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-semibold">{x.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{x.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Case Studies */}
        <section id="case-studies" className="mt-12">
          <SectionTitle
            title="Selected Case Studies"
            sub="Written like architecture notes: problem → approach → outcomes. These can be based on real work without exposing confidential code."
          />

          <div className="grid gap-4">
            {caseStudies.map((c) => (
              <article key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map((t) => <Pill key={t}>{t}</Pill>)}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Problem</div>
                    <p className="mt-1 text-sm text-white/70 leading-relaxed">{c.problem}</p>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Approach</div>
                    <p className="mt-1 text-sm text-white/70 leading-relaxed">{c.approach}</p>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/50">Outcome</div>
                    <p className="mt-1 text-sm text-white/70 leading-relaxed">{c.outcome}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Competencies */}
        <section id="competencies" className="mt-12">
          <SectionTitle title="Core Competencies" sub="Grouped like an architect profile for recruiter scanning." />

          <div className="grid gap-4 md:grid-cols-2">
            {competencies.map((group) => (
              <div key={group.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-semibold">{group.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  {group.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/40" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
          <SectionTitle title="Contact" sub="Open to Senior/Lead roles: Backend, Microservices, Platform, Cloud-Native Engineering." />
          <div className="grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-white/60">Email</div>
              <a className="mt-2 block font-semibold hover:underline" href="mailto:vasanthabyapa@gmail.com">
                vasanthabyapa@gmail.com
              </a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-white/60">Phone</div>
              <a className="mt-2 block font-semibold hover:underline" href="tel:+94710621172">
                +94 710 621 172
              </a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-white/60">LinkedIn</div>
              <a
                className="mt-2 block font-semibold hover:underline"
                href="https://www.linkedin.com/in/vasanthayapa/"
                target="_blank"
                rel="noreferrer"
              >
                linkedin.com/in/vasanthayapa
              </a>
            </div>
          </div>

          <p className="mt-6 text-xs text-white/50">
            © {new Date().getFullYear()} Vasantha Bandara Yapa • Built with Next.js
          </p>
        </section>
      </div>
    </main>
  );
}
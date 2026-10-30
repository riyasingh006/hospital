import { Quote, Star } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionTitle } from "./why-choose";

const TESTIMONIALS = [
  {
    quote:
      "Jeevan Sahay helped me find the nearest hospital during an emergency. The real-time bed availability feature is a lifesaver.",
    name: "Anjali Sharma",
    place: "Delhi",
    tone: "bg-[#EAF3FF] text-[#0B3D91]",
  },
  {
    quote:
      "Very easy to use and reliable. I found the right specialist for my father within minutes.",
    name: "Ravi Kumar",
    place: "Noida, UP",
    tone: "bg-[#EAF7E8] text-[#2E9429]",
  },
  {
    quote:
      "A wonderful initiative! This platform makes healthcare accessible and stress-free.",
    name: "Neha Verma",
    place: "Jaipur, Rajasthan",
    tone: "bg-[#FFF0DF] text-[#C05F00]",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("");
}

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-28 bg-white py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionTitle>What People Say</SectionTitle>
        </Reveal>

        <div className="mt-9 grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="flex h-full min-h-[140px] w-full flex-col rounded-[9px] border border-[#EDF1F7] bg-white p-5 shadow-[0_12px_30px_-20px_rgba(6,31,85,0.3)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_38px_-20px_rgba(6,31,85,0.4)]">
                <Quote
                  className="h-8 w-8 text-[#D5DEEA]"
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden
                />
                <blockquote className="mt-2.5 flex-1 text-[12.5px] leading-[1.65] text-[#33415C]">
                  â€œ{t.quote}â€
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-[#F1F4F9] pt-3.5">
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${t.tone}`}
                  >
                    {initials(t.name)}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[13px] font-bold text-[#061F55]">
                      {t.name}
                    </span>
                    <span className="block truncate text-[11.5px] font-medium text-[#7B8BA5]">
                      {t.place}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-0.5" aria-label="Rated 5 out of 5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className="h-3.5 w-3.5 text-[#F57C00]"
                        fill="currentColor"
                        strokeWidth={0}
                        aria-hidden
                      />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { MapPin, ShieldPlus, UserRoundPlus } from "lucide-react";
import { Reveal } from "./reveal";

export function CtaBanner() {
  return (
    <section className="bg-white pb-16">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[14px] bg-[#062B73] px-6 py-7 sm:px-10 lg:h-[105px] lg:py-0">
            {/* watermarks */}
            <ShieldPlus
              aria-hidden
              className="pointer-events-none absolute -left-4 top-1/2 h-28 w-28 -translate-y-1/2 text-white/5"
            />
            <svg
              aria-hidden
              viewBox="0 0 200 120"
              className="pointer-events-none absolute -right-3 top-1/2 hidden h-[130%] -translate-y-1/2 text-white/[0.06] lg:block"
              fill="none"
            >
              <path
                d="M20 78c22-30 52-44 84-40m-24 58c26 4 54-6 72-26M46 96c18 8 42 8 60-2"
                stroke="currentColor"
                strokeWidth="14"
                strokeLinecap="round"
              />
            </svg>

            <div className="relative flex flex-col items-start justify-between gap-4 lg:h-full lg:flex-row lg:items-center">
              <div>
                <h2 className="text-[17.5px] font-bold text-white lg:text-lg">
                  Healthcare navigation, made simpler.
                </h2>
                <p className="mt-1 max-w-xl text-[12.5px] leading-[1.55] text-white/75">
                  From finding the right specialist to locating a suitable
                  hospital, Jeevan Sahay helps you make informed healthcare
                  decisions.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto">
                <Link
                  href="/hospitals"
                  className="inline-flex h-[38px] min-w-[150px] items-center justify-center gap-1.5 rounded-md bg-white px-4 text-[13px] font-bold text-[#062B73] transition-all duration-150 hover:-translate-y-px hover:shadow-lg"
                >
                  <MapPin className="h-4 w-4" aria-hidden /> Find Hospitals Now
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-[38px] min-w-[150px] items-center justify-center gap-1.5 rounded-md border border-white/45 bg-transparent px-4 text-[13px] font-bold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/10"
                >
                  <UserRoundPlus className="h-4 w-4" aria-hidden /> Create an Account
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { PremiumSkeleton } from '@/components/ui/premium-skeleton'
import { cn } from '@/lib/utils'

type PageLoadingVariant =
  | 'analytics'
  | 'community'
  | 'default'
  | 'profile'
  | 'settings'

type PageLoadingShellProps = {
  className?: string
  label?: string
  variant?: PageLoadingVariant
}

function DefaultShell({ className }: { className?: string }) {
  return (
    <>
      <Navbar />
      <main
        className={cn(
          'mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-24 sm:px-6',
          className
        )}
      >
        <section className="panel space-y-6 p-6 sm:p-8" data-motion-disabled>
          <PremiumSkeleton className="h-4 w-28 rounded-full" />
          <PremiumSkeleton className="h-12 w-72 max-w-full" />
          <PremiumSkeleton className="h-5 w-full max-w-2xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            <PremiumSkeleton className="h-28" />
            <PremiumSkeleton className="h-28" />
            <PremiumSkeleton className="h-28" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function ProfileShell() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-16 pt-24 sm:px-6">
        <section
          className="overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#070a08_0%,#0a0f0b_46%,#050705_100%)] px-5 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_32px_90px_rgba(0,0,0,0.22)] sm:px-10 sm:py-12"
          data-motion-disabled
        >
          <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <section className="flex flex-col gap-8 sm:flex-row sm:items-end">
              <PremiumSkeleton className="h-32 w-32 rounded-full" />
              <div className="min-w-0 flex-1 space-y-4">
                <PremiumSkeleton className="h-4 w-28 rounded-full" />
                <PremiumSkeleton className="h-20 w-full max-w-xl" />
                <PremiumSkeleton className="h-5 w-80 max-w-full" />
                <PremiumSkeleton className="h-4 w-full max-w-2xl" />
              </div>
            </section>
            <aside className="space-y-4 pt-4">
              <PremiumSkeleton className="h-4 w-32 rounded-full" />
              <PremiumSkeleton className="h-16 w-full" />
              <PremiumSkeleton className="h-3 w-full max-w-[12rem]" />
              <PremiumSkeleton className="h-2 w-full rounded-full" />
            </aside>
          </header>

          <ul className="mt-14 grid gap-px rounded-[1.4rem] bg-white/[0.04] p-px sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className="rounded-[1.35rem] bg-black/15 p-5">
                <PremiumSkeleton className="h-4 w-20 rounded-full" />
                <PremiumSkeleton className="mt-5 h-11 w-24" />
                <PremiumSkeleton className="mt-3 h-3 w-full" />
              </li>
            ))}
          </ul>

          <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <article className="space-y-4">
              <PremiumSkeleton className="h-4 w-24 rounded-full" />
              {Array.from({ length: 4 }).map((_, index) => (
                <PremiumSkeleton key={index} className="h-16 w-full" />
              ))}
            </article>
            <article className="space-y-4">
              <PremiumSkeleton className="h-4 w-28 rounded-full" />
              <PremiumSkeleton className="h-20 w-full" />
              <PremiumSkeleton className="h-12 w-full" />
              <PremiumSkeleton className="h-12 w-full" />
            </article>
          </section>
        </section>
      </main>
      <Footer />
    </>
  )
}

function SettingsShell() {
  return (
    <>
      <Navbar />
      <main className="w-full flex-1 px-4 pb-16 pt-24 sm:px-6">
        <form className="mx-auto w-full max-w-5xl" data-motion-disabled>
          <section className="overflow-hidden rounded-[2rem] bg-[#090d0a]/90 shadow-[0_30px_100px_rgba(0,0,0,0.34)] ring-1 ring-white/[0.055] backdrop-blur-xl">
            <header className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-7">
              <div className="space-y-3">
                <PremiumSkeleton className="h-4 w-24 rounded-full" />
                <PremiumSkeleton className="h-10 w-40" />
              </div>
              <PremiumSkeleton className="h-8 w-40 rounded-full" />
            </header>

            <section className="grid gap-7 border-t border-white/[0.045] px-5 py-7 sm:px-7 lg:grid-cols-[13rem_minmax(0,1fr)]">
              <figure className="m-0 space-y-4">
                <PremiumSkeleton className="h-[104px] w-[104px] rounded-full" />
                <PremiumSkeleton className="h-4 w-24 rounded-full" />
                <PremiumSkeleton className="h-3 w-32 rounded-full" />
                <PremiumSkeleton className="h-2 w-full rounded-full" />
              </figure>

              <fieldset className="min-w-0">
                <PremiumSkeleton className="h-4 w-20 rounded-full" />
                <ul className="mt-4 space-y-4">
                  <li className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,auto)] sm:items-center">
                    <div className="space-y-2">
                      <PremiumSkeleton className="h-4 w-28 rounded-full" />
                      <PremiumSkeleton className="h-3 w-48 rounded-full" />
                    </div>
                    <PremiumSkeleton className="h-11 w-full sm:w-[22rem]" />
                  </li>
                  <li className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,auto)] sm:items-center">
                    <div className="space-y-2">
                      <PremiumSkeleton className="h-4 w-20 rounded-full" />
                      <PremiumSkeleton className="h-3 w-56 rounded-full" />
                    </div>
                    <PremiumSkeleton className="h-11 w-full sm:w-[22rem]" />
                  </li>
                </ul>
              </fieldset>
            </section>

            <section className="border-t border-white/[0.045] px-5 py-6 sm:px-7">
              <PremiumSkeleton className="h-4 w-40 rounded-full" />
              <ul className="mt-4 divide-y divide-white/[0.045]">
                {Array.from({ length: 6 }).map((_, index) => (
                  <li
                    key={index}
                    className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,auto)] sm:items-center"
                  >
                    <div className="space-y-2">
                      <PremiumSkeleton className="h-4 w-28 rounded-full" />
                      <PremiumSkeleton className="h-3 w-52 rounded-full" />
                    </div>
                    <PremiumSkeleton className="h-11 w-full sm:w-[16rem]" />
                  </li>
                ))}
              </ul>
            </section>
          </section>
        </form>
      </main>
      <Footer />
    </>
  )
}

function AnalyticsShell() {
  return (
    <>
      <Navbar />
      <main className="section-shell mt-10 flex flex-1 flex-col gap-8 pb-28 pt-24 sm:pt-28">
        <section
          className="panel space-y-6 px-6 py-7 sm:px-8 sm:py-9 lg:px-10"
          data-motion-disabled
        >
          <div className="flex flex-wrap gap-3">
            <PremiumSkeleton className="h-8 w-40 rounded-full" />
            <PremiumSkeleton className="h-8 w-32 rounded-full" />
            <PremiumSkeleton className="h-8 w-28 rounded-full" />
          </div>
          <PremiumSkeleton className="h-16 w-full max-w-4xl" />
          <PremiumSkeleton className="h-5 w-full max-w-3xl" />
          <PremiumSkeleton className="h-5 w-full max-w-2xl" />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <PremiumSkeleton className="h-48 w-full rounded-[1.7rem]" />
            <PremiumSkeleton className="h-48 w-full rounded-[1.7rem]" />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3" data-motion-disabled>
          {Array.from({ length: 6 }).map((_, index) => (
            <PremiumSkeleton
              key={index}
              className="h-56 w-full rounded-[1.7rem]"
            />
          ))}
        </section>
      </main>
      <Footer />
    </>
  )
}

function CommunityShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#08090b] text-white">
      <aside
        className="flex w-72 flex-col overflow-hidden border-r border-white/5 bg-[#111317] p-4"
        data-motion-disabled
      >
        <PremiumSkeleton className="h-28 w-full rounded-[1.35rem]" />
        <PremiumSkeleton className="mt-5 h-10 w-full rounded-[1rem]" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <PremiumSkeleton
              key={index}
              className="h-11 w-full rounded-[1rem]"
            />
          ))}
        </div>
        <PremiumSkeleton className="mt-auto h-8 w-full rounded-full" />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col" data-motion-disabled>
        <header className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <PremiumSkeleton className="h-5 w-32 rounded-full" />
              <PremiumSkeleton className="h-4 w-56 rounded-full" />
            </div>
            <div className="flex gap-2">
              <PremiumSkeleton className="h-8 w-24 rounded-xl" />
              <PremiumSkeleton className="h-8 w-10 rounded-xl" />
              <PremiumSkeleton className="h-8 w-10 rounded-xl" />
            </div>
          </div>
        </header>

        <section className="flex min-h-0 flex-1">
          <div className="flex-1 space-y-4 overflow-hidden px-6 py-5">
            <PremiumSkeleton className="h-36 w-full rounded-[1.6rem]" />
            {Array.from({ length: 6 }).map((_, index) => (
              <PremiumSkeleton
                key={index}
                className="h-24 w-full rounded-[1.35rem]"
              />
            ))}
          </div>
          <aside className="hidden w-80 border-l border-white/5 p-5 xl:block">
            <PremiumSkeleton className="h-28 w-full rounded-[1.4rem]" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <PremiumSkeleton
                  key={index}
                  className="h-16 w-full rounded-[1.15rem]"
                />
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export function PageLoadingShell({
  className,
  label = 'Loading',
  variant = 'default',
}: PageLoadingShellProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col"
    >
      <span className="sr-only">{label}</span>
      {variant === 'profile' ? (
        <ProfileShell />
      ) : variant === 'settings' ? (
        <SettingsShell />
      ) : variant === 'analytics' ? (
        <AnalyticsShell />
      ) : variant === 'community' ? (
        <CommunityShell />
      ) : (
        <DefaultShell className={className} />
      )}
    </div>
  )
}

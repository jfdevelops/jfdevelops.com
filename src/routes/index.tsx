import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ContactForm } from '#/components/ContactForm'
import { getPackages } from '#/docs/registry'

export const Route = createFileRoute('/')({
  loader: () => getPackages(),
  component: Home,
})

function Home() {
  const packages = Route.useLoaderData()

  const packageCountQuery = useQuery({
    queryKey: ['package-count'],
    queryFn: async () => packages.length,
    initialData: packages.length,
  })

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(42,42,42,0.1),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(58,58,58,0.08),transparent_66%)]" />
        <p className="island-kicker mb-3">JF Develops</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Software consulting and package docs.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          JF Develops helps teams ship reliable software. This site is the home
          for documentation across all published packages.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/docs"
            className="rounded-full border border-[var(--lagoon-deep)] bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold !text-[var(--foam)] no-underline transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Browse docs
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="island-shell feature-card rise-in rounded-2xl p-5">
          <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
            Package docs
          </h2>
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
            {packageCountQuery.data} package
            {packageCountQuery.data === 1 ? '' : 's'} documented so far.
          </p>
        </article>
        <article
          className="island-shell feature-card rise-in rounded-2xl p-5"
          style={{ animationDelay: '170ms' }}
        >
          <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
            Consulting
          </h2>
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
            Architecture, implementation, and delivery support for product teams.
          </p>
        </article>
        <article
          className="island-shell feature-card rise-in rounded-2xl p-5"
          style={{ animationDelay: '260ms' }}
        >
          <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
            Simple by design
          </h2>
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
            Each package ships a <code>docs</code> folder that feeds this site.
          </p>
        </article>
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Contact</p>
        <h2 className="display-title mb-4 text-2xl font-bold text-[var(--sea-ink)]">
          Start a conversation
        </h2>
        <ContactForm />
      </section>
    </main>
  )
}

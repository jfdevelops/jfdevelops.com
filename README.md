Welcome to your new TanStack Start app! 

# Getting Started

To run this application:

```bash
npm install
npm run dev
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
npm run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `npm install @tailwindcss/vite tailwindcss -D`


## Deploy to Cloudflare Workers

This project uses the Cloudflare Vite plugin (configured in `vite.config.ts`) and `wrangler.jsonc`:

1. Install Wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Deploy: `npx wrangler deploy`

For production env vars, run `wrangler secret put MY_VAR` for each secret listed in `.env.example`. Public (non-secret) vars go in `wrangler.jsonc` under `vars`.

KV, D1, R2, and Durable Object bindings are configured in `wrangler.jsonc` — see https://developers.cloudflare.com/workers/wrangler/configuration/.



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Library documentation

The website consumes each library's generated documentation at a pinned Git commit. Register the
repository, full commit SHA, and site description in `docs.sources.json`. Update the pin to publish
a later library docs revision.

Run `pnpm docs:generate` **in this repository**. It fetches an isolated checkout under `.docs-cache/`,
installs its locked dependencies, then runs its available `docs:generate`/`generate-docs` and
`docs:check`/`check:docs` scripts. For Markdown-only repositories, the site's pinned
`@jfdevelops/docs` tool generates navigation and checks the content. Optional source `docs` settings
select the documented `package` directory and display `name` in those repositories.
The generated schema-v2 `docs/docs.json` supplies library identity, frameworks, default versions,
version statuses, and page navigation. Per-directory generated `meta.json` files supply sidebar
order, including the TypeDoc reference. No website-owned package list or per-version registration is
needed. An invalid pin, failed generator/checker, or unsupported manifest schema fails the build.

The site copies only public version directories into `.docs-content/` and compiles them with
Fumadocs MDX. API reference pages load as separate chunks; docs do not fetch GitHub at request time.
Generation runs before development, builds, tests, and typechecking. Validated output is cached by
commit locally; the library checker still runs on subsequent preparations. Generated content and
copied assets are ignored by Git. The `packages/` placeholder docs are no longer a content source.

Routes:

- `/docs` lists libraries.
- `/docs/<library>` redirects to its default framework and version.
- `/docs/<library>/<framework>` redirects to that framework's default version.
- `/docs/<library>/<framework>/<version>` shows the first page in generated navigation.
- `/docs/<library>/<framework>/<version>/<page>` shows a specific page.

The sidebar places Framework above Version. Switching retains the page and a valid heading anchor
where possible; otherwise it opens the target version's first page with an explanatory notice.
Older, legacy, and unreleased versions display status banners from the manifest. Companion packages
are ordinary library-authored plugin/devtools pages, with no independent selectors.

TypeScript and JavaScript examples get build-time Twoslash hover information automatically. The
current version resolves against the pinned library source and its compiler aliases. Historical
versions use isolated type environments with the manifest's exact published core version and the
companion versions pinned in their docs. Inferred types are cached by commit and framework/version;
the TypeScript compiler is never shipped to the browser.

Partial snippets are not treated as compiler tests. Unresolved identifiers do not receive misleading
`any` tooltips. A library author can add `no-twoslash` to a fence's metadata to opt out for a particular
example; shell commands and non-code prose are unaffected. The website only annotates its generated
copy and does not change library Markdown.
Library authors maintain Markdown under `docs/framework/<framework>/v<major>/`. They run their
repository's docs generation and checking scripts where available. This website follows the
schema-v2 contract and does not modify library files outside its own ignored cache.

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).

## File and import conventions

- Authored source filenames use lowercase kebab-case, such as `contact-form.tsx` and `render-markdown.ts`.
- Use `@/` for imports rooted at `src`, or relative imports. The former `#/` package alias has been removed.
- TanStack generates `src/route-tree.gen.ts`; its output path is configured in `vite.config.ts` and `tsr.config.json`. Do not edit generated route contents manually.
- Router syntax filenames (`__root.tsx`, `$package`, and `$.tsx`) and framework-generated Convex filenames retain their required spellings. Conventional discovery files such as `AGENTS.md` and `README.md` also retain their names.
- Convex module paths cannot contain hyphens. Use lowercase single-word filenames and folders there: `actions/contact.ts`, `utils/subject.ts`, and `utils/renderer.tsx`.
- Run `npm run typecheck`, `npm run test`, and `npm run build` to validate changes.

### Contact action rollout

The contact action is now `api.actions.contact.submit` (module `actions/contact`). Deploy the renamed Convex backend before releasing the corresponding frontend. This source cleanup does not deploy the backend.

import { createResourceLinks } from '@/routes/(home)/-sections/definition';
import { Link } from '@tanstack/react-router';
import { HeaderLink } from './link';
import ThemeToggle from '../ThemeToggle';
import { RouterNavLink } from '../ui/nav-link';
import { PageWrap } from '../ui/page-wrap';

const sectionLinks = createResourceLinks({
  services: {
    label: 'Services',
  hash: 'services',
  },
  'case-studies': {
    label: 'Work',
  hash: 'case-studies',
  },
  process: {
    label: 'Process',
  hash: 'process',
  },
  about: {
    label: 'About',
  hash: 'about',
  },
  faq: {
    label: 'FAQ',
  hash: 'faq',
  },
});

export default function Header() {
  return (
    <header className='sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg'>
      <PageWrap
        as='nav'
        className='flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4'
      >
        <h2 className='m-0 shrink-0 text-base font-semibold tracking-tight'>
          <Link
            to='/'
            className='inline-flex items-center gap-3 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm text-(--sea-ink) no-underline shadow-[0_8px_24px_rgba(20,20,20,0.08)] sm:px-4 sm:py-2'
          >
            <img
              src='/logo.png'
              alt='JF Develops'
              className='h-8 w-8 object-contain'
            />
            <span>JF Develops</span>
          </Link>
        </h2>

        <div className='order-3 hidden w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-0 sm:flex sm:w-auto sm:flex-nowrap sm:pb-0'>
          {sectionLinks.map(({ href, label }) => (
            <HeaderLink key={href.full} hash={href.hash} to={href.given}>
              {label}
            </HeaderLink>
          ))}
          <RouterNavLink to='/docs'>Docs</RouterNavLink>
        </div>

        <div className='ml-auto flex items-center gap-1.5 sm:gap-2'>
          <HeaderLink
            to='/'
            className='hidden min-h-11 items-center rounded-full border border-(--lagoon-deep) bg-(--lagoon-deep) px-4 py-2 text-sm font-semibold text-(--foam)! no-underline transition hover:-translate-y-0.5 hover:opacity-90 sm:inline-flex'
            hash='contact'
          >
            Get in touch
          </HeaderLink>
          <ThemeToggle />
        </div>
      </PageWrap>
    </header>
  );
}

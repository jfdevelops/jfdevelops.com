import { createResourceConfig } from './definition'
import { CaseStudies } from './case-studies'
import { About } from './about'
import { Contact } from './contact'
import { FAQ } from './faq'
import { Process } from './process'
import { Services } from './services'
import { Hero } from './hero'

export const homeResources = createResourceConfig({
  'case-studies': {
    component: <CaseStudies />,
  },
  about: {
    component: <About />,
  },
  contact: {
    component: <Contact />,
  },
  faq: {
    component: <FAQ />,
  },
  process: {
    component: <Process />,
  },
  services: {
    component: <Services />,
  },
  hero: {
    component: <Hero />,
  },
})

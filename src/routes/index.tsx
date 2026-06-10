import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '#/components/sections/Hero'
import { Services } from '#/components/sections/Services'
import { CaseStudies } from '#/components/sections/CaseStudies'
import { Process } from '#/components/sections/Process'
import { About } from '#/components/sections/About'
import { FAQ } from '#/components/sections/FAQ'
import { Contact } from '#/components/sections/Contact'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="page-wrap space-y-16 px-4 pb-8 pt-14 sm:space-y-24">
      <Hero />
      <Services />
      <CaseStudies />
      <Process />
      <About />
      <FAQ />
      <Contact />
    </main>
  )
}

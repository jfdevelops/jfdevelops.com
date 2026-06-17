import { createFileRoute } from '@tanstack/react-router'
import { PageWrap } from '#/components/ui/page-wrap'
import { homeResources } from './-sections/config'

const Hero = homeResources.getComponent({ resource: 'hero' })
const Services = homeResources.getComponent({ resource: 'services' })
const CaseStudies = homeResources.getComponent({ resource: 'case-studies' })
const Process = homeResources.getComponent({ resource: 'process' })
const About = homeResources.getComponent({ resource: 'about' })
const FAQ = homeResources.getComponent({ resource: 'faq' })
const Contact = homeResources.getComponent({ resource: 'contact' })

export const Route = createFileRoute('/(home)/')({
  component: Home,
})

function Home() {
  return (
    <PageWrap as="main" className="space-y-16 px-4 pb-8 pt-14 sm:space-y-24">
      {Hero}
      {Services}
      {CaseStudies}
      {Process}
      {About}
      {FAQ}
      {Contact}
    </PageWrap>
  )
}

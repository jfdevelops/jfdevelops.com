import { defineResourceLayout } from '@jfdevelops/react-layout'
import { reactNode } from '@jfdevelops/react-layout-adapter-zod'
import type { ComponentPropsWithRef } from 'react'
import { z } from 'zod'
import { createPolymorphicComponent } from '@/components/polymorphic-component'
import { Kicker } from '@/components/ui/kicker'
import { cn } from '@/lib/utils'

export const { createResourceConfig, createResourceLayout, createResourceLinks } =
  defineResourceLayout({
    resources: ['about', 'case-studies', 'contact', 'faq', 'hero', 'process', 'services'],
    options: {
      sectionName: reactNode(),
      title: reactNode(),
      description: reactNode().optional(),
      id: z.string(),
    },
    layout: {
      composables: (create) => ({
        Layout: create({
          name: ({ capitalize, resource }) => `${capitalize(resource)}Section`,
          wrapWith: Layout,
        }),
        SectionHeaderWrapper: create({
          name: ({ capitalize, resource }) => `${capitalize(resource)}SectionHeaderWrapper`,
          wrapWith: SectionHeaderWrapper,
        }),
        SectionName: create({
          name: ({ capitalize, resource }) => `${capitalize(resource)}SectionName`,
          wrapWith: SectionName,
        }),
        SectionTitle: create({
          name: ({ capitalize, resource }) => `${capitalize(resource)}SectionTitle`,
          wrapWith: SectionTitle,
        }),
        SectionDescription: create({
          name: ({ capitalize, resource }) => `${capitalize(resource)}SectionDescription`,
          wrapWith: SectionDescription,
        }),
      }),
      props: {
        include: {
          description: true,
          sectionName: true,
          title: true,
          id: true,
        },
        custom: {
          children: 'required',
          className: z.string().optional(),
        },
      },
      render: ({ sectionName, title, description, id, children, className }, { composables }) => {
        return (
          <composables.Layout id={id}>
            <composables.SectionHeaderWrapper>
              <composables.SectionName>{sectionName}</composables.SectionName>
              <composables.SectionTitle>{title}</composables.SectionTitle>
              {description && (
                <composables.SectionDescription>{description}</composables.SectionDescription>
              )}
            </composables.SectionHeaderWrapper>
            <div className={className}>{children}</div>
          </composables.Layout>
        )
      },
    },
  })

function Layout({ className, ...props }: ComponentPropsWithRef<'section'>) {
  return <section className={cn('scroll-mt-24', className)} {...props} />
}

const SectionHeaderWrapper = createPolymorphicComponent(
  'div',
  ({ className, ...props }, { Component, createProps }) => (
    <Component
      {...createProps(props, {
        className: cn('mb-6', className),
      })}
    />
  ),
)({ name: 'SectionHeaderWrapper' })

function SectionName({ className, ...props }: ComponentPropsWithRef<'p'>) {
  return <Kicker className={cn('mb-2', className)} {...props} />
}

function SectionTitle({ className, ...props }: ComponentPropsWithRef<'h2'>) {
  return (
    <h2
      className={cn(
        'font-display mb-3 max-w-2xl text-3xl font-medium tracking-tight text-sea-ink sm:text-4xl',
        className,
      )}
      {...props}
    />
  )
}

function SectionDescription({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div className={cn('mb-6 text-sm leading-relaxed text-sea-ink-soft', className)} {...props} />
  )
}

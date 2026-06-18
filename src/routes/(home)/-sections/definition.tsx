import { createPolymorphicComponent } from '@/components/polymorphic-component';
import { Kicker } from '@/components/ui/kicker';
import { cn } from '@/lib/utils';
import { createProp, defineResourceLayout } from '@jfdevelops/react-layout';
import type { ComponentPropsWithRef } from 'react';

export const {
  createResourceConfig,
  createResourceLayout,
  createResourceLinks,
} = defineResourceLayout({
  resources: [
    'about',
    'case-studies',
    'contact',
    'faq',
    'hero',
    'process',
    'services',
  ],
  options: {
    sectionName: createProp.component({ type: 'ReactNode' }),
    title: createProp.component({ type: 'ReactNode' }),
    description: createProp.component({ type: 'ReactNode' }).optional(),
    id: createProp.string(),
  },
  layout: {
    composables: (create) => ({
      Layout: create({
        name: ({ capitalize, resource }) => `${capitalize(resource)}Section`,
        wrapWith: Layout,
      }),
      SectionHeaderWrapper: create({
        name: ({ capitalize, resource }) =>
          `${capitalize(resource)}SectionHeaderWrapper`,
        wrapWith: SectionHeaderWrapper,
      }),
      SectionName: create({
        name: ({ capitalize, resource }) =>
          `${capitalize(resource)}SectionName`,
        wrapWith: SectionName,
      }),
      SectionTitle: create({
        name: ({ capitalize, resource }) =>
          `${capitalize(resource)}SectionTitle`,
        wrapWith: SectionTitle,
      }),
      SectionDescription: create({
        name: ({ capitalize, resource }) =>
          `${capitalize(resource)}SectionDescription`,
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
        children: createProp.component({ type: 'ReactNode' }),
        className: createProp.string().optional(),
      },
    },
    render: (
      { sectionName, title, description, id, children, className },
      { composables },
    ) => {
      return (
        <composables.Layout id={id}>
          <composables.SectionHeaderWrapper>
            <composables.SectionName>{sectionName}</composables.SectionName>
            <composables.SectionTitle>{title}</composables.SectionTitle>
            {description && (
              <composables.SectionDescription>
                {description}
              </composables.SectionDescription>
            )}
          </composables.SectionHeaderWrapper>
          <div className={className}>{children}</div>
        </composables.Layout>
      );
    },
  },
});

function Layout({ className, ...props }: ComponentPropsWithRef<'section'>) {
  return <section className={cn('scroll-mt-24', className)} {...props} />;
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
)({name: 'SectionHeaderWrapper'});


function SectionName({ className, ...props }: ComponentPropsWithRef<'p'>) {
  return <Kicker className={cn('mb-2', className)} {...props} />;
}

function SectionTitle({ className, ...props }: ComponentPropsWithRef<'h2'>) {
  return (
    <h2
      className={cn(
        'font-display mb-2 text-2xl font-bold text-(--sea-ink) sm:text-3xl',
        className,
      )}
      {...props}
    />
  );
}

function SectionDescription({
  className,
  ...props
}: ComponentPropsWithRef<'p'>) {
  return (
    <p
      className={cn(
        'mb-6 text-sm leading-relaxed text-(--sea-ink-soft)',
        className,
      )}
      {...props}
    />
  );
}

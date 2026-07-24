import { cn } from '@/lib/utils'
import type { ComponentPropsWithRef } from 'react'
import {
  Body as EmailBody,
  Container as EmailContainer,
  Hr as EmailDivider,
  Head as EmailHead,
  Html as EmailHtml,
  Img as EmailImage,
  Preview as EmailPreview,
  Tailwind as EmailTailwind,
  Text as EmailText,
  pixelBasedPreset,
} from 'react-email'

export function Root(props: ComponentPropsWithRef<typeof EmailHtml>) {
  return <EmailHtml {...props} />;
}

export function Head(props: ComponentPropsWithRef<typeof EmailHead>) {
  return <EmailHead {...props} />;
}

export function Preview(props: ComponentPropsWithRef<typeof EmailPreview>) {
  return <EmailPreview {...props} />;
}

export function Theme({
  config,
  ...props
}: ComponentPropsWithRef<typeof EmailTailwind>) {
  return (
    <EmailTailwind
      config={config ?? { presets: [pixelBasedPreset] }}
      {...props}
    />
  );
}

export function Body({
  className,
  ...props
}: ComponentPropsWithRef<typeof EmailBody>) {
  return (
    <EmailBody
      className={cn(
        'm-0 bg-[#efece6] px-4 py-8 font-sans text-[#2a2a2a]',
        className,
      )}
      {...props}
    />
  );
}

export function Container({
  className,
  ...props
}: ComponentPropsWithRef<typeof EmailContainer>) {
  return (
    <EmailContainer
      className={cn('mx-auto max-w-140 rounded-2xl bg-white p-8', className)}
      {...props}
    />
  );
}

export function Logo({
  className,
  alt = 'JF Develops',
  width = 160,
  ...props
}: Omit<ComponentPropsWithRef<typeof EmailImage>, 'src'>) {
  const logoUrl = process.env.LOGO_URL?.trim();

  if (!logoUrl) {
    throw new Error('LOGO_URL is required to render email templates.');
  }

  return (
    <EmailImage
      src={logoUrl}
      alt={alt}
      className={cn('mb-6 h-auto max-w-40', className)}
      width={width}
      {...props}
    />
  );
}

export function Text({
  className,
  ...props
}: ComponentPropsWithRef<typeof EmailText>) {
  return (
    <EmailText
      className={cn('m-0 mb-4 text-base leading-6', className)}
      {...props}
    />
  );
}

export function Divider({
  className,
  ...props
}: ComponentPropsWithRef<typeof EmailDivider>) {
  return (
    <EmailDivider
      className={cn('mt-2 mb-5 border-[#ece9e3]', className)}
      {...props}
    />
  );
}

export function Footer({
  className,
  ...props
}: ComponentPropsWithRef<typeof EmailText>) {
  return (
    <EmailText
      className={cn('m-0 text-sm leading-5 text-[#5e5e5e]', className)}
      {...props}
    />
  );
}

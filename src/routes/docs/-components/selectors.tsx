import { Blocks, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type DocsFramework,
  type DocsVersion,
  getDefaultVersion,
  getStatusLabel,
} from '@/routes/docs/-utils/registry'

const frameworkLogos: Record<string, string> = {
  react: 'react',
  vue: 'vue',
  svelte: 'svelte',
  angular: 'angular',
  preact: 'preact',
  solid: 'solid',
  'solid-js': 'solid',
  qwik: 'qwik',
  javascript: 'javascript',
  vanilla: 'javascript',
  agnostic: 'javascript',
  core: 'javascript',
}

function resolveFrameworkPresentation(framework: DocsFramework) {
  const id = framework.id.toLowerCase()
  const title = framework.title.toLowerCase()
  const isVanilla =
    id === 'agnostic' ||
    id === 'core' ||
    id === 'vanilla' ||
    title === 'agnostic' ||
    title === 'core' ||
    title === 'vanilla'

  if (isVanilla) {
    return { title: 'Vanilla', logo: 'javascript' }
  }

  return {
    title: framework.title,
    logo: frameworkLogos[id] ?? null,
  }
}

function FrameworkValue({ framework }: { framework: DocsFramework }) {
  const presentation = resolveFrameworkPresentation(framework)

  return (
    <span className="flex items-center gap-2">
      {presentation.logo ? (
        <img
          src={`/brand/frameworks/${presentation.logo}.svg`}
          alt=""
          aria-hidden="true"
          className="size-4 shrink-0"
          width={16}
          height={16}
        />
      ) : (
        <Blocks aria-hidden="true" className="size-4 shrink-0 text-fd-muted-foreground" />
      )}
      <span>{presentation.title}</span>
    </span>
  )
}

function VersionValue({ version }: { version: DocsVersion }) {
  return (
    <span className="flex w-full items-center gap-2">
      <Tag aria-hidden="true" className="size-4 shrink-0 text-fd-muted-foreground" />
      <span>{version.label}</span>
      <Badge
        variant={
          version.status === 'current'
            ? 'default'
            : version.status === 'previous'
              ? 'secondary'
              : 'outline'
        }
        className={
          version.status === 'current'
            ? 'ml-auto bg-fd-primary/10 text-fd-primary'
            : 'ml-auto border-fd-border bg-fd-muted text-fd-muted-foreground'
        }
      >
        {getStatusLabel(version.status)}
      </Badge>
    </span>
  )
}

type SelectorsProps = {
  frameworks: DocsFramework[]
  framework: DocsFramework
  version: DocsVersion
  onSwitch: (framework: DocsFramework, version: DocsVersion) => void
}

export function Selectors({ frameworks, framework, version, onSwitch }: SelectorsProps) {
  return (
    <div className="flex flex-col gap-2 pb-2">
      <Select
        readOnly={frameworks.length === 1}
        value={framework.id}
        items={frameworks.map((entry) => ({
          value: entry.id,
          label: resolveFrameworkPresentation(entry).title,
        }))}
        onValueChange={(value) => {
          const selected = frameworks.find((entry) => entry.id === value)

          if (selected) {
            onSwitch(
              selected,
              selected.versions.find((candidate) => candidate.id === version.id) ??
                getDefaultVersion(selected),
            )
          }
        }}
      >
        <SelectTrigger
          aria-label="Framework"
          className="h-9 w-full border-fd-border bg-fd-background text-sm text-fd-foreground data-[size=default]:h-9"
        >
          <SelectValue>
            <FrameworkValue framework={framework} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="border border-fd-border bg-fd-popover p-1 text-fd-popover-foreground"
        >
          {frameworks.map((entry) => (
            <SelectItem
              key={entry.id}
              value={entry.id}
              className="py-2 text-sm data-highlighted:bg-fd-accent data-highlighted:text-fd-accent-foreground"
            >
              <FrameworkValue framework={entry} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={version.id}
        items={framework.versions.map((entry) => ({
          value: entry.id,
          label: `${entry.label} ${getStatusLabel(entry.status)}`,
        }))}
        onValueChange={(value) => {
          const selected = framework.versions.find((entry) => entry.id === value)

          if (selected) {
            onSwitch(framework, selected)
          }
        }}
      >
        <SelectTrigger
          aria-label="Version"
          className="h-9 w-full border-fd-border bg-fd-background text-sm text-fd-foreground data-[size=default]:h-9"
        >
          <SelectValue>
            <VersionValue version={version} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="border border-fd-border bg-fd-popover p-1 text-fd-popover-foreground"
        >
          {framework.versions.map((entry) => (
            <SelectItem
              key={entry.id}
              value={entry.id}
              className="py-2 text-sm data-highlighted:bg-fd-accent data-highlighted:text-fd-accent-foreground"
            >
              <VersionValue version={entry} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

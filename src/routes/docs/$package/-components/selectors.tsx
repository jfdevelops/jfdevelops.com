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
}

function FrameworkValue({ framework }: { framework: DocsFramework }) {
  const logo = frameworkLogos[framework.id]

  return (
    <span className="flex items-center gap-2">
      {logo ? (
        <img
          src={`/brand/frameworks/${logo}.svg`}
          alt=""
          aria-hidden="true"
          className="size-4 shrink-0"
          width={16}
          height={16}
        />
      ) : (
        <Blocks aria-hidden="true" className="size-4 shrink-0 text-fd-muted-foreground" />
      )}
      <span>{framework.title}</span>
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
        value={framework.id}
        items={frameworks.map((framework) => ({ value: framework.id, label: framework.title }))}
        onValueChange={(value) => {
          const selected = frameworks.find((framework) => framework.id === value)
          if (selected)
            onSwitch(
              selected,
              selected.versions.find((candidate) => candidate.id === version.id) ??
                getDefaultVersion(selected),
            )
        }}
      >
        <SelectTrigger
          aria-label="Framework"
          className="h-9 w-full data-[size=default]:h-9 border-fd-border bg-fd-background text-sm text-fd-foreground"
        >
          <SelectValue>
            <FrameworkValue framework={framework} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="border border-fd-border bg-fd-popover p-1 text-fd-popover-foreground"
        >
          {frameworks.map((framework) => (
            <SelectItem
              key={framework.id}
              value={framework.id}
              className="py-2 text-sm data-highlighted:bg-fd-accent data-highlighted:text-fd-accent-foreground"
            >
              <FrameworkValue framework={framework} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={version.id}
        items={framework.versions.map((version) => ({
          value: version.id,
          label: `${version.label} ${getStatusLabel(version.status)}`,
        }))}
        onValueChange={(value) => {
          const selected = framework.versions.find((version) => version.id === value)
          if (selected) onSwitch(framework, selected)
        }}
      >
        <SelectTrigger
          aria-label="Version"
          className="h-9 w-full data-[size=default]:h-9 border-fd-border bg-fd-background text-sm text-fd-foreground"
        >
          <SelectValue>
            <VersionValue version={version} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="border border-fd-border bg-fd-popover p-1 text-fd-popover-foreground"
        >
          {framework.versions.map((version) => (
            <SelectItem
              key={version.id}
              value={version.id}
              className="py-2 text-sm data-highlighted:bg-fd-accent data-highlighted:text-fd-accent-foreground"
            >
              <VersionValue version={version} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}


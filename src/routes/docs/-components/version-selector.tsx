import type { ComponentProps } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { versionDestination } from '@/docs/registry'
import { useDocs } from './context'

export function VersionSelector(props: ComponentProps<typeof Select>) {
  const { pkg, page, version } = useDocs()
  const versions = [...pkg.versions].sort(
    (a, b) => Number(b.id === pkg.defaultVersion) - Number(a.id === pkg.defaultVersion),
  )
  const items = versions.map((version) => ({ value: version.id, label: version.label }))

  return (
    <Select
      items={items}
      value={version.id}
      onValueChange={(value) => {
        if (typeof value === 'string') {
          window.location.assign(versionDestination(pkg, page, value, window.location.hash))
        }
      }}
      {...props}
    >
      <SelectTrigger aria-label="Documentation version" className="my-3 w-full">
        <SelectValue />
        <Badge variant="secondary">
          {version.status === 'next' ? 'unreleased' : version.status}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {versions.map((version) => (
          <SelectItem key={version.id} value={version.id}>
            {version.label}{' '}
            <Badge variant="outline">
              {version.status === 'next' ? 'unreleased' : version.status}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

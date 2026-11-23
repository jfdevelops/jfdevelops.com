import { useNavigate } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getLibraryGroups } from '@/routes/docs/-utils/catalog'
import type { PackageDocs } from '@/routes/docs/-utils/registry'

export function LibrarySelector({
  libraries,
  selected,
}: {
  libraries: PackageDocs[]
  selected: PackageDocs
}) {
  const navigate = useNavigate()

  return (
    <Select
      value={selected.slug}
      items={libraries.map((library) => ({ value: library.slug, label: library.name }))}
      onValueChange={(value) => {
        if (value) void navigate({ to: '/docs/$package', params: { package: value } })
      }}
    >
      <SelectTrigger
        aria-label="Library"
        className="h-9 w-full border-fd-border bg-fd-secondary/50 text-sm text-fd-foreground data-[size=default]:h-9"
      >
        <BookOpen aria-hidden="true" className="size-4 shrink-0 text-fd-primary" />
        <SelectValue>{selected.name}</SelectValue>
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        className="border border-fd-border bg-fd-popover p-1 text-fd-popover-foreground"
      >
        {getLibraryGroups(libraries).map((group) => (
          <SelectGroup key={group.id}>
            <SelectLabel className="text-fd-muted-foreground">{group.title}</SelectLabel>
            {group.libraries.map((library) => (
              <SelectItem
                key={library.slug}
                value={library.slug}
                className="py-2 text-sm data-highlighted:bg-fd-accent data-highlighted:text-fd-accent-foreground"
              >
                {library.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}


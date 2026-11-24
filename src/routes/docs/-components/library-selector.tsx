import { useNavigate } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { docsLibraries, getDocsLibrary, libraryGroups } from '@/routes/docs/-utils/libraries'

export function LibrarySelector({ selectedId }: { selectedId: string }) {
  const navigate = useNavigate()
  const selected = getDocsLibrary(selectedId) ?? docsLibraries[0]

  if (!selected) {
    return null
  }

  const Icon = selected.icon

  return (
    <Select
      value={selected.id}
      items={docsLibraries.map((library) => ({ value: library.id, label: library.title }))}
      onValueChange={(value) => {
        if (!value) {
          return
        }

        const library = getDocsLibrary(value)

        if (library) {
          void navigate({ to: '/docs/$package', params: { package: library.id } })
        }
      }}
    >
      <SelectTrigger
        aria-label="Library"
        className="h-9 w-full border-fd-border bg-fd-secondary/50 text-sm text-fd-foreground data-[size=default]:h-9"
      >
        <Icon aria-hidden="true" className="size-4 shrink-0 text-fd-primary" />
        <SelectValue>{selected.title}</SelectValue>
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        className="w-[min(24rem,calc(100vw-2rem))] border border-fd-border bg-fd-popover p-1 text-fd-popover-foreground"
      >
        {libraryGroups.map((group) => (
          <SelectGroup key={group.id}>
            <SelectLabel className="text-fd-muted-foreground">{group.title}</SelectLabel>
            {group.libraries.map((library) => {
              const ItemIcon = library.icon

              return (
                <SelectItem
                  key={library.id}
                  value={library.id}
                  className="items-start py-2.5 pr-10 text-sm data-highlighted:bg-fd-accent data-highlighted:text-fd-accent-foreground"
                >
                  <ItemIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fd-primary" />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-medium leading-5 text-fd-foreground">
                      {library.title}
                    </span>
                    <span className="text-xs leading-5 whitespace-normal text-fd-muted-foreground">
                      {library.description}
                    </span>
                  </span>
                </SelectItem>
              )
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

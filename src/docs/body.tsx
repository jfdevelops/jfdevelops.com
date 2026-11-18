import { type ComponentProps, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type HoverTarget = { element: HTMLElement; html: string; type: string; docs: string }

export function DocBody({ ref, ...props }: ComponentProps<'div'>) {
  const tooltipId = useId()
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const [targets, setTargets] = useState<HoverTarget[]>([])

  const html = props.dangerouslySetInnerHTML?.__html

  useEffect(() => {
    if (!root || !html) {
      setTargets([])
      return
    }

    setTargets(
      [...root.querySelectorAll<HTMLElement>('.docs-type-mount')].map((element) => ({
        element,
        html: element.previousElementSibling?.innerHTML ?? '',
        type: element.dataset.type ?? '',
        docs: element.dataset.docs ?? '',
      })),
    )
  }, [root, html])

  return (
    <>
      <div
        {...props}
        ref={(element) => {
          setRoot(element)
          const cleanup = typeof ref === 'function' ? ref(element) : undefined

          if (ref && typeof ref !== 'function') {
            ref.current = element
          }

          return () => {
            if (typeof cleanup === 'function') {
              cleanup()
            } else if (typeof ref === 'function') {
              ref(null)
            } else if (ref) {
              ref.current = null
            }
          }
        }}
      />
      <TooltipProvider delay={0}>
        {targets.map((target, index) =>
          createPortal(
            <Tooltip>
              <TooltipTrigger
                type="button"
                aria-describedby={`${tooltipId}-${index}`}
                className="docs-type-trigger cursor-help rounded-sm p-0 align-baseline underline decoration-current/30 decoration-dotted underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Generated Shiki token HTML comes from escaped, validated Markdown. */}
                <span dangerouslySetInnerHTML={{ __html: target.html }} />
              </TooltipTrigger>
              <TooltipContent
                id={`${tooltipId}-${index}`}
                role="tooltip"
                side="top"
                align="start"
                className="animate-none! transition-none! block max-w-[min(44rem,calc(100vw-2rem))] border border-border bg-popover p-3 text-popover-foreground shadow-lg"
              >
                <pre className="m-0 max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                  {target.type}
                </pre>
                {target.docs && (
                  <p className="mb-0 mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                    {target.docs}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>,
            target.element,
            String(index),
          ),
        )}
      </TooltipProvider>
    </>
  )
}

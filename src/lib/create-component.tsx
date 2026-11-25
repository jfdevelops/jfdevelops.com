import type { ComponentType, ReactElement, RefObject } from 'react'
import { isValidElement } from 'react'

type Opaque =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | ((...args: never[]) => unknown)
  | ReactElement
  | RefObject<unknown>
  | Node
  | Iterable<unknown>
  | PromiseLike<unknown>

/**
 * Deeply optional props. React nodes, refs, DOM nodes, functions, arrays and
 * other iterables stay intact because defaults replace them instead of merging into them.
 */
export type DeepPartial<T> = T extends Opaque
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

/** Props left to the caller once `TDefaults` fills part of `TProps`. */
export type PropsWithDefaults<TProps, TDefaults> = Omit<TProps, keyof TDefaults> & {
  [K in keyof TDefaults & keyof TProps]?: DeepPartial<TProps[K]>
}

function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== 'object' || isValidElement(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

function enumerableKeys(value: object) {
  return Reflect.ownKeys(value).filter((key) =>
    Object.prototype.propertyIsEnumerable.call(value, key),
  )
}

function mergeValues(defaultValue: unknown, value: unknown): unknown {
  if (value === undefined) {
    return defaultValue
  }

  if (!isPlainObject(defaultValue) || !isPlainObject(value)) {
    return value
  }

  const result: Record<PropertyKey, unknown> = {}
  const keys = new Set([...enumerableKeys(defaultValue), ...enumerableKeys(value)])

  for (const key of keys) {
    // Define an own property safely, including for "__proto__".
    Object.defineProperty(result, key, {
      value: mergeValues(defaultValue[key], value[key]),
      enumerable: true,
      configurable: true,
      writable: true,
    })
  }

  return result
}

/**
 * Deep-merges `props` over `defaultProps`. Plain objects merge key by key;
 * any other value, including arrays and React elements, replaces the default.
 */
export function mergeProps<TProps extends object>(
  props: DeepPartial<TProps> | undefined,
  defaultProps: DeepPartial<TProps> | undefined,
) {
  return mergeValues(defaultProps ?? {}, props ?? {}) as TProps
}

/**
 * Wraps a component with deep-merged default props:
 * `createComponent(Component)(defaults)`.
 *
 * The call is curried so the component's props are known before the defaults
 * are checked, which keeps literal types such as `on: 'nav'` without
 * `as const`. Defaulted props become optional, and the defaults stay
 * available as `defaults` for reuse.
 */
export function createComponent<TProps extends object>(component: ComponentType<TProps>) {
  const displayName = component.displayName || component.name || 'Component'

  return function withDefaults<TDefaults extends DeepPartial<TProps>>(defaults: TDefaults) {
    // biome-ignore lint/correctness/noComponentHookFactories: created once per module-level call, not per render
    function ComponentWithDefaults(props: PropsWithDefaults<TProps, TDefaults>) {
      const Component = component
      const merged = mergeProps<TProps>(props as DeepPartial<TProps>, defaults)

      return <Component {...merged} />
    }

    ComponentWithDefaults.displayName = displayName

    return Object.assign(ComponentWithDefaults, { defaults })
  }
}

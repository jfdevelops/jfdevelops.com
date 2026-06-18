import type {
  ComponentPropsWithRef,
  ElementType,
  JSX,
  ReactElement,
} from 'react';

type AsProp<TComponent extends ElementType> = {
  as?: TComponent;
};

type PropsToOmit<TComponent extends ElementType, TProps> = keyof (AsProp<TComponent> &
  TProps);

export type PolymorphicProps<
  TComponent extends ElementType,
  TProps = {},
> = TProps &
  AsProp<TComponent> &
  Omit<ComponentPropsWithRef<TComponent>, PropsToOmit<TComponent, TProps>>;

export type PolymorphicRenderProps<
  TComponent extends ElementType,
  TProps = {},
> = Omit<PolymorphicProps<TComponent, TProps>, 'as'>;

export type PolymorphicRenderComponent<
  TComponent extends ElementType,
  TProps = {},
> = (props: PolymorphicRenderProps<TComponent, TProps>) => ReactElement | null;

export type PolymorphicContext<
  TComponent extends ElementType,
  TProps = {},
> = {
  Component: PolymorphicRenderComponent<TComponent, TProps>;
  createProps: <TOverrides extends object>(
    props: Omit<PolymorphicRenderProps<TComponent, TProps>, keyof TOverrides>,
    overrides?: TOverrides,
  ) => PolymorphicRenderProps<TComponent, TProps>;
};

export type PolymorphicRenderer<
  TDefaultComponent extends ElementType,
  TProps = {},
> = <TComponent extends ElementType = TDefaultComponent>(
  props: PolymorphicRenderProps<TComponent, TProps>,
  context: PolymorphicContext<TComponent, TProps>,
) => ReactElement | null;

export type PolymorphicComponent<
  TDefaultComponent extends ElementType,
  TProps = {},
> = <TComponent extends ElementType = TDefaultComponent>(
  props: PolymorphicProps<TComponent, TProps>,
) => ReactElement | null;

function renderIntrinsic<TComponent extends ElementType>(
  props: PolymorphicRenderProps<TComponent>,
  Component: TComponent,
) {
  const IntrinsicComponent = Component as ElementType;
  return <IntrinsicComponent {...(props as JSX.IntrinsicAttributes & typeof props)} />;
}

function createPropsHelper<TComponent extends ElementType, TProps = {}>() {
  return function <TOverrides extends object>(
    props: Omit<PolymorphicRenderProps<TComponent, TProps>, keyof TOverrides>,
    overrides?: TOverrides,
  ) {
    return {
      ...props,
      ...overrides,
    } as PolymorphicRenderProps<TComponent, TProps>;
  };
}

type NamedPolymorphicOptions = {
  name: string;
};

type CreatePolymorphicVariant<
  TDefaultComponent extends ElementType,
  TBaseProps,
> = {
  <TCustomProps = {}>(
    render: PolymorphicRenderer<TDefaultComponent, TBaseProps & TCustomProps>,
  ): PolymorphicComponent<TDefaultComponent, TBaseProps & TCustomProps>;
  (options: NamedPolymorphicOptions): PolymorphicComponent<TDefaultComponent, TBaseProps>;
};

export function createPolymorphicComponent<
  TDefaultComponent extends ElementType,
  TBaseProps = {},
>(
  defaultComponent: TDefaultComponent,
  renderBase?: PolymorphicRenderer<TDefaultComponent, TBaseProps>,
) {
  const baseRenderer: PolymorphicRenderer<TDefaultComponent, TBaseProps> =
    renderBase ?? ((props, context) => context.Component(props as never));

  const createVariant = ((input: NamedPolymorphicOptions | PolymorphicRenderer<any, any>) => {
    const resolvedRender =
      typeof input === 'function'
        ? input
        : (baseRenderer as PolymorphicRenderer<
            TDefaultComponent,
            TBaseProps
          >);
    const displayName =
      typeof input === 'function' ? input.name || 'PolymorphicComponent' : input.name;

    function Polymorphic<TComponent extends ElementType = TDefaultComponent>({
      as,
      ...props
    }: PolymorphicProps<TComponent, any>) {
      const Component = (as ?? defaultComponent) as TComponent;

      const intrinsicContext: PolymorphicContext<TComponent, TBaseProps> = {
        Component: (intrinsicProps) =>
          renderIntrinsic(
            intrinsicProps as PolymorphicRenderProps<TComponent>,
            Component,
          ),
        createProps: createPropsHelper<TComponent, TBaseProps>(),
      };

      const baseContext: PolymorphicContext<TComponent, any> = {
        Component: (baseProps) =>
          baseRenderer(
            baseProps as PolymorphicRenderProps<TComponent, TBaseProps>,
            intrinsicContext,
          ),
        createProps: createPropsHelper<TComponent, any>(),
      };

      return resolvedRender(
        props,
        baseContext,
      );
    }

    Polymorphic.displayName = displayName;

    return Polymorphic;
  }) as CreatePolymorphicVariant<TDefaultComponent, TBaseProps>;

  return createVariant;
}

export const createPolymorphic = createPolymorphicComponent;

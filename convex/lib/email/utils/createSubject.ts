type ExtractProps<Props extends object> = Props extends infer P ? P : never;
type CreateSubjectOptions<Props extends object> = {
  props: Props;
  render: (props: ExtractProps<Props>) => string;
};

function createValidatedProps<Props extends object>(props: Props) {
  if (typeof props !== 'object') {
    throw new Error('Props must be an object');
  }

  if (Object.keys(props).length === 0) {
    throw new Error('Props must not be empty');
  }

  return (args: ExtractProps<Props>) => {
    if (typeof args !== 'object') {
      throw new Error('Args must be an object');
    }

    if (Object.keys(args).length === 0) {
      throw new Error('Args must not be empty');
    }

    for (const [key, value] of Object.entries(args)) {
      if (!(key in props)) {
        throw new Error(`Invalid argument: ${key}`);
      }

      const currentProp = props[key as keyof Props];

      if (typeof value !== typeof currentProp) {
        throw new Error(`"${key}" must be a "${typeof currentProp}"`);
      }

    }

    return args;
  };
}

export function createSubject<Props extends object>(
  options: CreateSubjectOptions<Props>,
) {
  const { props, render } = options;
  const validatedProps = createValidatedProps(props);

  return (args: ExtractProps<Props>) => render(validatedProps(args));
}

const subject = createSubject({
  props: {
    name: '',
    email: '',
    projectType: '',
  },
  render: ({ email, name }) => `New project inquiry from ${name}`,
});

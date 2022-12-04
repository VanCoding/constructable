export const IS_CONSTRUCTABLE = Symbol();

type DependencyDeclaration = Record<any, any>;
type Constructable<T, Deps extends DependencyDeclaration> = {
  [IS_CONSTRUCTABLE]: true;
  dependencies: Deps;
  construct: (deps: ResolvedDependencies<Deps>) => T;
};
type Constructed<T> = T extends Constructable<any, any>
  ? ReturnType<T["construct"]>
  : T;
type ResolvedDependencies<T> = { [P in keyof T]: Constructed<T[P]> };
type Container = {
  get: <T extends Constructable<any, any>>(
    constructable: T
  ) => Constructed<T> | undefined;
  set: <T extends Constructable<any, any>>(
    constructable: T,
    value: Constructed<T>
  ) => Container;
};

export const resolve = <T extends Constructable<any, any>>(
  constructable: T,
  container: Container = defaultContainer
): Constructed<T> => {
  const resolved = container.get(constructable);
  if (resolved !== undefined) return resolved;
  const constructed = constructable.construct(
    resolveDependencies(constructable.dependencies, container)
  );
  container.set(constructable, constructed);
  return constructed;
};

export const container = (): Container => {
  return new Map();
};

const defaultContainer = container();

const resolveDependencies = <Deps extends DependencyDeclaration>(
  deps: Deps,
  container: Container
): ResolvedDependencies<Deps> =>
  Object.fromEntries(
    Object.entries(deps).map(([key, value]) => [
      key,
      IS_CONSTRUCTABLE in value ? resolve(value, container) : value,
    ])
  ) as any;

export const constructable = <T, Deps extends DependencyDeclaration>(
  dependencies: Deps,
  construct: (deps: ResolvedDependencies<Deps>) => T
): Constructable<T, Deps> => {
  return { [IS_CONSTRUCTABLE]: true, dependencies, construct };
};

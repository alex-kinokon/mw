interface ArrayConstructor {
  fromAsync<T>(iterable: AsyncIterable<T> | Iterable<T | Promise<T>>): Promise<T[]>;

  fromAsync<T, U>(
    iterable: AsyncIterable<T> | Iterable<T>,
    mapFn: (value: Awaited<T>) => U,
    thisArg?: any
  ): Promise<Awaited<U>[]>;
}

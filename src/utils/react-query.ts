import type { FetchQueryOptions, QueryKey } from "@tanstack/react-query";

export const createQueryOptions = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) => options;

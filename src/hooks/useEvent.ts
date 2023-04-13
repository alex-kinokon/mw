import { useCallback, useLayoutEffect, useRef } from "react";

export { useEvent };

function useEvent<Params extends any[] = [], Return = never>(
  handler: (...params: Params) => Return
) {
  const handlerRef = useRef<(...params: Params) => Return>(handler);

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: Params): Return => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current!;
    return fn(...args);
  }, []);
}

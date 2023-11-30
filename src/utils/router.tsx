// https://github.com/molefrog/wouter/tree/58f20e4bcb7e8ea008dd66a2d1fcf65eb99418a3
import {
  cloneElement,
  createContext,
  createElement,
  forwardRef,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { isElement } from "react-is";
import { useEvent } from "../hooks/useEvent";

if (!("URLPattern" in globalThis)) {
  await import("urlpattern-polyfill");
}

type ExtractRouteOptionalParam<PathType extends string> =
  PathType extends `${infer Param}?`
    ? { readonly [k in Param]: string | undefined }
    : PathType extends `${infer Param}*`
      ? { readonly [k in Param]: string | undefined }
      : PathType extends `${infer Param}+`
        ? { readonly [k in Param]: string }
        : { readonly [k in PathType]: string };

export type ExtractRouteParams<PathType extends string> = string extends PathType
  ? DefaultParams
  : PathType extends `${infer _}:${infer ParamWithOptionalRegExp}/${infer Rest}`
    ? ParamWithOptionalRegExp extends `${infer Param}(${infer _RegExp})`
      ? ExtractRouteOptionalParam<Param> & ExtractRouteParams<Rest>
      : ExtractRouteOptionalParam<ParamWithOptionalRegExp> & ExtractRouteParams<Rest>
    : PathType extends `${infer _}:${infer ParamWithOptionalRegExp}`
      ? ParamWithOptionalRegExp extends `${infer Param}(${infer _RegExp})`
        ? ExtractRouteOptionalParam<Param>
        : ExtractRouteOptionalParam<ParamWithOptionalRegExp>
      : {};

export interface RouteComponentProps<T extends DefaultParams = DefaultParams> {
  params: T extends DefaultParams ? T : ExtractRouteParams<string>;
}

/**
 * Components: <Route />
 */
export interface RouteProps<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends string = string,
> {
  children?: React.ReactNode;
  path?: RoutePath;
  component?: React.ComponentType<{
    params: T extends DefaultParams ? T : ExtractRouteParams<RoutePath>;
  }>;
}

/*
 * Default `useLocation`
 */
interface HookOptions {
  prefix?: string;
  ssrPath?: string;
}

// the object returned from `useRouter`
const RouterCtx = createContext<{
  prefix: string;
  ssrPath?: string;
}>(undefined!);

const { Provider } = RouterCtx;

export function useRoute<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends string = string,
>(
  pattern?: RoutePath
): T extends DefaultParams ? T : ExtractRouteParams<RoutePath> | undefined {
  const context = useContext(RouterCtx);
  const path = useLocation(context);
  return pattern != null
    ? matcher(pattern, path, getBaseURL(context.ssrPath))
    : undefined;
}

export const Router: React.FC<{
  prefix?: string;
  ssrPath?: string;
  children?: React.ReactNode;
}> = ({ ssrPath, prefix = "", children }) => {
  const context = useMemo(() => ({ prefix, ssrPath }), [prefix, ssrPath]);
  return <Provider value={context}>{children}</Provider>;
};

// Navigation options that hook's push function accepts.
interface HookNavigationOptions {
  replace?: boolean;
}

export function defineRoute<
  T extends DefaultParams | undefined = undefined,
  RoutePath extends string = string,
>(props: RouteProps<T, RoutePath>) {
  return props;
}

function getBaseURL(ssrPath?: string) {
  return ssrPath ? new URL(ssrPath).origin : window.location.origin;
}

function isExternalPath(path: string) {
  return path.startsWith("http:") || path.startsWith("https:") || path.startsWith("//");
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  HookNavigationOptions & { href: string };

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const router = useContext(RouterCtx);
  const navigate = useNavigate(router);

  const { href, children, onClick, target, ...rest } = props;

  const handleClick = useEvent(event => {
    // ignores the navigation when clicked using right mouse button or
    // by holding a special modifier key: ctrl, command, win, alt, shift
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      event.button !== 0 ||
      target?.includes("_blank") ||
      isExternalPath(href)
    ) {
      return;
    }

    onClick?.(event);
    if (!event.defaultPrevented) {
      event.preventDefault();
      navigate(href, props);
    }
  });

  // wraps children in `a` if needed
  const extraProps = {
    href: router.prefix + href,
    onClick: handleClick,
    ref,
    target,
    ...rest,
  };

  const jsx = isValidElement(children) ? children : createElement("a", props);
  return cloneElement(jsx, extraProps);
});

export const Route = <
  T extends DefaultParams | undefined = undefined,
  RoutePath extends string = string,
>({
  path,
  component,
  children,
}: RouteProps<T, RoutePath>): React.ReactElement | null => {
  // `props.match` is present - Route is controlled by the Switch
  const params = useRoute(path)!;

  if (!params) return null;

  // React-Router style `component` prop
  if (component) return paramsWrapper(params, createElement(component, { params }));

  // support render prop or plain children
  return paramsWrapper(
    params,
    typeof children === "function" ? children(params) : children
  );
};

export const NestedRoute = ({
  prefix,
  children,
}: {
  prefix: string;
  children: React.ReactNode;
}) => {
  const router = useContext(RouterCtx);
  const parentLocation = useLocation();
  const nestedBase = `${router.prefix}${prefix}`;

  // don't render anything outside of the scope
  if (!parentLocation.startsWith(nestedBase)) return null;

  // we need key to make sure the router will remount when base changed
  return (
    <Router prefix={nestedBase} key={nestedBase}>
      {children}
    </Router>
  );
};

interface RouteMap {
  [path: string]:
    | React.ReactElement
    | React.ComponentType<{ params: Record<string, string> }>
    | RouteMap;
}

function fromRouteMap(routeMap: RouteMap, prefix = ""): RouteProps<any, string>[] {
  return Object.entries(routeMap).flatMap(
    ([path, value]): RouteProps<any, string> | RouteProps<any, string>[] => {
      const fullPath = prefix + path || undefined;
      if (typeof value === "function") {
        return { path: fullPath, component: value };
      } else if (isElement(value) || value === null) {
        return { path: fullPath, children: value };
      } else {
        return fromRouteMap(value, fullPath);
      }
    }
  );
}

const ParamsCtx = createContext({} as unknown);
const ParamsCtxProvider = ParamsCtx.Provider;

export const useParams = (() => useContext(ParamsCtx)) as <
  T extends DefaultParams = DefaultParams,
>() => T;

const paramsWrapper = (params: unknown, children: React.ReactNode) => (
  <ParamsCtxProvider value={params}>{children}</ParamsCtxProvider>
);

export const Switch: React.FC<{
  location?: string;
  routes: RouteProps<any, string>[] | RouteMap;
}> = ({ routes, location }) => {
  if (!Array.isArray(routes)) {
    routes = fromRouteMap(routes);
  }

  const router = useContext(RouterCtx);
  const originalLocation = useLocation(router);
  location ??= originalLocation;
  const baseURL = getBaseURL(router.ssrPath);

  let params: DefaultParams | undefined;

  for (const route of routes) {
    const { path, component, children } = route;

    if (
      // we don't require an element to be of type Route,
      // but we do require it to contain a truthy `path` prop.
      // this allows to use different components that wrap Route
      // inside of a switch, for example <AnimatedRoute />.
      (params = path ? matcher(path, location, baseURL) : {})
    ) {
      // React-Router style `component` prop
      if (component) {
        return paramsWrapper(
          params,
          createElement(component, { params, key: "component" } as any)
        );
      }

      return paramsWrapper(params, children);
    }
  }

  return null;
};

export const Redirect: React.FC<HookNavigationOptions & { href: string }> = props => {
  const navigate = useNavigate();
  const redirect = useEvent(() => navigate(props.href, props));

  // redirect is guaranteed to be stable since it is returned from useEvent
  useLayoutEffect(() => {
    redirect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

/*
 * Transforms `path` into its relative `base` version
 */
export const useLocation = ({ prefix = "", ssrPath }: HookOptions = {}) => {
  const pathname = useSyncExternalStore(
    subscribeToLocationUpdates,
    currentPathname,
    ssrPath ? () => ssrPath : currentPathname
  );
  if (!prefix) {
    return pathname ?? "/";
  }
  return pathname.slice(prefix.length) || "/";
};

export const useNavigate = ({ prefix = "" }: HookOptions = {}) =>
  useEvent((to: string, navOpts?: HookNavigationOptions) => {
    const target = prefix + to;
    if (navOpts?.replace) {
      history.replaceState(null, "", target);
    } else {
      history.pushState(null, "", target);
    }
  });

/**
 * History API docs @see https://developer.mozilla.org/en-US/docs/Web/API/History
 */
const eventPushState = "pushState";
const eventReplaceState = "replaceState";
const events = ["popstate", eventPushState, eventReplaceState, "hashchange"] as const;

function subscribeToLocationUpdates(callback: () => void) {
  for (const event of events) {
    self.addEventListener(event, callback);
  }
  return () => {
    for (const event of events) {
      self.removeEventListener(event, callback);
    }
  };
}

const currentPathname = () => location.pathname;

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
if (typeof history !== "undefined") {
  for (const type of [eventPushState, eventReplaceState] as const) {
    const original = history[type];
    history[type] = function (...args) {
      const result = original.apply(this, args);
      const event = new Event(type);
      (event as any).arguments = args;

      self.dispatchEvent(event);
      return result;
    };
  }
}

interface DefaultParams {
  readonly [paramName: string]: string | undefined;
}

const cache: Record<string, URLPattern> = Object.create(null);

function matcher(pattern: string, path: string, baseURL: string) {
  const urlPattern = (cache[pattern] ??= new URLPattern(pattern || "", baseURL));
  const out = urlPattern.exec(path, baseURL);
  return out?.pathname.groups;
}

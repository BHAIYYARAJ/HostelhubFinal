/**
 * Thin compatibility layer that maps the react-router-dom API surface used
 * across this app onto TanStack Router. Keeps existing page/component code
 * unchanged while the app runs on TanStack Start.
 */
import {
  Link as TanstackLink,
  useNavigate as useTanstackNavigate,
  useRouterState,
  useParams as useTanstackParams,
  Navigate as TanstackNavigate,
} from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

function splitTo(to: string) {
  const [pathAndSearch, hash] = to.split("#");
  const [pathname, search] = pathAndSearch.split("?");
  return { pathname: pathname || "/", search, hash };
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state: _state, ...rest },
  ref,
) {
  const { pathname, hash } = splitTo(to);
  return (
    <TanstackLink
      ref={ref}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={pathname as any}
      hash={hash}
      replace={replace}
      {...rest}
    />
  );
});

type NavLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children"> & {
  to: string;
  end?: boolean;
  className?: string | ((props: { isActive: boolean; isPending: boolean }) => string);
  children?: ReactNode | ((props: { isActive: boolean; isPending: boolean }) => ReactNode);
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, end, className, children, ...rest },
  ref,
) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const target = splitTo(to).pathname;
  const isActive =
    end || target === "/" ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
  const state = { isActive, isPending: false };

  return (
    <TanstackLink
      ref={ref}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={target as any}
      className={typeof className === "function" ? className(state) : className}
      {...rest}
    >
      {typeof children === "function" ? children(state) : children}
    </TanstackLink>
  );
});

export function useNavigate() {
  const navigate = useTanstackNavigate();
  return (to: string | number, opts?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") window.history.go(to);
      return;
    }
    const { pathname, hash } = splitTo(to);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({ to: pathname as any, hash, replace: opts?.replace });
  };
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useParams<T = Record<string, string>>(): T {
  return useTanstackParams({ strict: false } as never) as T;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const { pathname, hash } = splitTo(to);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <TanstackNavigate to={pathname as any} hash={hash} replace={replace} />;
}

export type { NavLinkProps };

import { Link } from 'react-router';
import type { LinkProps } from 'react-router';
import type { ComponentPropsWithRef, CSSProperties, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { ENTRANCE_TIMING, FOCUS_RING, MICRO_DURATION } from './tokens';

export type ButtonVariant = 'primary' | 'ghost' | 'bare';
export type ButtonSize = 'sm' | 'md';

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pending?: boolean;
  pendingLabel?: ReactNode;
  children?: ReactNode;
}

type ButtonAsButton = ButtonOwnProps &
  Omit<ComponentPropsWithRef<'button'>, 'children'> & {
    to?: never;
    href?: never;
  };

type ButtonAsRouterLink = ButtonOwnProps &
  Omit<LinkProps, 'children' | 'to'> & {
    to: LinkProps['to'];
    href?: never;
    ref?: Ref<HTMLAnchorElement>;
  };

type ButtonAsAnchor = ButtonOwnProps &
  Omit<ComponentPropsWithRef<'a'>, 'children' | 'href'> & {
    href: string;
    to?: never;
  };

export type ButtonProps = ButtonAsButton | ButtonAsRouterLink | ButtonAsAnchor;

const BASE =
  'metadata inline-grid uppercase tracking-widest rounded-[2px] transition-colors select-none';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-bone text-ink hover:bg-safelight hover:text-ink',
  ghost: 'border border-ink-line bg-transparent text-bone hover:border-bone',
  bare: 'bg-transparent text-bone hover:text-safelight',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-2',
  md: 'text-sm px-5 py-3',
};

const BARE_SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
};

const INERT = 'opacity-50 cursor-not-allowed pointer-events-none';

const buttonClassName = (
  variant: ButtonVariant,
  size: ButtonSize,
  inert: boolean,
  className: string | undefined,
) =>
  cn(
    BASE,
    FOCUS_RING,
    VARIANTS[variant],
    variant === 'bare' ? BARE_SIZES[size] : SIZES[size],
    inert && INERT,
    className,
  );

const motionStyle = (style: CSSProperties | undefined): CSSProperties => ({
  transitionDuration: MICRO_DURATION,
  transitionTimingFunction: ENTRANCE_TIMING,
  ...style,
});

function ButtonLabel({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="col-start-1 row-start-1 grid grid-cols-1 grid-rows-1 place-items-center">
      <span
        className={cn('col-start-1 row-start-1', pending && 'invisible')}
        aria-hidden={pending || undefined}
      >
        {children}
      </span>
      <span
        className={cn('col-start-1 row-start-1', !pending && 'invisible')}
        aria-hidden={!pending || undefined}
      >
        {pendingLabel}
      </span>
    </span>
  );
}

export function Button(props: ButtonProps) {
  if (props.to !== undefined) {
    const {
      to,
      variant = 'primary',
      size = 'md',
      pending = false,
      pendingLabel = 'WORKING',
      children,
      className,
      style,
      ...rest
    } = props;
    return (
      <Link
        to={to}
        className={buttonClassName(variant, size, pending, className)}
        style={motionStyle(style)}
        aria-busy={pending || undefined}
        {...rest}
      >
        <ButtonLabel pending={pending} pendingLabel={pendingLabel}>
          {children}
        </ButtonLabel>
      </Link>
    );
  }

  if (props.href !== undefined) {
    const {
      href,
      variant = 'primary',
      size = 'md',
      pending = false,
      pendingLabel = 'WORKING',
      children,
      className,
      style,
      ...rest
    } = props;
    return (
      <a
        href={href}
        className={buttonClassName(variant, size, pending, className)}
        style={motionStyle(style)}
        aria-busy={pending || undefined}
        {...rest}
      >
        <ButtonLabel pending={pending} pendingLabel={pendingLabel}>
          {children}
        </ButtonLabel>
      </a>
    );
  }

  const {
    variant = 'primary',
    size = 'md',
    pending = false,
    pendingLabel = 'WORKING',
    disabled = false,
    type = 'button',
    children,
    className,
    style,
    ...rest
  } = props;
  return (
    <button
      type={type}
      disabled={disabled || pending}
      className={buttonClassName(
        variant,
        size,
        false,
        cn('disabled:opacity-50 disabled:cursor-not-allowed', className),
      )}
      style={motionStyle(style)}
      aria-busy={pending || undefined}
      {...rest}
    >
      <ButtonLabel pending={pending} pendingLabel={pendingLabel}>
        {children}
      </ButtonLabel>
    </button>
  );
}

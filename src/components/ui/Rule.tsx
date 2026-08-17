import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';

interface RuleOwnProps {
  inset?: number | string;
}

type HorizontalRuleProps = RuleOwnProps &
  Omit<ComponentPropsWithRef<'hr'>, 'children'> & {
    orientation?: 'horizontal';
  };

type VerticalRuleProps = RuleOwnProps &
  Omit<ComponentPropsWithRef<'div'>, 'children'> & {
    orientation: 'vertical';
  };

export type RuleProps = HorizontalRuleProps | VerticalRuleProps;

const toLength = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

export function Rule(props: RuleProps) {
  if (props.orientation === 'vertical') {
    const { orientation, inset, className, style, ...rest } = props;
    return (
      <div
        role="separator"
        aria-orientation={orientation}
        className={cn('w-px self-stretch shrink-0 rounded-none bg-ink-line', className)}
        style={{ marginBlock: toLength(inset), ...style }}
        {...rest}
      />
    );
  }

  const { orientation, inset, className, style, ...rest } = props;
  return (
    <hr
      aria-orientation={orientation ?? 'horizontal'}
      className={cn('h-px w-full shrink-0 rounded-none border-0 bg-ink-line', className)}
      style={{ marginInline: toLength(inset), ...style }}
      {...rest}
    />
  );
}

import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';
import { FieldFrame } from './FieldFrame';
import {
  FIELD_CONTROL_CLASS,
  FOCUS_RING,
  fieldAria,
  fieldToneClass,
  microTransitionStyle,
} from './tokens';

export type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'id'> & {
  label: string;
  id: string;
  error?: string;
  hint?: string;
};

export function Select({
  label,
  id,
  error,
  hint,
  className,
  style,
  children,
  'aria-describedby': describedBy,
  ...rest
}: SelectProps) {
  return (
    <FieldFrame label={label} id={id} error={error} hint={hint}>
      <span className="relative flex items-center">
        <select
          {...fieldAria(id, hint, error, describedBy)}
          className={cn(
            FIELD_CONTROL_CLASS,
            FOCUS_RING,
            'cursor-pointer appearance-none border-0 border-b py-2 pr-8',
            '[&_option]:bg-ink [&_option]:text-bone',
            fieldToneClass(Boolean(error)),
            className,
          )}
          style={microTransitionStyle(style)}
          {...rest}
        >
          {children}
        </select>
        <span
          aria-hidden="true"
          className="metadata pointer-events-none absolute right-0 text-xs text-bone-dim"
        >
          ▾
        </span>
      </span>
    </FieldFrame>
  );
}

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

interface FieldOwnProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
}

type SingleLineFieldProps = FieldOwnProps &
  Omit<ComponentPropsWithRef<'input'>, 'id'> & {
    multiline?: false;
  };

type MultiLineFieldProps = FieldOwnProps &
  Omit<ComponentPropsWithRef<'textarea'>, 'id'> & {
    multiline: true;
  };

export type FieldProps = SingleLineFieldProps | MultiLineFieldProps;

export function Field(props: FieldProps) {
  if (props.multiline === true) {
    const {
      label,
      id,
      error,
      hint,
      multiline: _multiline,
      className,
      style,
      'aria-describedby': describedBy,
      ...rest
    } = props;
    return (
      <FieldFrame label={label} id={id} error={error} hint={hint}>
        <textarea
          {...fieldAria(id, hint, error, describedBy)}
          className={cn(
            FIELD_CONTROL_CLASS,
            FOCUS_RING,
            'min-h-32 resize-y border p-3',
            fieldToneClass(Boolean(error)),
            className,
          )}
          style={microTransitionStyle(style)}
          {...rest}
        />
      </FieldFrame>
    );
  }

  const {
    label,
    id,
    error,
    hint,
    multiline: _multiline,
    className,
    style,
    'aria-describedby': describedBy,
    ...rest
  } = props;
  return (
    <FieldFrame label={label} id={id} error={error} hint={hint}>
      <input
        {...fieldAria(id, hint, error, describedBy)}
        className={cn(
          FIELD_CONTROL_CLASS,
          FOCUS_RING,
          'border-0 border-b py-2',
          fieldToneClass(Boolean(error)),
          className,
        )}
        style={microTransitionStyle(style)}
        {...rest}
      />
    </FieldFrame>
  );
}

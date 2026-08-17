import type { ReactNode } from 'react';
import { FIELD_ERROR_CLASS, FIELD_HINT_CLASS, FIELD_LABEL_CLASS } from './tokens';

export interface FieldFrameProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FieldFrame({ label, id, error, hint, children }: FieldFrameProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </label>
      {children}
      {hint ? (
        <span id={`${id}-hint`} className={FIELD_HINT_CLASS}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} role="alert" className={FIELD_ERROR_CLASS}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

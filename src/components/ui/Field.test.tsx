import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Field } from './Field';

describe('Field labelling', () => {
  it('associates the label with the input', () => {
    render(<Field id="name" label="PRODUCTION (NAME)" />);
    const control = screen.getByLabelText('PRODUCTION (NAME)');
    expect(control.tagName).toBe('INPUT');
    expect(control.getAttribute('id')).toBe('name');
  });

  it('renders a textarea when multiline', () => {
    render(<Field id="notes" label="NOTES" multiline />);
    expect(screen.getByLabelText('NOTES').tagName).toBe('TEXTAREA');
  });
});

describe('Field validation wiring', () => {
  it('exposes the error through aria-describedby and role=alert', () => {
    render(<Field id="email" label="ROLL (EMAIL)" error="Valid email is required" />);
    const control = screen.getByLabelText('ROLL (EMAIL)');
    const alert = screen.getByRole('alert');

    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(alert.textContent).toBe('Valid email is required');
    expect(alert.getAttribute('id')).toBe('email-error');
    expect(control.getAttribute('aria-describedby')).toBe('email-error');
  });

  it('points aria-describedby at both the hint and the error', () => {
    render(
      <Field
        id="date"
        label="DATE"
        hint="Shoot date, not delivery date"
        error="Date is required"
      />,
    );
    const control = screen.getByLabelText('DATE');
    expect(control.getAttribute('aria-describedby')).toBe('date-hint date-error');
    expect(screen.getByText('Shoot date, not delivery date').getAttribute('id')).toBe(
      'date-hint',
    );
  });

  it('omits aria-invalid and aria-describedby when clean', () => {
    render(<Field id="clean" label="CLEAN" />);
    const control = screen.getByLabelText('CLEAN');
    expect(control.hasAttribute('aria-invalid')).toBe(false);
    expect(control.hasAttribute('aria-describedby')).toBe(false);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

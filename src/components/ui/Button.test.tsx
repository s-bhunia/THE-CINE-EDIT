import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Button } from './Button';

describe('Button element choice', () => {
  it('renders a native button by default', () => {
    render(<Button>Mark</Button>);
    const control = screen.getByRole('button', { name: 'Mark' });
    expect(control.tagName).toBe('BUTTON');
    expect(control.getAttribute('type')).toBe('button');
  });

  it('renders a router link when given to', () => {
    render(
      <MemoryRouter>
        <Button to="/contact">Book</Button>
      </MemoryRouter>,
    );
    const control = screen.getByRole('link', { name: 'Book' });
    expect(control.tagName).toBe('A');
    expect(control.getAttribute('href')).toBe('/contact');
  });

  it('renders a plain anchor when given href', () => {
    render(<Button href="https://example.com">Offsite</Button>);
    const control = screen.getByRole('link', { name: 'Offsite' });
    expect(control.tagName).toBe('A');
    expect(control.getAttribute('href')).toBe('https://example.com');
  });
});

describe('Button disabled and pending states', () => {
  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Mark
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mark' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Mark</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Mark' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keeps both labels mounted while pending so the width cannot shift', () => {
    const { container } = render(
      <Button pending pendingLabel="SYNCING">
        MARK
      </Button>,
    );
    expect(container.textContent).toContain('MARK');
    expect(container.textContent).toContain('SYNCING');
  });

  it('marks a pending button as busy and blocks the click', () => {
    const onClick = vi.fn();
    render(
      <Button pending onClick={onClick}>
        MARK
      </Button>,
    );
    const control = screen.getByRole('button');
    expect(control.getAttribute('aria-busy')).toBe('true');
    expect(control).toHaveProperty('disabled', true);
    fireEvent.click(control);
    expect(onClick).not.toHaveBeenCalled();
  });
});

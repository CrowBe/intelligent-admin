import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './Command';

describe('Command', () => {
  it('renders command palette without crashing', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
  });

  it('renders with data-slot attribute', () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search" />
      </Command>
    );
    const command = container.querySelector('[data-slot="command"]');
    expect(command).toBeInTheDocument();
  });

  it('displays empty state when no items', () => {
    render(
      <Command>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('renders command items correctly', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

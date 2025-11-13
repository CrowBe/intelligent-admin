import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from './Drawer';

describe('Drawer', () => {
  it('renders without crashing', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );

    // Drawer trigger is rendered immediately
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toBeInTheDocument();

    // Content is not visible until opened
    await user.click(trigger);

    // Drawer content is rendered in a portal, so use document instead of container
    await waitFor(() => {
      const content = document.querySelector('[data-slot="drawer-content"]');
      expect(content).toBeInTheDocument();
    });
  });

  it('renders trigger correctly', () => {
    render(
      <Drawer>
        <DrawerTrigger>Open Drawer</DrawerTrigger>
      </Drawer>
    );
    expect(screen.getByText('Open Drawer')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>Drawer description text</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
    expect(screen.getByText('Drawer Title')).toBeInTheDocument();
    expect(screen.getByText('Drawer description text')).toBeInTheDocument();
  });

  it('has correct data-slot attributes', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );

    // Open drawer via trigger click
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    // Content is rendered in a portal with correct data-slot attributes
    await waitFor(() => {
      expect(document.querySelector('[data-slot="drawer-title"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="drawer-header"]')).toBeInTheDocument();
    });
  });
});

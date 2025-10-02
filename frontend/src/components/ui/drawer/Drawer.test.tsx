import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from './Drawer';

describe('Drawer', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
    expect(container.querySelector('[data-slot="drawer"]')).toBeInTheDocument();
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

  it('has correct data-slot attributes', () => {
    const { container } = render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
    expect(container.querySelector('[data-slot="drawer-title"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="drawer-header"]')).toBeInTheDocument();
  });
});

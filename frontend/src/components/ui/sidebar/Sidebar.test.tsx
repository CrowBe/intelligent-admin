import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './Sidebar';

describe('Sidebar', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Item</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar"]')).toBeInTheDocument();
  });

  it('renders menu items correctly', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Dashboard</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders sidebar header', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <span>Header Content</span>
          </SidebarHeader>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('has correct data-slot attributes', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
        </Sidebar>
      </SidebarProvider>
    );
    expect(container.querySelector('[data-slot="sidebar-header"]')).toBeInTheDocument();
  });
});

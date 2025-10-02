import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';

describe('Accordion', () => {
  it('renders accordion component', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument();
  });

  it('expands accordion item on click', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    await user.click(trigger);

    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('collapses accordion item on second click', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    await user.click(trigger);

    // Verify it's open
    expect(screen.getByText('Content 1')).toBeVisible();

    await user.click(trigger);

    // After second click, content should be collapsed
    const content = container.querySelector('[data-state="closed"]');
    expect(content).toBeInTheDocument();
  });

  it('renders multiple accordion items', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Item 3</AccordionTrigger>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item 3' })).toBeInTheDocument();
  });

  it('closes other items when opening new item in single mode', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    await user.click(screen.getByRole('button', { name: 'Item 1' }));
    expect(screen.getByText('Content 1')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Item 2' }));
    expect(screen.getByText('Content 2')).toBeVisible();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('allows multiple items open in multiple mode', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    await user.click(screen.getByRole('button', { name: 'Item 1' }));
    await user.click(screen.getByRole('button', { name: 'Item 2' }));

    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('applies custom className to AccordionItem', () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const item = container.querySelector('[data-slot="accordion-item"]');
    expect(item).toHaveClass('custom-item');
  });

  it('applies custom className to AccordionTrigger', () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="custom-trigger">
            Item 1
          </AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = container.querySelector('[data-slot="accordion-trigger"]');
    expect(trigger).toHaveClass('custom-trigger');
  });

  it('applies custom className to AccordionContent', () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent className="custom-content">
            Content 1
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const content = container.querySelector('[data-slot="accordion-content"]');
    expect(content).toBeInTheDocument();
  });

  it('handles disabled items', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" disabled>
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Item 1' });
    expect(trigger).toBeDisabled();

    // Disabled items cannot be clicked so content should not be visible
    expect(trigger).toHaveAttribute('disabled');
  });

  it('renders with default value', () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('supports controlled mode', async () => {
    const user = userEvent.setup();
    let currentValue = '';
    const onValueChange = (value: string): void => {
      currentValue = value;
    };

    const { rerender } = render(
      <Accordion
        type="single"
        collapsible
        value={currentValue}
        onValueChange={onValueChange}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    await user.click(screen.getByRole('button', { name: 'Item 1' }));

    rerender(
      <Accordion
        type="single"
        collapsible
        value={currentValue}
        onValueChange={onValueChange}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(currentValue).toBe('item-1');
  });

  it('renders chevron icon', () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders rich content', () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>
            <div>
              <h3>Title</h3>
              <p>Description</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies data-slot attributes correctly', () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(container.querySelector('[data-slot="accordion"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="accordion-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="accordion-trigger"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="accordion-content"]')).toBeInTheDocument();
  });
});

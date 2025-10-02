import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './Pagination';

describe('Pagination', () => {
  it('renders pagination component', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders pagination with aria-label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByLabelText('pagination')).toBeInTheDocument();
  });

  it('renders pagination links', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders active page', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const activePage = screen.getByText('1').closest('a');
    expect(activePage).toHaveAttribute('aria-current', 'page');
    expect(activePage).toHaveAttribute('data-active', 'true');
  });

  it('renders previous button', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
  });

  it('renders next button', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('renders ellipsis', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const ellipsis = container.querySelector('[data-slot="pagination-ellipsis"]');
    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis).toHaveAttribute('aria-hidden');
  });

  it('handles click on pagination link', async () => {
    const handleClick = vi.fn((e) => e.preventDefault());
    const user = userEvent.setup();

    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" onClick={handleClick}>
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    await user.click(screen.getByText('1'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles click on previous button', async () => {
    const handleClick = vi.fn((e) => e.preventDefault());
    const user = userEvent.setup();

    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={handleClick} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    await user.click(screen.getByLabelText('Go to previous page'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles click on next button', async () => {
    const handleClick = vi.fn((e) => e.preventDefault());
    const user = userEvent.setup();

    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="#" onClick={handleClick} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    await user.click(screen.getByLabelText('Go to next page'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className to Pagination', () => {
    const { container } = render(
      <Pagination className="custom-pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const pagination = container.querySelector('[data-slot="pagination"]');
    expect(pagination).toHaveClass('custom-pagination');
  });

  it('applies custom className to PaginationContent', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent className="custom-content">
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const content = container.querySelector('[data-slot="pagination-content"]');
    expect(content).toHaveClass('custom-content');
  });

  it('applies custom className to PaginationLink', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" className="custom-link">
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const link = container.querySelector('[data-slot="pagination-link"]');
    expect(link).toHaveClass('custom-link');
  });

  it('applies custom className to PaginationPrevious', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" className="custom-prev" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const prevButton = screen.getByLabelText('Go to previous page');
    expect(prevButton).toHaveClass('custom-prev');
  });

  it('applies custom className to PaginationNext', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="#" className="custom-next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).toHaveClass('custom-next');
  });

  it('renders complete pagination', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('applies data-slot attributes correctly', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(container.querySelector('[data-slot="pagination"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="pagination-content"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="pagination-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="pagination-link"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="pagination-ellipsis"]')).toBeInTheDocument();
  });

  it('has screen reader text in ellipsis', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByText('More pages')).toHaveClass('sr-only');
  });

  it('supports different sizes for PaginationLink', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" size="sm">
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" size="default">
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" size="lg">
              3
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const links = container.querySelectorAll('[data-slot="pagination-link"]');
    expect(links).toHaveLength(3);
  });

  it('renders icons in previous and next buttons', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});

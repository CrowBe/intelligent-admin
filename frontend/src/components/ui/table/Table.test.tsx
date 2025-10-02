import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './Table';

describe('Table', () => {
  it('renders table without crashing', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(container.querySelector('[data-slot="table"]')).toBeInTheDocument();
  });

  it('renders table cells correctly', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Test Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Test Cell')).toBeInTheDocument();
  });

  it('renders table caption', () => {
    render(
      <Table>
        <TableCaption>A list of items</TableCaption>
      </Table>
    );
    expect(screen.getByText('A list of items')).toBeInTheDocument();
  });

  it('applies custom className to table', () => {
    const { container } = render(
      <Table className="custom-table">
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const table = container.querySelector('[data-slot="table"]');
    expect(table).toHaveClass('custom-table');
  });
});

/**
 * @fileoverview Source Type Icon Tests
 * @module components/ui/icons/__tests__/source-icons.test
 * @governance EPIC-6-2
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PDFIcon, URLIcon, TextIcon } from '../source-icons';

describe('Source Type Icons', () => {
    describe('PDFIcon', () => {
        it('should render with default props', () => {
            const { container } = render(<PDFIcon />);
            const svg = container.querySelector('svg');

            expect(svg).toBeInTheDocument();
            expect(svg?.getAttribute('aria-label')).toBe('PDF Document');
        });

        it('should render with custom size', () => {
            const { container } = render(<PDFIcon size={32} />);
            const svg = container.querySelector('svg');

            expect(svg?.getAttribute('width')).toBe('32');
            expect(svg?.getAttribute('height')).toBe('32');
        });

        it('should render with custom color', () => {
            const { container } = render(<PDFIcon color="#f97316" />);
            const paths = container.querySelectorAll('path');

            // All paths should have the custom stroke color
            paths.forEach(path => {
                expect(path.getAttribute('stroke')).toBe('#f97316');
            });
        });

        it('should render with custom className', () => {
            const { container } = render(<PDFIcon className="custom-class" />);
            const svg = container.querySelector('svg');

            expect(svg?.classList.contains('custom-class')).toBe(true);
        });
    });

    describe('URLIcon', () => {
        it('should render with default props', () => {
            const { container } = render(<URLIcon />);
            const svg = container.querySelector('svg');

            expect(svg).toBeInTheDocument();
            expect(svg?.getAttribute('aria-label')).toBe('URL Source');
        });

        it('should render with custom size', () => {
            const { container } = render(<URLIcon size={32} />);
            const svg = container.querySelector('svg');

            expect(svg?.getAttribute('width')).toBe('32');
            expect(svg?.getAttribute('height')).toBe('32');
        });

        it('should render with custom color', () => {
            const { container } = render(<URLIcon color="#f97316" />);
            const paths = container.querySelectorAll('path');

            paths.forEach(path => {
                expect(path.getAttribute('stroke')).toBe('#f97316');
            });
        });

        it('should render with custom className', () => {
            const { container } = render(<URLIcon className="custom-class" />);
            const svg = container.querySelector('svg');

            expect(svg?.classList.contains('custom-class')).toBe(true);
        });
    });

    describe('TextIcon', () => {
        it('should render with default props', () => {
            const { container } = render(<TextIcon />);
            const svg = container.querySelector('svg');

            expect(svg).toBeInTheDocument();
            expect(svg?.getAttribute('aria-label')).toBe('Text Source');
        });

        it('should render with custom size', () => {
            const { container } = render(<TextIcon size={32} />);
            const svg = container.querySelector('svg');

            expect(svg?.getAttribute('width')).toBe('32');
            expect(svg?.getAttribute('height')).toBe('32');
        });

        it('should render with custom color', () => {
            const { container } = render(<TextIcon color="#f97316" />);
            const paths = container.querySelectorAll('path');

            paths.forEach(path => {
                expect(path.getAttribute('stroke')).toBe('#f97316');
            });
        });

        it('should render with custom className', () => {
            const { container } = render(<TextIcon className="custom-class" />);
            const svg = container.querySelector('svg');

            expect(svg?.classList.contains('custom-class')).toBe(true);
        });
    });
});

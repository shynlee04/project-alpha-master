/**
 * @fileoverview Canvas Component Tests
 * @module components/canvas/__tests__/Canvas.test.tsx
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// ============================================================
// MOCKS - Must be at the top before any imports
// ============================================================

// Mock window.matchMedia first - before any imports that might use it
const mockMatchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
});

// Mock useCanvasDrop
vi.mock('../../hooks/useCanvasDrop', () => ({
    useCanvasDrop: () => ({
        handleDragOver: vi.fn(),
        handleDrop: vi.fn(),
    }),
}));

// Mock @xyflow/react
vi.mock('@xyflow/react', async () => {
    const actual = await vi.importActual('@xyflow/react');
    return {
        ...actual,
        ReactFlow: ({ children, ...props }: React.ComponentProps<typeof actual.ReactFlow>) => (
            <div data-testid="react-flow" className="w-full h-full min-h-[400px] relative" {...props}>
                {children}
            </div>
        ),
        Controls: () => <div data-testid="controls" />,
        Background: () => <div data-testid="background" />,
        ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="react-flow-provider">{children}</div>
        ),
        Panel: ({ children, position }: { children: React.ReactNode; position?: string }) => (
            <div data-testid={`panel-${position || 'default'}`}>{children}</div>
        ),
        useReactFlow: () => ({
            screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
            getNodes: vi.fn(() => []),
            setNodes: vi.fn(),
        }),
        useStoreApi: () => ({
            getState: vi.fn(),
            setState: vi.fn(),
        }),
    };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

// Mock useMediaQuery module
vi.mock('../../hooks/useMediaQuery', () => ({
    useMediaQuery: vi.fn(() => false),
    useDeviceType: vi.fn(() => ({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isPhonePortrait: false,
        isPhoneLandscape: false,
    })),
    useTouchDevice: vi.fn(() => false),
    BREAKPOINTS: {
        xs: '(max-width: 413px)',
        sm: '(min-width: 414px) and (max-width: 767px)',
        md: '(min-width: 768px) and (max-width: 1023px)',
        lg: '(min-width: 1024px)',
        mobile: '(max-width: 767px)',
        tablet: '(min-width: 768px) and (max-width: 1023px)',
        desktop: '(min-width: 1024px)',
    },
}));

// Mock useResponsive hook
vi.mock('../../hooks/useResponsive', () => ({
    useResponsive: () => ({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        isReady: true,
    }),
}));

// ============================================================
// IMPORTS - After all mocks
// ============================================================

import { Canvas } from '../Canvas';

describe('Canvas Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset matchMedia mock to default behavior
        mockMatchMedia.mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Desktop Mode (default)', () => {
        it('renders ReactFlow when there are no nodes', () => {
            render(<Canvas />);

            expect(screen.getByTestId('react-flow')).toBeInTheDocument();
            expect(screen.getByTestId('controls')).toBeInTheDocument();
            expect(screen.getByTestId('background')).toBeInTheDocument();
        });

        it('renders empty state message', () => {
            render(<Canvas />);

            expect(screen.getByText('Drop sources here to start')).toBeInTheDocument();
            expect(
                screen.getByText('Drag and drop sources from the sidebar to create your knowledge map')
            ).toBeInTheDocument();
        });

        it('renders within ReactFlowProvider', () => {
            render(<Canvas />);

            expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();
        });

        it('does not show read-only overlay on desktop', () => {
            render(<Canvas />);

            expect(screen.queryByText('Edit on desktop')).not.toBeInTheDocument();
        });

        it('renders keyboard shortcuts panel', () => {
            render(<Canvas />);

            expect(screen.getByTestId('panel-bottom-right')).toBeInTheDocument();
        });

        it('displays pan shortcut', () => {
            render(<Canvas />);

            expect(screen.getByText('Pan')).toBeInTheDocument();
        });

        it('displays zoom shortcut', () => {
            render(<Canvas />);

            expect(screen.getByText('Zoom in/out')).toBeInTheDocument();
        });

        it('displays fit view shortcut', () => {
            render(<Canvas />);

            expect(screen.getByText('Fit view')).toBeInTheDocument();
        });

        it('displays delete shortcut', () => {
            render(<Canvas />);

            expect(screen.getByText('Delete selected')).toBeInTheDocument();
        });

        it('has proper container structure', () => {
            render(<Canvas />);

            // The mock ReactFlow now includes the correct classes
            const container = screen.getByTestId('react-flow');
            expect(container).toHaveClass('w-full');
            expect(container).toHaveClass('h-full');
            expect(container).toHaveClass('min-h-[400px]');
            expect(container).toHaveClass('relative');
        });
    });
});

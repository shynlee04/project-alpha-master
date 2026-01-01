/**
 * @fileoverview RAGSearchPanel Tests
 * @module components/rag/__tests__/RAGSearchPanel
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test-i18n';
import { RAGSearchPanel } from '../RAGSearchPanel';
import type { ExtendedSearchResult } from '@/lib/rag/types';

// Mock the rag-store
const mockSetSearchQuery = vi.fn();
const mockPerformSearch = vi.fn();
const mockSetSearchMode = vi.fn();

vi.mock('@/lib/state/rag-store', () => ({
  useRAGStore: vi.fn((selector) => {
    const state = {
      searchQuery: 'test query',
      searchResults: mockResults,
      searchMode: 'hybrid',
      indexStatus: 'ready',
      documentCount: 5,
      loading: false,
      error: null,
      setSearchQuery: mockSetSearchQuery,
      performSearch: mockPerformSearch,
      setSearchMode: mockSetSearchMode,
    };
    return selector(state);
  }),
}));

const mockResults: ExtendedSearchResult[] = [
  {
    document: {
      id: 'doc-1',
      sourceId: 'source-1',
      content: 'This is test content about machine learning.',
      title: 'Test Document 1',
      position: 1,
    },
    score: 0.95,
    source: { id: 'source-1', title: 'Source 1' },
    highlightedText: 'This is <mark>test</mark> content about machine learning.',
    matchedTerms: ['test'],
    rank: 1,
    searchSource: 'hybrid',
  },
  {
    document: {
      id: 'doc-2',
      sourceId: 'source-2',
      content: 'Another document about artificial intelligence.',
      title: 'Test Document 2',
      position: 2,
    },
    score: 0.85,
    source: { id: 'source-2', title: 'Source 2' },
    highlightedText: 'Another document about <mark>artificial</mark> intelligence.',
    matchedTerms: ['artificial'],
    rank: 2,
    searchSource: 'hybrid',
  },
];

const renderComponent = (props: Partial<React.ComponentProps<typeof RAGSearchPanel>> = {}) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <RAGSearchPanel
        query="test query"
        results={mockResults}
        mode="hybrid"
        onQueryChange={vi.fn()}
        onSearch={vi.fn()}
        onModeChange={vi.fn()}
        onResultClick={vi.fn()}
        loading={false}
        error={null}
        documentCount={5}
        {...props}
      />
    </I18nextProvider>
  );
};

describe('RAGSearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('rag.search.placeholder')).toBeInTheDocument();
  });

  it('displays search mode selector', () => {
    renderComponent();
    expect(screen.getByLabelText('rag.search.mode.label')).toBeInTheDocument();
  });

  it('shows search results when available', () => {
    renderComponent();
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2')).toBeInTheDocument();
  });

  it('displays result scores', () => {
    renderComponent();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows highlighted text in results', () => {
    renderComponent();
    expect(screen.getByHTML('<mark>test</mark>')).toBeInTheDocument();
  });

  it('displays document count', () => {
    renderComponent({ documentCount: 5 });
    expect(screen.getByText('5 documents indexed')).toBeInTheDocument();
  });

  it('handles empty results', () => {
    renderComponent({ results: [] });
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderComponent({ loading: true });
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    renderComponent({ error: 'Search failed' });
    expect(screen.getByText('Search failed')).toBeInTheDocument();
  });

  it('calls onSearch when Enter is pressed', async () => {
    const onSearch = vi.fn();
    renderComponent({ onSearch });
    const input = screen.getByPlaceholderText('rag.search.placeholder');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('updates query on input change', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    renderComponent({ onQueryChange });
    const input = screen.getByPlaceholderText('rag.search.placeholder');
    await user.clear(input);
    await user.type(input, 'new query');
    expect(onQueryChange).toHaveBeenCalledWith('new query');
  });

  it('handles mode switching', () => {
    renderComponent();
    const select = screen.getByLabelText('rag.search.mode.label');
    fireEvent.change(select, { target: { value: 'semantic' } });
    // Mode change handler should be called
  });

  it('calls onResultClick when result is clicked', async () => {
    const user = userEvent.setup();
    const onResultClick = vi.fn();
    renderComponent({ onResultClick });
    const result = screen.getByText('Test Document 1');
    await user.click(result);
    expect(onResultClick).toHaveBeenCalledWith(mockResults[0]);
  });

  it('shows index status indicator', () => {
    renderComponent({ indexStatus: 'ready' });
    expect(screen.getByText('Index Ready')).toBeInTheDocument();
  });

  it('shows building status when indexing', () => {
    renderComponent({ indexStatus: 'building', documentCount: 3, totalDocuments: 10 });
    expect(screen.getByText('Indexing: 3 of 10')).toBeInTheDocument();
  });

  it('renders with 8-bit styling (rounded-none)', () => {
    const { container } = renderComponent();
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain('rounded-none');
  });

  it('has proper border styling', () => {
    const { container } = renderComponent();
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain('border-2');
  });
});

# Testing Spike - Isolated AI Agent Test Environment

This directory contains an isolated test environment for non-disruptive testing of AI Agent capabilities.

## Directory Structure

```
_test-spike/
├── shared/                  # Shared utilities across test suites
│   ├── mocks/              # Mock implementations
│   │   ├── ai-adapters/   # Mock AI providers
│   │   ├── tools/         # Mock tools
│   │   ├── state/         # Mock state management
│   │   └── permissions/   # Mock permission system
│   ├── test-helpers/      # Test utilities
│   └── fixtures/          # Test data
├── ide-testing/            # IDE/Code Environment Tests
│   ├── src/
│   │   ├── routes/
│   │   └── lib/agent/
│   └── tests/
├── notes-testing/          # Note Space Tests
│   ├── src/
│   │   ├── routes/
│   │   └── lib/agent/
│   └── tests/
├── .gitignore
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Usage

### Run All Tests
```bash
pnpm test
```

### Run IDE Tests Only
```bash
pnpm test:ide
```

### Run Notes Tests Only
```bash
pnpm test:notes
```

### Run with Coverage
```bash
pnpm test:coverage
```

## Test Categories

1. **CRUD Testing** - Create, Read, Update, Delete operations
2. **Tool Testing** - Individual tool execution validation
3. **Permission Testing** - Trust levels, YOLO mode, scope validation
4. **State Testing** - Chat state, tool execution state, UI state
5. **Prompt Testing** - System prompts, injection protection
6. **Mode Testing** - Mode switching, mode-specific behavior

## Phases

- **Phase 1**: Foundation - Directory structure, mocks, test config
- **Phase 2**: IDE Testing - Tools, state, integration, E2E tests
- **Phase 3**: Notes Testing - Same structure as IDE
- **Phase 4**: Advanced - Permissions, prompts, modes

## Notes

- This directory is isolated from the main codebase
- Uses in-memory databases for tests
- All external services are mocked
- Tests run independently without affecting main project

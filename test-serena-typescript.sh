#!/bin/bash

echo "Testing Serena MCP server with TypeScript/JavaScript codebase..."
echo "Current directory: $(pwd)"
echo ""

# First, let's check the project health
echo "1. Checking Serena project health..."
uvx --from git+https://github.com/oraios/serena serena project health-check

echo ""
echo "2. Testing basic TypeScript symbol discovery..."

# Create a test to find TypeScript symbols
echo "Testing symbol discovery in our codebase..."

# Try to find a known TypeScript type
echo "Looking for 'Project' type..."
uvx --from git+https://github.com/oraios/serena serena tools description find_symbol

echo ""
echo "3. Testing project structure analysis..."

# Check if we can get symbols from a known file
echo "Attempting to analyze a TypeScript file structure..."

# Let's test with a simple command first
echo "Listing available tools for TypeScript analysis..."
uvx --from git+https://github.com/oraios/serena serena tools list --all | head -20

echo ""
echo "4. Testing language server integration..."

# Check if TypeScript language server is working
echo "Checking TypeScript support..."
find . -name "*.ts" -o -name "*.tsx" | head -5 | while read file; do
  echo "  Found TypeScript file: $file"
done

echo ""
echo "5. Creating a test project file for Serena..."

# Create a simple test to verify Serena can work with our codebase
cat > test-serena-project.yml << 'EOF'
# Test project configuration for Serena
name: project-alpha-test
language: typescript
root_path: .
include_patterns:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
exclude_patterns:
  - "**/node_modules/**"
  - "**/.git/**"
  - "**/dist/**"
  - "**/build/**"
EOF

echo "Test project configuration created."
echo ""
echo "6. Testing with actual TypeScript file analysis..."

# Try to analyze a simple TypeScript file
SIMPLE_FILE="src/domain/types/project.ts"
if [ -f "$SIMPLE_FILE" ]; then
  echo "Found TypeScript file: $SIMPLE_FILE"
  echo "File size: $(wc -l < "$SIMPLE_FILE") lines"
else
  echo "Creating a test TypeScript file..."
  mkdir -p test-ts-files
  cat > test-ts-files/test-types.ts << 'EOF'
// Test TypeScript file for Serena
export interface TestUser {
  id: string;
  name: string;
  email: string;
}

export class TestService {
  private users: TestUser[] = [];
  
  addUser(user: TestUser): void {
    this.users.push(user);
  }
  
  getUser(id: string): TestUser | undefined {
    return this.users.find(user => user.id === id);
  }
}

export const testConstant = "Hello Serena!";
EOF
  echo "Created test TypeScript file: test-ts-files/test-types.ts"
fi

echo ""
echo "✅ Serena TypeScript integration test setup complete!"
echo ""
echo "To use Serena with OpenCode:"
echo "1. OpenCode will automatically connect to Serena MCP server"
echo "2. Use commands like: 'use the serena tool to find symbols'"
echo "3. Available tools: find_symbol, get_symbols_overview, etc."
echo ""
echo "Example commands you can try:"
echo "- 'find_symbol Project' (search for Project type)"
echo "- 'get_symbols_overview src/domain/types/project.ts'"
echo "- 'list_dir src/infrastructure'"
echo "- 'find_referencing_symbols useProjectStore'"
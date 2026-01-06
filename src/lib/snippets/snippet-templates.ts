/**
 * @fileoverview Built-in Snippet Templates
 * @module lib/snippets/snippet-templates
 * @governance S-031
 * @ai-observable true
 *
 * Built-in code snippet templates for common patterns.
 * These snippets are read-only and cannot be modified by users.
 *
 * Story S-031: Code Snippets Manager
 */

import type { CodeSnippetRecord, SnippetTemplate } from '@/infrastructure/persistence/dexie-db-snippet-types';

// ============================================================================
// React Snippets
// ============================================================================

const reactSnippets: SnippetTemplate[] = [
    {
        name: 'React Functional Component',
        description: 'Basic functional component with props',
        language: 'typescript',
        code: `import React from 'react';

interface ${1:ComponentName}Props {
    ${2:prop1}: string;
    ${3:prop2}?: number;
}

export function ${1:ComponentName}({ ${2:prop1}, ${3:prop2} }: ${1:ComponentName}Props) {
    return (
        <div className="${4:className}">
            <h1>{${2:prop1}}</h1>
        </div>
    );
}`,
        tags: ['react', 'component', 'typescript'],
        folder: 'react/components',
        shortcut: 'rfc',
    },
    {
        name: 'React Hook',
        description: 'Custom React hook with state',
        language: 'typescript',
        code: `import { useState, useEffect } from 'react';

export function use${1:HookName}(${2:initialValue}: ${3:string}) {
    const [value, setValue] = useState<${3:string}>(${2:initialValue});

    useEffect(() => {
        // Effect logic here
    }, []);

    return { value, setValue };
}`,
        tags: ['react', 'hook', 'typescript'],
        folder: 'react/hooks',
        shortcut: 'hook',
    },
    {
        name: 'React Context',
        description: 'Context provider with custom hook',
        language: 'typescript',
        code: `import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ${1:ContextName}ContextType {
    ${2:state}: ${3:string};
    ${4:setState}: (value: ${3:string}) => void;
}

const ${1:ContextName}Context = createContext<${1:ContextName}ContextType | undefined>(undefined);

export function ${1:ContextName}Provider({ children }: { children: ReactNode }) {
    const [${2:state}, ${4:setState}] = useState<${3:string}>('${5:initial}');

    return (
        <${1:ContextName}Context.Provider value={{ ${2:state}, ${4:setState} }}>
            {children}
        </${1:ContextName}Context.Provider>
    );
}

export function use${1:ContextName}() {
    const context = useContext(${1:ContextName}Context);
    if (!context) {
        throw new Error('use${1:ContextName} must be used within ${1:ContextName}Provider');
    }
    return context;
}`,
        tags: ['react', 'context', 'typescript'],
        folder: 'react/context',
        shortcut: 'ctx',
    },
    {
        name: 'React useEffect',
        description: 'useEffect hook with cleanup',
        language: 'typescript',
        code: `useEffect(() => {
    // Setup logic
    const ${1:subscription} = ${2:subscribeToSomething}();

    return () => {
        // Cleanup logic
        ${1:subscription}?.unsubscribe();
    };
}, [${3:dependencies}]);`,
        tags: ['react', 'hook', 'effect'],
        folder: 'react/hooks',
        shortcut: 'ueffect',
    },
    {
        name: 'React useState',
        description: 'useState hook with TypeScript type',
        language: 'typescript',
        code: `const [${1:state}, ${2:setState}] = useState<${3:string}>('${4:initialValue}');`,
        tags: ['react', 'hook', 'state'],
        folder: 'react/hooks',
        shortcut: 'ustate',
    },
];

// ============================================================================
// TypeScript Snippets
// ============================================================================

const typescriptSnippets: SnippetTemplate[] = [
    {
        name: 'TypeScript Interface',
        description: 'Interface definition with optional properties',
        language: 'typescript',
        code: `interface ${1:InterfaceName} {
    ${2:property1}: ${3:string};
    ${4:property2}?: ${5:number};
    ${6:method}?: (${7:param}: ${8:string}) => ${9:void};
}`,
        tags: ['typescript', 'interface'],
        folder: 'typescript/types',
        shortcut: 'ints',
    },
    {
        name: 'TypeScript Type',
        description: 'Type alias with union types',
        language: 'typescript',
        code: `type ${1:TypeName} = ${2:'value1' | 'value2' | 'value3'};`,
        tags: ['typescript', 'type'],
        folder: 'typescript/types',
        shortcut: 'type',
    },
    {
        name: 'Generic Function',
        description: 'Generic function with constraints',
        language: 'typescript',
        code: `function ${1:functionName}<T extends ${2:object}>(${3:param}: T): ${4:T} {
    return ${3:param};
}`,
        tags: ['typescript', 'generic'],
        folder: 'typescript/functions',
        shortcut: 'gen',
    },
    {
        name: 'Async Function',
        description: 'Async function with error handling',
        language: 'typescript',
        code: `async function ${1:functionName}(${2:params}): Promise<${3:ReturnType}> {
    try {
        const result = await ${4:asyncOperation}();
        return result;
    } catch (error) {
        console.error('Error in ${1:functionName}:', error);
        throw error;
    }
}`,
        tags: ['typescript', 'async'],
        folder: 'typescript/functions',
        shortcut: 'async',
    },
];

// ============================================================================
// Utility Snippets
// ============================================================================

const utilitySnippets: SnippetTemplate[] = [
    {
        name: 'Debounce Function',
        description: 'Debounce utility for performance',
        language: 'typescript',
        code: `function ${1:debounce}<T extends (...args: any[]) => any>(
    func: T,
    wait: ${2:number}
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}`,
        tags: ['utility', 'performance'],
        folder: 'utilities/performance',
        shortcut: 'debounce',
    },
    {
        name: 'Throttle Function',
        description: 'Throttle utility for performance',
        language: 'typescript',
        code: `function ${1:throttle}<T extends (...args: any[]) => any>(
    func: T,
    limit: ${2:number}
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}`,
        tags: ['utility', 'performance'],
        folder: 'utilities/performance',
        shortcut: 'throttle',
    },
    {
        name: 'Deep Clone',
        description: 'Deep clone object',
        language: 'typescript',
        code: `function ${1:deepClone}<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
        return obj.map((item) => ${1:deepClone}(item)) as T;
    }

    const clonedObj = {} as T;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = ${1:deepClone}(obj[key]);
        }
    }

    return clonedObj;
}`,
        tags: ['utility', 'object'],
        folder: 'utilities/object',
        shortcut: 'clone',
    },
    {
        name: 'Format Date',
        description: 'Format date to locale string',
        language: 'typescript',
        code: `function ${1:formatDate}(date: ${2:Date}, locale: ${3:string} = '${4:en-US}'): string {
    return new Intl.DateTimeFormat(${3:locale}, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}`,
        tags: ['utility', 'date'],
        folder: 'utilities/date',
        shortcut: 'fmtdate',
    },
];

// ============================================================================
// Testing Snippets
// ============================================================================

const testingSnippets: SnippetTemplate[] = [
    {
        name: 'Vitest Test',
        description: 'Basic Vitest test case',
        language: 'typescript',
        code: `import { describe, it, expect } from 'vitest';

describe('${1:FeatureName}', () => {
    it('${2:should do something}', () => {
        // Arrange
        const ${3:input} = ${4:value};

        // Act
        const ${5:result} = ${6:functionUnderTest}(${3:input});

        // Assert
        expect(${5:result}).toBe(${7:expected});
    });
});`,
        tags: ['testing', 'vitest'],
        folder: 'testing/vitest',
        shortcut: 'test',
    },
    {
        name: 'React Testing Library',
        description: 'React component test',
        language: 'typescript',
        code: `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ${1:ComponentName} } from './${1:ComponentName}';

describe('${1:ComponentName}', () => {
    it('should render correctly', () => {
        render(<${1:ComponentName} ${2:prop}="${3:value}" />);

        expect(screen.getByText('${3:value}')).toBeInTheDocument();
    });

    it('should handle ${4:interaction}', async () => {
        const ${5:user} = userEvent.setup();
        render(<${1:ComponentName} />);

        const ${6:button} = screen.getByRole('button', { name: '${7:Click me}' });
        await ${5:user}.click(${6:button});

        expect(screen.getByText('${8:Clicked}')).toBeInTheDocument();
    });
});`,
        tags: ['testing', 'react', 'rtl'],
        folder: 'testing/react',
        shortcut: 'rt',
    },
];

// ============================================================================
// API Snippets
// ============================================================================

const apiSnippets: SnippetTemplate[] = [
    {
        name: 'Fetch with Error Handling',
        description: 'Fetch API with error handling',
        language: 'typescript',
        code: `async function ${1:fetchData}<T>(${2:url}: string): Promise<T> {
    try {
        const response = await fetch(${2:url});

        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
}`,
        tags: ['api', 'fetch'],
        folder: 'api/fetch',
        shortcut: 'fetch',
    },
    {
        name: 'Axios Request',
        description: 'Axios GET request with error handling',
        language: 'typescript',
        code: `import axios from 'axios';

async function ${1:getData}<T>(${2:url}: string): Promise<T> {
    try {
        const response = await axios.get<T>(${2:url});
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('API Error:', error.response?.data);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
}`,
        tags: ['api', 'axios'],
        folder: 'api/axios',
        shortcut: 'axios',
    },
];

// ============================================================================
// TanStack Query Snippets
// ============================================================================

const querySnippets: SnippetTemplate[] = [
    {
        name: 'Use Query',
        description: 'TanStack Query hook for data fetching',
        language: 'typescript',
        code: `import { useQuery } from '@tanstack/react-query';

function ${1:ComponentName}() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['${2:resource}'],
        queryFn: async () => {
            const response = await fetch('/api/${2:resource}');
            return response.json();
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    return <div>{/* Render data */}</div>;
}`,
        tags: ['tanstack', 'query', 'react'],
        folder: 'tanstack/query',
        shortcut: 'useq',
    },
    {
        name: 'Use Mutation',
        description: 'TanStack Query mutation hook',
        language: 'typescript',
        code: `import { useMutation, useQueryClient } from '@tanstack/react-query';

function ${1:ComponentName}() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (${2:data}: ${3:DataType}) => {
            const response = await fetch('/api/${4:resource}', {
                method: 'POST',
                body: JSON.stringify(${2:data}),
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['${4:resource}'] });
        },
    });

    return (
        <button onClick={() => mutation.mutate(${5:data})}>
            ${6:Create}
        </button>
    );
}`,
        tags: ['tanstack', 'mutation', 'react'],
        folder: 'tanstack/query',
        shortcut: 'usem',
    },
];

// ============================================================================
// Built-in Snippets Export
// ============================================================================

/**
 * Convert template to record format
 */
function templateToRecord(template: SnippetTemplate): CodeSnippetRecord {
    return {
        id: `builtin-${template.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...template,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isBuiltIn: true,
    };
}

/**
 * All built-in snippets combined
 */
export const BUILT_IN_SNIPPETS: CodeSnippetRecord[] = [
    ...reactSnippets.map(templateToRecord),
    ...typescriptSnippets.map(templateToRecord),
    ...utilitySnippets.map(templateToRecord),
    ...testingSnippets.map(templateToRecord),
    ...apiSnippets.map(templateToRecord),
    ...querySnippets.map(templateToRecord),
];

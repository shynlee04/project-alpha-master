import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BentoGrid, BentoCardPreview } from './BentoGrid'
import { CodeBlock } from '@/components/chat/CodeBlock'
import type { BentoCard, BentoTopic } from './BentoGrid'

/**
 * BentoGridExample
 * 
 * Example usage of BentoGrid component for Via-gent discovery interface.
 * Demonstrates different card variants, topic categorization, and interactive previews.
 * 
 * @example
 * ```tsx
 * <BentoGridExample />
 * ```
 */
export function BentoGridExample() {
  const { t } = useTranslation()
  const [selectedTopic, setSelectedTopic] = useState<BentoTopic | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample bento cards for demonstration
  const sampleCards: BentoCard[] = [
    {
      id: 'getting-started-1',
      title: t('bentoGrid.topicGettingStarted'),
      topic: 'getting-started',
      size: 'large',
      icon: '🚀',
      description: 'Quick start guide for Via-gent',
      preview: {
        type: 'code',
        language: 'typescript',
        code: `// Welcome to Via-gent!
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <h1>Via-gent IDE</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  )
}`,
        quickStart: () => console.log('Starting tutorial...')
      }
    },
    {
      id: 'file-ops-1',
      title: 'File Operations',
      topic: 'file-operations',
      size: 'medium',
      icon: '📁',
      description: 'Manage and edit your project files',
      preview: {
        type: 'code',
        language: 'bash',
        code: `# File Operations Commands

# Create new file
touch src/components/NewFile.tsx

# Edit file
code src/components/NewFile.tsx

# Delete file
rm src/components/OldFile.tsx

# List files
ls -la src/components/`,
        quickStart: () => console.log('Opening file explorer...')
      }
    },
    {
      id: 'ai-agent-1',
      title: t('bentoGrid.topicAIAgent'),
      topic: 'ai-agent',
      size: 'medium',
      icon: '🤖',
      description: 'Configure and use AI coding assistants',
      preview: {
        type: 'code',
        language: 'typescript',
        code: `// AI Agent Configuration
import { useAgentChat } from '@/lib/agent/hooks'

function AgentChat() {
  const { sendMessage, isThinking } = useAgentChat()
  
  return (
    <div>
      <button disabled={isThinking}>
        {isThinking ? 'Thinking...' : 'Send Message'}
      </button>
    </div>
  )
}`,
        quickStart: () => console.log('Opening agent panel...')
      }
    },
    {
      id: 'terminal-1',
      title: t('bentoGrid.topicTerminal'),
      topic: 'terminal',
      size: 'small',
      icon: '⌨️',
      description: 'Run commands in integrated terminal',
      preview: {
        type: 'code',
        language: 'bash',
        code: `# Terminal Commands

# Start development server
npm run dev

# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build`,
        quickStart: () => console.log('Opening terminal...')
      }
    },
    {
      id: 'settings-1',
      title: t('bentoGrid.topicSettings'),
      topic: 'settings',
      size: 'small',
      icon: '⚙️',
      description: 'Customize your IDE preferences',
      preview: {
        type: 'code',
        language: 'json',
        code: `{
  "editor": {
    "theme": "dark",
    "fontSize": 14,
    "tabSize": 2
  },
  "terminal": {
    "shell": "/bin/bash",
    "fontSize": 12
  }
}`,
        quickStart: () => console.log('Opening settings...')
      }
    }
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleTopicFilter = (topic: BentoTopic | 'all') => {
    setSelectedTopic(topic)
  }

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('bentoGrid.title')}
          </h1>
          <p className="text-muted-foreground mb-6">
            Discover Via-gent's features through interactive cards
          </p>
        </div>

        <BentoGrid
          cards={sampleCards}
          searchQuery={searchQuery}
          selectedTopic={selectedTopic}
          onSearchChange={handleSearch}
          onTopicFilter={handleTopicFilter}
        />
      </div>
    </div>
  )
}

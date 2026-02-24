# LLM Context Window Management & Compaction Algorithms Research

**Research ID:** `RSCH-CTX-MGT-2026-01-25`
**Created:** 2026-01-25
**Analyst:** analyst-ext
**Topic:** Context window management, compaction algorithms, token tracking, streaming UI patterns

---

## Executive Summary

This research covers five key areas for building production-ready LLM chat applications:

1. **Context Compaction Algorithms** - How to compress conversation history intelligently
2. **Token Tracking Methods** - Real-time usage monitoring and cost calculation
3. **Streaming Thinking UI** - Rendering reasoning/thinking content
4. **Tool Output Display Patterns** - Collapsible results with status indicators
5. **Virtual Scrolling** - Handling long conversations efficiently

Key recommendations:
- **Compaction:** Use `StreamingLLM` for KV cache management, `LLMLingua` for prompt compression
- **Token Counting:** Use `js-tiktoken` for client-side estimation
- **Streaming Markdown:** Use `Streamdown` instead of `react-markdown` for incomplete syntax
- **Virtual Scrolling:** Use `React Virtuoso` for chat-specific features

---

## 1. Context Compaction Algorithms

Context compaction (or context compression) enables LLMs to handle longer conversations by reducing token count or managing memory efficiently.

### 1.1 Token-Level Compression

These techniques reduce tokens *before* LLM processing:

| Algorithm | Approach | Compression Ratio | Best For |
|-----------|----------|-------------------|----------|
| **LLMLingua** | Perplexity-based token removal | 2-4x | RAG, long instructions |
| **LongLLMLingua** | RAG-aware rearrangement | 3-5x | Long-context RAG |
| **Selective Context** | Self-information (entropy) filtering | 2-3x | General compression |

**LLMLingua Implementation Concept:**
```javascript
// Pseudo-code for LLMLingua-style compression
async function compressPrompt(prompt, compressionRatio = 0.25) {
  const tokens = await tokenize(prompt);
  const perplexities = await calculatePerplexity(tokens);
  
  // Keep tokens with highest perplexity (most informative)
  const sortedIndices = argsort(perplexities).reverse();
  const keepCount = Math.floor(tokens.length * compressionRatio);
  const keptIndices = sortedIndices.slice(0, keepCount);
  
  return reconstructFromIndices(tokens, keptIndices);
}
```

### 1.2 KV Cache Compaction

These reduce GPU memory during inference by managing the Key-Value cache:

| Technique | Key Insight | Benefit |
|-----------|-------------|---------|
| **StreamingLLM** | Attention Sinks (first 4 tokens + recent) | Infinite sequence length |
| **H2O** | Heavy Hitter tokens dominate attention | Reduces GPU memory |
| **Scissorhands** | Pivotal tokens across layers | Fixed memory budget |

**StreamingLLM Concept:**
```javascript
// Keep: [attention_sinks] + [recent_tokens]
const CACHE_SIZE = 4096; // tokens
const SINK_COUNT = 4;

function getStreamingLLMCache(fullHistory) {
  const recent = fullHistory.slice(-(CACHE_SIZE - SINK_COUNT));
  const sinks = fullHistory.slice(0, SINK_COUNT);
  return [...sinks, ...recent];
}
```

### 1.3 Learned Representation Compression

Soft prompt techniques compress text into dense vectors:

| Method | Compression | Use Case |
|--------|-------------|----------|
| **Gist Tokens** | 1000s of tokens → few special tokens | System prompts, personas |
| **AutoCompressors** | Long docs → summary vectors | Books, documents |
| **ICAE** | Context → memory slots | Multi-turn chat |

### 1.4 Summary Comparison

| Technique | Level | Latency Impact | Cost Impact |
|-----------|-------|----------------|-------------|
| LLMLingua | Prompt | +100-200ms processing | 60-75% reduction |
| StreamingLLM | KV Cache | None (inference speedup) | 50% memory reduction |
| H2O | KV Cache | None | 40% memory reduction |
| Gist Tokens | Embedding | Fast prefix processing | Token savings |

---

## 2. Token Tracking & Calculation

### 2.1 Client-Side Token Counting

**Library:** `js-tiktoken` (recommended)

```javascript
import { Tiktoken } from "js-tiktoken";

const enc = new Tiktoken({ model: "o200k_base" }); // GPT-4o encoding
const tokens = enc.encode("Hello, world!");
console.log(tokens.length); // e.g., 4
enc.free();
```

**For Claude models:**
```javascript
// Claude uses a different encoding (claude-tokenizer)
import { encode } from "claude-tokenizer";

const tokens = encode("Hello, world!");
```

### 2.2 Cost Calculation

**Library:** `tokencost` (AgentOps)

```javascript
import { calculateCost } from "tokencost";

const cost = calculateCost({
  model: "gpt-4o",
  inputTokens: 1000,
  outputTokens: 500,
});

console.log(cost.totalCost); // e.g., 0.03 (USD)
```

### 2.3 Real-Time UI Patterns

| Pattern | Implementation | Best For |
|---------|----------------|----------|
| **Streaming Counter** | Increment during stream | Per-message feedback |
| **Header Budget** | Session total (update on complete) | Cost awareness |
| **Sidecar Panel** | Collapsible details | Developer tools |

**React Token Counter Component:**
```tsx
const TokenCounter = ({ count, limit, pricePerToken = 0.00001 }) => {
  const percentage = (count / limit) * 100;
  const cost = (count * pricePerToken).toFixed(4);
  
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all ${
            percentage > 90 ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span>{count.toLocaleString()} tokens</span>
      <span className="text-gray-400">(${cost})</span>
    </div>
  );
};
```

### 2.4 Token Budget Warning Colors

```javascript
const getTokenColor = (percentage) => {
  if (percentage > 90) return 'text-red-500';
  if (percentage > 75) return 'text-amber-500';
  return 'text-gray-500';
};
```

---

## 3. Streaming Thinking Tokens UI

### 3.1 Common Patterns

| Pattern | Description | Examples |
|---------|-------------|----------|
| **Collapsible Accordion** | Expandable thought block | OpenAI o1, Claude |
| **Distinct Thought Block** | Visually separate from answer | DeepSeek-R1 |
| **Step-by-Step Status** | High-level actions only | Perplexity |
| **Side-by-Side** | Parallel thought + answer | Desktop developer tools |

### 3.2 Delimiter-Based Parsing

Most models emit thinking tokens between specific tags:

```javascript
const parseThinkingStream = (tokenStream) => {
  let isThinking = false;
  let thoughtContent = '';
  let answerContent = '';
  
  for (const token of tokenStream) {
    if (token === '<thought>') {
      isThinking = true;
      continue;
    }
    if (token === '</thought>') {
      isThinking = false;
      continue;
    }
    
    if (isThinking) {
      thoughtContent += token;
    } else {
      answerContent += token;
    }
  }
  
  return { thoughtContent, answerContent };
};
```

### 3.3 React Implementation

```tsx
const ThinkingDisplay = ({ thinking, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 p-2 bg-gray-100 w-full"
      >
        <ChevronDown 
          className={`transition ${isExpanded ? 'rotate-180' : ''}`} 
        />
        <span className="text-sm font-medium">
          Thought for 12 seconds
        </span>
      </button>
      
      <div 
        className={`transition-all ${
          isExpanded ? 'max-h-96 overflow-auto' : 'max-h-0'
        }`}
      >
        <pre className="p-4 text-sm bg-gray-50 whitespace-pre-wrap">
          {thinking}
        </pre>
      </div>
      
      <div className="p-4">
        {answer}
      </div>
    </div>
  );
};
```

### 3.4 UX Best Practices

1. **Auto-collapse after thinking** - User sees answer first
2. **Time-stamping** - "Thought for 12.3s" justifies wait
3. **Distinct typography** - Monospace for thinking, serif/sans for answer
4. **Separate copy buttons** - Copy reasoning vs copy answer

---

## 4. Tool Output Display Patterns

### 4.1 Collapsible Tool Results

```tsx
const ToolOutput = ({ toolName, status, output, duration }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const statusColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    pending: 'text-amber-500',
  };
  
  return (
    <div className="border border-gray-200 rounded-md my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-2 hover:bg-gray-50"
      >
        <span className={statusColors[status]}>
          {status === 'success' && '✓'}
          {status === 'error' && '✕'}
          {status === 'pending' && '○'}
        </span>
        <span className="font-mono text-sm">{toolName}</span>
        <span className="text-xs text-gray-400 ml-auto">
          {duration}ms
        </span>
        <ChevronDown 
          className={`transition ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="border-t p-3 bg-gray-50">
          <pre className="text-xs font-mono overflow-auto">
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
```

### 4.2 Sequential Stepper Pattern

```tsx
const ToolStepper = ({ steps }) => {
  return (
    <div className="space-y-2 my-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`mt-0.5 ${
            step.status === 'complete' ? 'text-green-500' :
            step.status === 'active' ? 'text-blue-500 animate-pulse' :
            'text-gray-300'
          }`}>
            {step.status === 'complete' ? '✓' : '○'}
          </div>
          <div>
            <div className="text-sm">{step.label}</div>
            {step.status === 'active' && (
              <div className="text-xs text-gray-500">
                {step.detail}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 4.3 Status Code Reference

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Success | ✓ | Green | Tool completed successfully |
| Error | ✕ | Red | Tool failed |
| Pending | ○ | Gray | Not started |
| Active | ◎ | Blue (pulse) | Currently running |

---

## 5. React Virtual Scrolling for Chat

### 5.1 Library Comparison

| Library | Dynamic Heights | Ease of Use | Bundle | Chat Features |
|---------|-----------------|-------------|--------|---------------|
| **React Virtuoso** | Best (auto) | High | Medium | Follow-to-bottom, sticky headers |
| **TanStack Virtual** | Good (manual) | Medium | Tiny | Headless, flexible |
| **React Window** | Difficult | High | Tiny | Very basic |

### 5.2 React Virtuoso Implementation

```tsx
import { Virtuoso } from 'react-virtuoso';

const ChatList = ({ messages, onSendMessage }) => {
  return (
    <Virtuoso
      data={messages}
      // Auto-scroll to bottom when new messages arrive
      followOutput="auto"
      // Handle inverse scrolling (prepend messages)
      startReached={() => loadMoreMessages()}
      // Maintain scroll position when loading history
      alignToBottom
      // Custom message rendering
      itemContent={(index, message) => (
        <MessageBubble message={message} />
      )}
    />
  );
};
```

### 5.3 Key Challenges & Solutions

**Challenge 1: Prepending Messages**
```tsx
// Solution: Use Virtuoso's startReached + initialTopMostItemIndex
<Virtuoso
  startReached={() => fetchHistory()}
  initialTopMostItemIndex={messages.length - 1}
/>
```

**Challenge 2: Dynamic Image Heights**
```tsx
// Solution: Use aspect-ratio containers
<img 
  src={url} 
  style={{ aspectRatio: '16/9' }}
  onLoad={() => virtRef.current?.measureElementDomNode(node)}
/>
```

**Challenge 3: Stick-to-Bottom Logic**
```tsx
// Smart auto-scroll based on user behavior
const handleScroll = (event) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target;
  const isAtBottom = scrollHeight - scrollTop === clientHeight;
  
  if (isAtBottom) {
    setAutoScroll(true);
  } else {
    setAutoScroll(false);
  }
};
```

---

## 6. Streaming Markdown Rendering

### 6.1 The Problem

Standard markdown renderers break with incomplete syntax:
- `**bold` without closing `**`
- `````python` without closing ````
- `- ` list without content

### 6.2 Solution: Streamdown

A drop-in replacement for `react-markdown` designed for streaming:

```tsx
import { Markdown } from 'streamdown';

const StreamingMessage = ({ content }) => {
  return (
    <Markdown
      components={{
        code: ({ children }) => (
          <code className="font-mono bg-gray-100 px-1 rounded">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </Markdown>
  );
};
```

**Key Features:**
- Handles incomplete bold/italic
- Manages partial code blocks
- No flash of unstyled content

### 6.3 Fallback: Fragment Buffer

If using standard `react-markdown`, buffer fragments:

```tsx
const StreamingMarkdown = ({ chunks }) => {
  const [buffer, setBuffer] = useState('');
  
  useEffect(() => {
    setBuffer(prev => prev + chunk);
  }, [chunks]);
  
  // Only render if buffer ends with complete syntax
  const canRender = (text) => {
    const openBold = (text.match(/\*\*/g) || []).length;
    const closeBold = (text.match(/\*\*/g) || []).length;
    return openBold % 2 === 0; // Simplified check
  };
  
  return canRender(buffer) ? (
    <ReactMarkdown>{buffer}</ReactMarkdown>
  ) : (
    <pre className="whitespace-pre-wrap">{buffer}</pre>
  );
};
```

---

## 7. Performance Considerations

### 7.1 Token Counting Optimization

```typescript
// Cache token counts for repeated messages
const tokenCache = new Map<string, number>();

async function getTokenCount(text: string): Promise<number> {
  if (tokenCache.has(text)) {
    return tokenCache.get(text)!;
  }
  
  const count = await countTokens(text);
  tokenCache.set(text, count);
  
  // LRU eviction for memory management
  if (tokenCache.size > 1000) {
    const firstKey = tokenCache.keys().next().value;
    tokenCache.delete(firstKey);
  }
  
  return count;
}
```

### 7.2 Virtual Scrolling Optimization

```typescript
// Debounced resize observer for dynamic content
const useDebouncedMeasure = (ref, delay = 100) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  
  return size;
};
```

### 7.3 Memory Management for Long Conversations

```typescript
const useMessageHistory = (maxMessages = 100) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const addMessage = (message: Message) => {
    setMessages(prev => {
      const updated = [...prev, message];
      
      // Trim from beginning (keep most recent)
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages);
      }
      
      return updated;
    });
  };
  
  return { messages, addMessage };
};
```

---

## 8. Recommended Stack

| Concern | Library | Version | Purpose |
|---------|---------|---------|---------|
| Token Counting | `js-tiktoken` | ^1.0 | Client-side token counting |
| Cost Calculation | `tokencost` | ^0.1 | Cost estimation |
| Virtual Scrolling | `react-virtuoso` | ^4.6 | Chat list virtualization |
| Markdown | `streamdown` | ^1.0 | Streaming-compatible markdown |
| Syntax Highlight | `react-syntax-highlighter` | ^15.5 | Code block coloring |
| Icons | `lucide-react` | ^0.3 | Status indicators |

---

## 9. References

### Compaction Algorithms
- [LLMLingua Paper](https://arxiv.org/abs/2310.08560)
- [StreamingLLM Paper](https://arxiv.org/abs/2309.17453)
- [H2O Paper](https://arxiv.org/abs/2306.14048)

### Token Counting
- [js-tiktoken GitHub](https://github.com/transitive-bullshit/js-tiktoken)
- [OpenAI Token Counting Guide](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken)

### Virtual Scrolling
- [React Virtuoso Documentation](https://virtuoso.dev/)
- [TanStack Virtual](https://tanstack.com/virtual)

### Streaming Markdown
- [Streamdown Documentation](https://streamdown.ai/docs)
- [Streamdown GitHub](https://github.com/streamdown-ai/streamdown)

### Tool Output Patterns
- [LangChain Callback Handlers](https://js.langchain.com/docs/api/callbacks/classes/BaseCallbackHandler)
- [Vercel AI SDK useChat](https://ai-sdk.dev/docs/api-reference/use-chat)

---

## 10. Implementation Recommendations

### Phase 1: Foundation
1. Implement token counting with `js-tiktoken`
2. Add cost display component with progress bar
3. Set up basic message list with `React Virtuoso`

### Phase 2: Streaming
1. Integrate `Streamdown` for markdown rendering
2. Implement thinking token parsing with delimiter detection
3. Add collapsible tool output components

### Phase 3: Optimization
1. Add context compaction for long conversations
2. Implement KV cache optimization (StreamingLLM)
3. Add message history trimming with summarization

### Phase 4: Polish
1. Add step-by-step status indicators
2. Implement smart auto-scroll behavior
3. Add conversation export with token statistics

---

*Research completed by analyst-ext*
*Artifact ID: RSCH-CTX-MGT-2026-01-25*

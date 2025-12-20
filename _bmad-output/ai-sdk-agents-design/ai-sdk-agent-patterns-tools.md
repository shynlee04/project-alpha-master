## Concepts

### Agents

```markdown
Agent class provides a structured way to encapsulate LLM configuration, tools, and behavior into reusable components. It handles the agent loop for you, allowing the LLM to call tools multiple times in sequence to accomplish complex tasks
```

- https://v6.ai-sdk.dev/docs/agents/building-agents

> By combining and conditioning these patterns, with loops control based on use cases and tools - allowing a more control web/app developments by practicing

1. **Comprehensive Domain-specific AI Agent guidances on the selected stacks → help users from different phases of guided enterprise-standard software development process**

1. Allowing users learn and build frontend software through natural language
1. Guardrails + Gatekeeping - validation loops → Improve code accuracy
1. Managing structured context and agentic coding → ease of development with spec-driven and complexity layering

---

Combine the building blocks from the [overview](https://v6.ai-sdk.dev/docs/agents/overview) with these patterns to add structure and reliability to your agents:

- [Sequential Processing](https://v6.ai-sdk.dev/docs/agents/workflows#sequential-processing-chains) - Steps executed in order
- [Parallel Processing](https://v6.ai-sdk.dev/docs/agents/workflows#parallel-processing) - Independent tasks run simultaneously
- [Evaluation/Feedback Loops](https://v6.ai-sdk.dev/docs/agents/workflows#evaluator-optimizer) - Results checked and improved iteratively
- [Orchestration](https://v6.ai-sdk.dev/docs/agents/workflows#orchestrator-worker) - Coordinating multiple components
- [Routing](https://v6.ai-sdk.dev/docs/agents/workflows#routing) - Directing work based on context

---

- Loop control: https://v6.ai-sdk.dev/docs/agents/loop-control
- Configuration call options: https://v6.ai-sdk.dev/docs/agents/configuring-call-options

### Tools and Tools calling

Tools are absolutely needed as for these reasons/features of AI agents (I may miss a lot but the below list are for you knowing the concepts) - I will borrow the sections of tools in Roo Code app for you understanding the concepts - tools are what need for AI agent interact, research, CRUD, manipulate files and edit files etc on IDE coding environment

---

The below are some tool set that are ready to use and instruction how to create tools

- https://v6.ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- Creating tools: https://v6.ai-sdk.dev/docs/foundations/tools
- Ready to use packages
  To get started, you can use the [AI SDK Tool Package Template](https://github.com/vercel-labs/ai-sdk-tool-as-package-template) which provides a ready-to-use starting point for publishing your own tools.
  ## [**Toolsets**](https://v6.ai-sdk.dev/docs/foundations/tools#toolsets)
  When you work with tools, you typically need a mix of application-specific tools and general-purpose tools. The community has created various toolsets and resources to help you build and use tools.
  ### [**Ready-to-Use Tool Packages**](https://v6.ai-sdk.dev/docs/foundations/tools#ready-to-use-tool-packages)
  These packages provide pre-built tools you can install and use immediately:
  - [**@exalabs/ai-sdk**](https://www.npmjs.com/package/@exalabs/ai-sdk) - Web search tool that lets AI search the web and get real-time information.
  - [**@parallel-web/ai-sdk-tools**](https://www.npmjs.com/package/@parallel-web/ai-sdk-tools) - Web search and extract tools powered by Parallel Web API for real-time information and content extraction.
  - [**@perplexity-ai/ai-sdk**](https://www.npmjs.com/package/@perplexity-ai/ai-sdk) - Search the web with real-time results and advanced filtering powered by Perplexity's Search API.
  - [**@tavily/ai-sdk**](https://www.npmjs.com/package/@tavily/ai-sdk) - Search, extract, crawl, and map tools for enterprise-grade agents to explore the web in real-time.
  - [**Stripe agent tools**](https://docs.stripe.com/agents?framework=vercel) - Tools for interacting with Stripe.
  - [**StackOne ToolSet**](https://docs.stackone.com/agents/typescript/frameworks/vercel-ai-sdk) - Agentic integrations for hundreds of [enterprise SaaS](https://www.stackone.com/integrations) platforms.
  - [**agentic**](https://docs.agentic.so/marketplace/ts-sdks/ai-sdk) - A collection of 20+ tools that connect to external APIs such as [Exa](https://exa.ai/) or [E2B](https://e2b.dev/).
  - [**Amazon Bedrock AgentCore**](https://github.com/aws/bedrock-agentcore-sdk-typescript) - Fully managed AI agent services including [**Browser**](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/built-in-tools.html) (a fast and secure cloud-based browser runtime to enable agents to interact with web applications, fill forms, navigate websites, and extract information) and [**Code Interpreter**](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/built-in-tools.html) (an isolated sandbox environment for agents to execute code in Python, JavaScript, and TypeScript, enhancing accuracy and expanding ability to solve complex end-to-end tasks).
  - [**Composio**](https://docs.composio.dev/providers/vercel) - 250+ tools like GitHub, Gmail, Salesforce and [more](https://composio.dev/tools).
  - [**JigsawStack**](http://www.jigsawstack.com/docs/integration/vercel) - Over 30+ small custom fine-tuned models available for specific uses.
  - [**AI Tools Registry**](https://ai-tools-registry.vercel.app/) - A Shadcn-compatible tool definitions and components registry for the AI SDK.
  - [**Toolhouse**](https://docs.toolhouse.ai/toolhouse/toolhouse-sdk/using-vercel-ai) - AI function-calling in 3 lines of code for over 25 different actions.
  ### [**MCP Tools**](https://v6.ai-sdk.dev/docs/foundations/tools#mcp-tools)
  These are pre-built tools available as MCP servers:
  - [**Smithery**](https://smithery.ai/docs/integrations/vercel_ai_sdk) - An open marketplace of 6,000+ MCPs, including [Browserbase](https://browserbase.com/) and [Exa](https://exa.ai/).
  - [**Pipedream**](https://pipedream.com/docs/connect/mcp/ai-frameworks/vercel-ai-sdk) - Developer toolkit that lets you easily add 3,000+ integrations to your app or AI agent.
  - [**Apify**](https://docs.apify.com/platform/integrations/vercel-ai-sdk) - Apify provides a [marketplace](https://apify.com/store) of thousands of tools for web scraping, data extraction, and browser automation.
  ### [**Tool Building Tutorials**](https://v6.ai-sdk.dev/docs/foundations/tools#tool-building-tutorials)
  These tutorials and guides help you build your own tools that integrate with specific services:
  - [**browserbase**](https://docs.browserbase.com/integrations/vercel/introduction#vercel-ai-integration) - Tutorial for building browser tools that run a headless browser.
  - [**browserless**](https://docs.browserless.io/ai-integrations/vercel-ai-sdk) - Guide for integrating browser automation (self-hosted or cloud-based).
  - [**AI Tool Maker**](https://github.com/nihaocami/ai-tool-maker) - A CLI utility to generate AI SDK tools from OpenAPI specs.
  - [**Interlify**](https://www.interlify.com/docs/integrate-with-vercel-ai) - Guide for converting APIs into tools.
  - [**DeepAgent**](https://deepagent.amardeep.space/docs/vercel-ai-sdk) - A suite of 50+ AI tools and integrations, seamlessly connecting with APIs like Tavily, E2B, Airtable and [more](https://deepagent.amardeep.space/docs).
  ```markdown
  To get started, you can uable and more.
  ```

### Advanced stuff:

- Object generation: https://v6.ai-sdk.dev/docs/ai-sdk-ui/object-generation
- https://v6.ai-sdk.dev/docs/advanced/sequential-generations
- Embedding and RAG: https://v6.ai-sdk.dev/docs/ai-sdk-core/embeddings
- https://v6.ai-sdk.dev/cookbook/guides/rag-chatbot
- And a giant section of Streaming of all sorts from text, tools, UI, objects to especially those streamhelpers
  - https://v6.ai-sdk.dev/docs/reference/stream-helpers/streaming-text-response
  - https://v6.ai-sdk.dev/docs/reference/stream-helpers/stream-to-response
  - https://v6.ai-sdk.dev/docs/reference/stream-helpers/ai-stream
- Troubleshooting: https://v6.ai-sdk.dev/docs/troubleshooting

### Support for OpenRouter

https://v6.ai-sdk.dev/providers/community-providers/openrouter

[Roo Code Tools Overview](https://www.notion.so/Roo-Code-Tools-Overview-2c0926f31a4d80f0b273c404ffcdbc5b?pvs=21)

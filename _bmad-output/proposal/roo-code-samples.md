---
description: Access Roo Code's AI assistance directly in your editor with Code Actions. Get instant fixes, explanations, and improvements through VSCode's lightbulb system.
keywords: code actions,quick fixes,lightbulb menu,AI assistance,VSCode integration,code improvements,error fixes
image: /img/social-share.jpg
---

# Code Actions


Code Actions provide instant access to Roo Code's AI assistance directly within your code editor through VSCode's lightbulb (quick fix) system. This context-aware feature automatically detects relevant code situations and offers appropriate AI-powered actions without requiring you to switch to the chat interface.





## What are Code Actions?​


Code Actions appear as a lightbulb icon (💡) in the editor gutter (the area to the left of the line numbers). They can also be accessed via the right-click context menu, or via keyboard shortcut. They are triggered when:


- You select a range of code.
- Your cursor is on a line with a problem (error, warning, or hint).
- You invoke them via command.


Clicking the lightbulb, right-clicking and selecting "Roo Code", or using the keyboard shortcut (Ctrl+. or Cmd+. on macOS, by default), displays a menu of available actions.



## Roo Code's Code Actions​


Roo Code provides 5 code actions, though their availability varies by context:


### Context Menu Actions (Right-Click)​


- Add to Context: Quickly adds the selected code to your chat with Roo, including the filename and line numbers so Roo knows exactly where the code is from. It's listed first in the menu for easy access.
- Explain Code: Asks Roo Code to explain the selected code.
- Improve Code: Asks Roo Code to suggest improvements to the selected code.


### Additional Actions​


- Fix Code: Available through the lightbulb menu and command palette (but not the right-click menu). Asks Roo Code to fix problems in the selected code.
- New Task: Creates a new task with the selected code. Available through the command palette.


### Context-Aware Actions​


The lightbulb menu intelligently shows different actions based on your code's current state:


For Code with Problems (when VSCode shows red/yellow squiggles):


- Fix Code - Get step-by-step guidance to resolve the specific error or warning
- Add to Context - Add the problematic code to Roo's context for discussion


For Clean Code (no diagnostics):


- Explain Code - Get detailed explanations of what the code does
- Improve Code - Receive optimization suggestions and best practices
- Add to Context - Add the code to Roo's context for further work


For more details on how diagnostics are integrated with Code Actions, see Diagnostics Integration.


### Add to Context Deep Dive​


The Add to Context action is listed first in the Code Actions menu so you can quickly add code snippets to your conversation. When you use it, Roo Code includes the filename and line numbers along with the code.


This helps Roo understand the exact context of your code within the project, allowing it to provide more relevant and accurate assistance.


Tip: Use macOS Cmd+K Cmd+A or Windows/Linux Ctrl+K Ctrl+A to add the selection to context quickly. See Keyboard Shortcuts.


Example Chat Input:



(Where @myFile.js:15:25 represents the code added via "Add to Context")



## Using Code Actions​


There are three main ways to use Roo Code's Code Actions:


### 1. From the Lightbulb (💡)​


1. Select Code: Select the code you want to work with. You can select a single line, multiple lines, or an entire block of code.
2. Look for the Lightbulb: A lightbulb icon will appear in the gutter next to the selected code (or the line with the error/warning).
3. Click the Lightbulb: Click the lightbulb icon to open the Code Actions menu.
4. Choose an Action: Select the desired Roo Code action from the menu.
5. Review and Approve: Roo Code will propose a solution in the chat panel. Review the proposed changes and approve or reject them.


### 2. From the Right-Click Context Menu​


1. Select Code: Select the code you want to work with.
2. Right-Click: Right-click on the selected code to open the context menu.
3. Choose "Roo Code": Select the "Roo Code" option from the context menu. A submenu will appear with the available Roo Code actions.
4. Choose an Action: Select the desired action from the submenu.
5. Review and Approve: Roo Code will propose a solution in the chat panel. Review the proposed changes and approve or reject them.


### 3. From the Command Palette​


1. Select Code: Select the code you want to work with.
2. Open the Command Palette: Press Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (macOS).
3. Type a Command: Type "Roo Code" to filter the commands, then choose the relevant code action (e.g., "Roo Code: Explain Code"). The action will apply in the most logical context (usually the current active chat task, if one exists).
4. Review and Approve: Roo Code will propose a solution in the chat panel. Review the proposed changes and approve or reject them.



## Terminal Actions​


Roo Code also provides similar actions for terminal output:


- Terminal: Add to Context: Adds selected terminal output to your chat
- Terminal: Fix Command: Asks Roo Code to fix a failed terminal command
- Terminal: Explain Command: Asks Roo Code to explain terminal output or commands


These actions are available when you select text in the terminal and right-click.



## Disabling/Enabling Code Actions​


You can control Code Actions through VSCode settings:


### Enable/Disable Code Actions​


- Setting: roo-cline.enableCodeActions
- Default: Enabled
- Description: Controls whether Roo Code quick fix options appear in the editor


To access this setting:


1. Open VSCode Settings (Ctrl/Cmd + ,)
2. Search for "enableCodeActions"
3. Toggle the checkbox to enable or disable



## Customizing Code Action Prompts​


You can customize the prompts used for each Code Action by modifying the "Support Prompts" in the Prompts tab. This allows you to fine-tune the instructions given to the AI model and tailor the responses to your specific needs.


1. Open the Prompts Tab: Click the  icon in the Roo Code top menu bar.
2. Find "Support Prompts": You will see the support prompts, including "Enhance Prompt", "Explain Code", "Improve Code", and "Fix Code".
3. Edit the Prompts: Modify the text in the text area for the prompt you want to customize. The prompts use placeholders in the format ${placeholder}:

${filePath} - The path of the current file
${selectedText} - The currently selected text
${diagnostics} - Any error or warning messages (for Fix Code) - see Diagnostics Integration for details


4. Click "Done": Save your changes.


### Example Prompt Template​



By using Roo Code's Code Actions, you can quickly get AI-powered assistance directly within your coding workflow. This can save you time and help you write better code.



## Related Features​


- Diagnostics Integration - Learn how Roo Code integrates with VSCode's Problems panel
- Context Mentions - Discover other ways to provide context to Roo Code

---
description: Learn how Codebase Indexing helps Roo Code understand large projects using AI embeddings and semantic search. Setup guide for OpenAI and Qdrant integration.
keywords: codebase indexing,semantic search,AI embeddings,OpenAI,Qdrant,large projects,code search
image: /img/social-share.jpg
---

# Codebase Indexing


Codebase Indexing transforms how Roo Code understands your project by creating a semantic search index using AI embeddings. Instead of searching for exact text matches, it understands the meaning of your queries, helping Roo find relevant code even when you don't know specific function names or file locations.





## What It Does​


When enabled, the indexing system:


1. Parses your code using Tree-sitter to identify semantic blocks (functions, classes, methods)
2. Creates embeddings of each code block using AI models
3. Stores vectors in a Qdrant database for fast similarity search
4. Provides the codebase_search tool to Roo for intelligent code discovery


This enables natural language queries like "user authentication logic" or "database connection handling" to find relevant code across your entire project.



## Quick Start Guide​


💰 Completely Free Setup AvailableYou can set up codebase indexing at zero cost by using:

- Qdrant Cloud (free tier) or Docker Qdrant (completely free)
- Google Gemini (currently free)

This gives you professional-grade semantic search without any subscription fees!


### Step 1: Choose Your Setup​


Before enabling codebase indexing, you'll need two components:


1. An Embedding Provider - to convert code into searchable vectors
2. A Vector Database - to store and search those vectors


### Step 2: Set Up Qdrant (Vector Database)​


#### Option A: Cloud Setup (Recommended for Getting Started) - FREE​


1. Sign up at Qdrant Cloud (free tier available)
2. Create a cluster
3. Copy your URL and API key


#### Option B: Local Setup - FREE​


Using Docker:



Using Docker Compose:



### Step 3: Set Up an Embedding Provider​


#### Google Gemini Setup (Recommended) - FREE​


1. Get an API key from Google AI Studio (currently free)
2. In Roo Code settings:

Provider: Google Gemini
API Key: Your Google AI Studio key




Other Providers AvailableWhile this guide focuses on Google Gemini since it's currently free, Roo Code also supports OpenAI, Ollama, and OpenAI-compatible providers. You can explore these options in the configuration dropdown.


### Step 4: Save​


1. Click Save and Start Indexing


The status indicator will show:


- Yellow (Indexing): Currently processing files
- Green (Indexed): Ready for searches
- Red (Error): Check troubleshooting section



## Managing and Configuring the Indexer​


You can monitor the status and manage all configuration for the codebase indexer directly from the Roo Code chat interface.


### The Status Icon​


At the bottom-right corner of the chat input, you'll find the Codebase Indexing status icon. This icon provides a quick, at-a-glance overview of the indexer's current state.



The color of the icon indicates the state:


- 🟢 Green: Indexed. The index is up-to-date and ready for search.
- 🟡 Yellow: Indexing. The system is actively processing files. Searches can still be performed, but results may be incomplete.
- 🔴 Red: Error. An issue has occurred (e.g., failed to connect to Qdrant or the embedding provider). See the Troubleshooting section for help.
- ⚪ Gray: Standby. The indexer is waiting for configuration or has been disabled.


Multi-Folder Workspaces: In multi-folder workspaces, each folder maintains its own indexing status and configuration. The status icon reflects the combined state of all workspace folders.


### The Configuration Popover​


Clicking the status icon opens the main configuration popover. Here, you can view the detailed status and manage all settings.



- Status: A detailed message showing the current state, such as "Indexed - File watcher started" or the progress of an ongoing scan.
- Setup: Contains the primary fields for connecting to your embedding provider and vector database.
- Advanced Configuration: Allows you to fine-tune search parameters like the similarity threshold.
- Clear Index Data: Deletes all data from the Qdrant collection and clears the local file cache. Use this when you want to re-index your entire project from scratch. This action cannot be undone.
- Save: Applies your configuration changes. If a critical setting (like an API key or a model) is changed, the indexer will automatically restart.


### Detailed Configuration Fields​


This guide explains each setting available in the configuration popover.



#### Setup Fields​


- 
Embedder Provider

Purpose: To select your source for generating AI embeddings.
Behavior: This dropdown menu determines which configuration fields are shown. Your options are OpenAI, Google Gemini, Ollama, and OpenAI Compatible.


- 
API Key (for OpenAI, Gemini, OpenAI Compatible)

Purpose: The secret key to authenticate with your chosen provider.
Behavior: This input is required for all cloud-based providers and is stored securely in your VS Code secret storage.


- 
Base URL (for Ollama, OpenAI Compatible)

Purpose: The endpoint for connecting to the provider's API.
Behavior: For Ollama, this is typically http://localhost:11434. For OpenAI Compatible providers like Azure, this is the full deployment URL.


- 
Model

Purpose: To select the specific embedding model you want to use.
Behavior: The list of available models changes based on the selected provider. The model's vector dimension (e.g., 1536 dimensions) is displayed, as changing dimensions requires a full re-index.


- 
Qdrant URL

Purpose: The connection endpoint for your Qdrant vector database.
Behavior: This must be a valid URL pointing to your local or cloud-based Qdrant instance (e.g., http://localhost:6333).


- 
Qdrant API Key

Purpose: The authentication key for a secured Qdrant instance.
Behavior: This field is optional and should only be used if your Qdrant deployment requires an API key.




#### Advanced Configuration Fields​


- 
Search Score Threshold

Purpose: Controls the minimum similarity score required for a code snippet to be considered a match.
Behavior: Use the slider to set a value between 0.0 and 1.0. A lower value returns more (but potentially less relevant) results, while a higher value returns fewer, more precise results.
Recommended Settings:

Low (0.15-0.3): Broader results, good for exploration
Medium (0.4-0.5): Balanced precision and recall (default: 0.4)
High (0.6-0.8): Precise matches only




- 
Maximum Search Results

Purpose: Sets the maximum number of code snippets returned by a single codebase_search.
Behavior: Use the slider to adjust the limit. This helps control the amount of context provided to the AI.





## Key Benefits​


- Semantic Search: Find code by meaning, not just keywords
- Enhanced AI Understanding: Roo can better comprehend and work with your codebase
- Cross-Project Discovery: Search across all files, not just what's open
- Pattern Recognition: Locate similar implementations and code patterns



## How Files Are Processed​


### Smart Code Parsing​


The system uses a sophisticated parsing strategy:


1. Tree-sitter First: For supported languages, it uses AST parsing to identify semantic code blocks (functions, classes, methods)
2. Markdown Support: Indexes Markdown files by treating headers as semantic entry points
3. Intelligent Fallback: For unsupported file types, it falls back to line-based chunking


Block Sizing:


- Minimum: 100 characters
- Maximum: 1,000 characters
- Large functions are split intelligently at logical boundaries


### File Filtering​


The indexer respects your project's ignore patterns:


- Files matching .gitignore patterns
- Files matching .rooignore patterns
- Binary files and images
- Files larger than 1MB


Important: Ensure your .gitignore includes common dependency folders like node_modules, vendor, target, etc., as the system relies exclusively on these patterns for filtering.


### Incremental Updates​


- File Watching: Monitors your workspace for changes in real-time
- Smart Updates: Only reprocesses modified files
- Branch Aware: Automatically handles Git branch switches
- Hash-based Caching: Avoids reprocessing unchanged content
- Multi-Folder Workspaces: Each folder in a multi-folder workspace maintains its own index with separate settings and status



## Best Practices​


### Writing Effective Queries​


Instead of searching for exact syntax:


- ❌ const getUser
- ✅ function to fetch user from database


Use natural language descriptions:


- "authentication middleware"
- "error handling for API requests"
- "database connection setup"


### Security Considerations​


- API Keys: Stored securely in VS Code's encrypted storage
- Code Privacy: Only small code snippets sent for embedding
- Local Processing: All parsing happens locally
- Access Control: Respects file permissions and ignore patterns



## Troubleshooting​


### Connection Issues​


"Connection to Qdrant failed"


- Ensure Qdrant is running (docker ps to check)
- Verify URL matches (default: http://localhost:6333)
- Check firewall/network policies
- For cloud instances, confirm URL and API key


"Invalid API Key" or "401 Unauthorized"


- Double-check your API key is correct
- Ensure the key has necessary permissions
- For Ollama, verify the service is running


### API Key Format Errors (“ByteString conversion”)​


- Symptom: Error mentions "ByteString conversion" during indexing or when saving settings
- Likely cause: Your embedding provider API key contains invalid/special characters or hidden whitespace
- Fix:

Regenerate a fresh API key from your provider dashboard
Paste the key again, ensuring no leading/trailing spaces or hidden characters
Roo will display a clear validation message if the key is invalid




### Model Issues​


"Model Not Found"


- For Google Gemini: Ensure the model name is correct (e.g., text-embedding-004)
- For other providers: Consult their documentation for available models and proper naming


### Indexing Issues​


"Stuck in Error State"


1. Check connection issues first
2. Click "Clear Index & Re-index" in settings
3. This resolves corrupted cache or collection issues


"Indexing Taking Too Long"


- Normal for large codebases (10k+ files)
- Check .gitignore includes large directories
- Consider adding patterns to .rooignore



## Using the Search Feature​


Once indexed, Roo can use the codebase_search tool:


Example Natural Language Queries:


- "How is user authentication handled?"
- "Database connection setup"
- "Error handling patterns"
- "API endpoint definitions"
- "Component state management"


The tool provides:


- Relevant code snippets
- File paths with line numbers
- Similarity scores
- Direct navigation links



## Privacy & Data Security​


Your code stays private:


- Only small code chunks (100-1000 chars) sent for embedding
- Embeddings are one-way mathematical representations
- Local parsing means full files never leave your machine
- Use Ollama for completely offline operation


Data Storage:


- Vectors stored in your chosen Qdrant instance
- You control where data lives (local/cloud)
- Easy to delete: just clear the index



## Current Limitations​


- File Size: 1MB maximum per file
- External Dependencies: Requires embedding provider + Qdrant
- Language Support: Best results with Tree-sitter supported languages



## Future Enhancements​


Planned improvements:


- Additional embedding providers
- Multi-workspace indexing
- Enhanced filtering options
- Team collaboration features
- VS Code native search integration
- Incremental re-indexing optimizations
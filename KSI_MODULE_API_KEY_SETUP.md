# Gemini API Key Configuration for KSI Module

## Quick Setup (5 steps)

1. **Open the Application**
   ```bash
   pnpm dev
   ```

2. **Open Agent Configuration Dialog**
   - Click the **Settings** icon in the top navigation
   - Navigate to **Agents** section
   - Click **"Configure Providers"** button

3. **Add Gemini API Key**
   - Select provider: **"Google Gemini"**
   - Paste your API key: `AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ`
   - Click **"Save"**

4. **Wait for Model Loading**
   - The system will automatically fetch available Gemini models
   - You'll see: `"Google Gemini" API key saved - loading models...`

5. **Use Knowledge Synthesis Features**
   - Navigate to **Knowledge** workspace
   - Import documents (PDF, images, markdown, URLs)
   - Click **"Synthesize"** button to generate frontmatter
   - The system will use your configured API key automatically

## Architecture

**BYOK (Bring Your Own Key) Design:**
- ✅ Client-side credential vault (encrypted storage via Web Crypto API)
- ✅ API keys stored in IndexedDB (persistent across sessions)
- ✅ Reactive provider configuration (changes hot-load across workspaces)
- ✅ Centralized provider management (one key per provider, shared everywhere)

**Provider Configuration Flow:**
```
User Input → ProviderConfigDialog
                ↓
         Credential Vault (encrypt & store in IndexedDB)
                ↓
         All Services Access via credentialVault.getCredentials('gemini')
                ↓
         Knowledge Synthesis, Chat, RAG, etc.
```

## How It Works

### Synthesis Service Integration

The `SynthesisService` class now has two constructors:

```typescript
// Option 1: Direct instantiation (for tests, custom integrations)
const service = new SynthesisService(apiKey);

// Option 2: Static factory using credential vault (recommended for app)
const service = await SynthesisService.create('gemini');
```

The static factory method:
1. Initializes the credential vault
2. Retrieves the encrypted API key from IndexedDB
3. Returns a configured service instance

### Provider ID Mapping

| Display Name | Provider ID | Notes |
|--------------|-------------|-------|
| Google Gemini | `gemini` | Use this ID when calling `credentialVault.getCredentials()` |
| OpenRouter | `openrouter` | Alternative provider with Gemini models |
| OpenAI | `openai` | Not configured for knowledge synthesis |

## Testing

### Runtime Validation Tests

The test suite in `src/lib/knowledge/__tests__/runtime-validation.test.ts` validates:
- ✅ Synthesis service generates frontmatter
- ✅ PDF processor extracts document structure
- ✅ Image processor performs OCR and visual understanding
- ✅ URL processor analyzes web page content
- ✅ All services handle timeout, retry logic, and errors correctly

### Running Tests

```bash
# Run all tests
pnpm test

# Run only KSI runtime validation
pnpm test -- runtime-validation
```

## Troubleshooting

### "No API key found for provider: gemini"

**Cause:** API key not configured in credential vault

**Solution:**
1. Open Settings → Agents → Configure Providers
2. Select "Google Gemini"
3. Enter your API key and click Save

### "404 Model not found"

**Cause:** Model name `gemini-2.0-flash-latest` doesn't exist

**Solution:** Fixed in commit - now uses `gemini-2.5-flash` (correct model name)

### "Models not loading"

**Cause:** API key invalid or network issue

**Solution:**
1. Verify API key at https://aistudio.google.com/apikey
2. Check browser console for CORS errors
3. Ensure VPN/proxy not blocking requests to `generativelanguage.googleapis.com`

## Security Notes

- ✅ API keys encrypted with AES-GCM before storage
- ✅ Master key derived from password using PBKDF2 (100,000 iterations)
- ✅ Salt and IV stored in localStorage
- ✅ Keys never exposed in client-side code (only in browser memory)
- ⚠️  API keys persist across browser sessions (clear via "Clear All Credentials" in Settings)

## Model Configuration

Current default: `gemini-2.5-flash` (as of 2026-01-01)

**Model Hierarchy:**
- `gemini-2.5-flash` - Fast, cost-effective (recommended)
- `gemini-2.5-pro` - Advanced reasoning (slower but more accurate)
- `gemini-3.0-flash` - Latest generation (when available)

**To change model:** Edit `src/lib/knowledge/synthesis-service.ts` line 44:
```typescript
model: 'gemini-2.5-pro', // or gemini-3.0-flash
```

## Next Steps

1. ✅ Configure API key in UI (follow Quick Setup above)
2. ✅ Run `pnpm test -- runtime-validation` to verify
3. ✅ Test Use Case 1: Import markdown → Synthesize → Verify frontmatter
4. ✅ Test Use Case 2: Link canvas blocks to discovered topics
5. ✅ Test Use Case 3: RAG chat with synthesized context
6. ✅ Test Use Case 4: Knowledge matrix auto-organization

---

**Generated:** 2026-01-01
**Module:** KSI (Knowledge Synthesis Integration)
**Epic:** EPIC-38 - Phase 7 (Runtime Validation)

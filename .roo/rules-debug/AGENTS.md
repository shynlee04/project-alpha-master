# Project Debug Rules (Non-Obvious Only)

- Webview dev tools accessed via Command Palette > "Developer: Open Webview Developer Tools" (not F12)
- IPC messages fail silently if not wrapped in try/catch in packages/ipc/src/
- Production builds require NODE_ENV=production or certain features break without error
- Database migrations must run from packages/evals/ directory, not root
- Extension logs only visible in "Extension Host" output channel, not Debug Console

## Debugging Gotchas

- **WebContainer Issues**: Check console for COOP/COEP header errors first
- **File Sync Problems**: Verify permissions granted to File System Access API
- **Terminal Not Responding**: Ensure `projectPath` is passed to terminal component
- **Translation Keys Missing**: Run `pnpm i18n:extract` and check namespace usage

## Hidden Debug Tools

- Use `permission-lifecycle.ts` utilities to debug FSA permission issues
- Monitor `SyncManager` logs for file sync errors
- Check WebContainer boot status in `webcontainer-manager.ts`
- Verify terminal connection to WebContainer shell in terminal-adapter
# NOTES WORKSPACE - USER JOURNEY E2E TEST MATRIX (2026-01-07)

## Testing Methodology
```
1. Start: HubPage (/)
2. Map all 1st interactions from HubPage
3. For each interaction: map 2nd sequential journeys
4. Expand horizontally: all options, edge cases
5. Fix ALL errors before proceeding (zero tolerance)
6. Only when all paths resolved → next interaction
7. Workspace order: Notes → IDE → Cross-workspace
```

## Phase 1: HubPage → Notes Workspace Entry

### Journey Map
```
HubPage (/)
├── 1st Interaction: Click "Notes" sidebar link
│   ├── Expected: Navigate to /notes
│   ├── Expected: Notes workspace loads
│   └── 2nd Sequential: Notes page interactions
│       ├── View existing notes (if any)
│       ├── Create new note button
│       ├── Note editor interactions
│       └── AI chat integration
└── [Branch]: Other workspace entries (deferred)
```

---

## Test Case 1.1: HubPage → Notes Navigation

### Pre-conditions
- Dev server running on http://localhost:3001
- Browser opened to HubPage
- No existing notes (fresh state)

### Test Steps
1. **Navigate to** http://localhost:3001
2. **Wait for page load** (max 5s)
3. **Click "Notes" sidebar link**
4. **Verify URL changes** to `/notes`
5. **Verify page title** changes
6. **Check console for errors**
7. **Check for UI rendering errors**

### Expected Results
- ✅ URL: `http://localhost:3001/notes`
- ✅ Page renders without errors
- ✅ Notes workspace interface visible
- ✅ No console errors
- ✅ No TypeScript runtime errors

### Actual Results
- **Status**: PENDING (need Playwright test)
- **URL**:
- **Console Errors**:
- **UI Issues**:

---

## Test Case 1.2: Notes Workspace - First View

### Test Steps
1. **On Notes page** (/notes)
2. **Check page elements**:
   - Notes list/empty state
   - Create note button
   - AI assistant chat panel
   - Navigation breadcrumbs
3. **Screenshot capture**
4. **Console log analysis**

### Expected Results
- ✅ Empty state message OR notes list visible
- ✅ Create note button present
- ✅ No loading spinner stuck
- ✅ No console errors

### Actual Results
- **Status**: PENDING
- **Empty State Message**:
- **Buttons Visible**:
- **Console Errors**:

---

## Test Case 1.3: Create New Note - First Interaction

### Test Steps
1. **Click "Create New Note" button**
2. **Wait for editor to load**
3. **Check BlockNote editor renders**
4. **Test basic typing**
5. **Check note persists**

### Expected Results
- ✅ Button click works
- ✅ Editor loads without errors
- ✅ Can type text
- ✅ Note auto-saves to IndexedDB
- ✅ No console errors

### Actual Results
- **Status**: PENDING
- **Editor Loads**:
- **Typing Works**:
- **Auto-save**:
- **Console Errors**:

---

## Test Case 1.4: AI Chat Integration - First Message

### Test Steps
1. **Locate AI chat panel** in Notes workspace
2. **Check API key status** (agent configuration)
3. **Send test message**: "Hello, can you help me?"
4. **Wait for response**
5. **Check response appears**

### Expected Results
- ✅ Chat panel visible
- ✅ Agent selector available
- ✅ Can send message
- ✅ Response received OR error message shown
- ✅ No silent failures

### Actual Results
- **Status**: PENDING
- **Chat Panel Visible**:
- **Agent Selector**:
- **Message Sent**:
- **Response Received**:
- **Console Errors**:

---

## Test Case 1.5: Notes List View - Navigation

### Test Steps
1. **Create 2-3 test notes**
2. **Go back to notes list**
3. **Verify all notes appear**
4. **Click each note**
5. **Verify content loads**

### Expected Results
- ✅ All created notes visible
- ✅ Note titles display correctly
- ✅ Clicking note opens it
- ✅ No missing data
- ✅ No console errors

### Actual Results
- **Status**: PENDING
- **Notes Listed**:
- **Titles Display**:
- **Navigation Works**:
- **Console Errors**:

---

## Error Categories to Track

### Console Errors
- [ ] JavaScript exceptions
- [ ] Network failures
- [ ] IndexedDB errors
- [ ] API call failures

### UI/UX Issues
- [ ] Buttons not responding
- [ ] Missing content
- [ ] Broken layouts
- [ ] Loading states stuck
- [ ] Text overflow/cut off

### Data Issues
- [ ] Notes not persisting
- [ ] Data loss on refresh
- [ ] Missing fields
- [ ] Corrupted content

### Integration Issues
- [ ] AI chat not working
- [ ] Agent selection broken
- [ ] File system permissions
- [ ] Cross-workspace sync

---

## Test Execution Log

### Session: 2026-01-07 00:25 +07:00
- [x] Dev server started (port 3001)
- [ ] Playwright browser launched
- [ ] Test 1.1: HubPage → Notes navigation
- [ ] Test 1.2: Notes workspace first view
- [ ] Test 1.3: Create new note
- [ ] Test 1.4: AI chat integration
- [ ] Test 1.5: Notes list navigation

### Errors Found
- **Error #1**: (to be filled)
- **Error #2**: (to be filled)

### Fixes Applied
- **Fix #1**: (to be filled)
- **Fix #2**: (to be filled)

---

## Next Phase (After Notes Complete)
- **IDE Workspace**: Same horizontal testing
- **Cross-workspace**: Test data flows between workspaces

---

**Test Lead**: AI Assistant (Playwright MCP + ChromeDev MCP)
**Methodology**: Horizontal expansion, zero error tolerance
**Tools**: Playwright, ChromeDev, Vision MCP
**Confidence Target**: 100% test pass rate before marking workspace complete

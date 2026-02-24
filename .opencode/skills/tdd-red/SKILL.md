---
name: tdd-red
description: Write failing tests FIRST before any implementation. RED phase of RED-GREEN-REFACTOR cycle.
---

# TDD Red Phase

> **MAX Strategy**: Triggered on implementation requests

## The Rule

Write a failing test that describes expected behavior BEFORE implementation code.

## RED Phase Requirements

1. **Test MUST fail** - If passes immediately, wrong test
2. **Test MUST be specific** - Test exact behavior
3. **Test MUST be minimal** - One thing per test
4. **Test MUST compile** - TypeScript clean

## Template

```typescript
describe('FeatureName', () => {
  it('should [behavior] when [condition]', () => {
    // Arrange
    const input = createTestInput();
    
    // Act
    const result = featureUnderTest(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

## Verification

```bash
# Run test - expect FAIL
pnpm test:fast -- --run <test-file>
```

## RED Complete When

- [ ] Test written and compiles
- [ ] Test fails when run
- [ ] Failure describes missing behavior
- [ ] No implementation code yet

## Next Phase

After RED confirmed → GREEN (minimal implementation to pass)

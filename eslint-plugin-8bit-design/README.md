# eslint-plugin-8bit-design

ESLint plugin for enforcing 8-bit design system rules.

## Rules

### `no-transparency`

Disallows transparency/opacity modifiers on interactive elements.

**8-bit design requires solid colors only.**

```typescript
// ❌ Violations
className="bg-slate-800/60"
className="opacity-50"

// ✅ Valid
className="bg-card"
className="opacity-100"
```

### `no-large-radius`

Disallows large border radius values.

**8-bit design requires squared corners.**

```typescript
// ❌ Violations
className="rounded-lg"
className="rounded-xl"
className="rounded-[16px]"

// ✅ Valid
className="rounded-none"
className="rounded-[4px]"
```

### `no-blur`

Disallows blur effects.

**8-bit design means no glassmorphism.**

```typescript
// ❌ Violations
className="blur-md"
className="backdrop-blur-sm"

// ✅ Valid
className="" // Remove blur entirely
```

## Installation

```bash
npm install --save-dev eslint-plugin-8bit-design
```

## Usage

### Flat Config (ESLint 9+)

```javascript
import 8bitDesign from 'eslint-plugin-8bit-design'

export default [
  {
    plugins: {
      '8bit-design': 8bitDesign,
    },
    rules: {
      '8bit-design/no-transparency': 'error',
      '8bit-design/no-large-radius': 'error',
      '8bit-design/no-blur': 'error',
    },
  },
]
```

### Using Shared Config

```javascript
import 8bitDesign from 'eslint-plugin-8bit-design'

export default [
  {
    plugins: {
      '8bit-design': 8bitDesign,
    },
    extends: ['plugin:8bit-design/recommended'],
  },
]
```

## License

MIT

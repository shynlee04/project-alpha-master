---
description: Complete story cycle with parallel validation phases
agent: dev-ext
subtask: true
parallel:
  - /architect-ext review architecture alignment
  - /tea-ext create unit tests for edge cases
return:
  - If architecture review passes: /dev-story story=$ARGUMENTS
  - If architecture review fails: /correct-course with architect's feedback and retry
---
Implement story: $ARGUMENTS

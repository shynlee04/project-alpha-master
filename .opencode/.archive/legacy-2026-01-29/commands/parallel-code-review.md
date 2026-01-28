---
description: Multi-angle parallel code review
agent: dev-ext
subtask: true
parallel:
  - /code-review story=$ARGUMENTS focus=typescript
  - /code-review story=$ARGUMENTS focus=architecture
  - /code-review story=$ARGUMENTS focus=testing
  - /code-review story=$ARGUMENTS focus=ux
return:
  - Merge all review findings
  - Identify consensus and disagreements
  - Prioritize: critical fixes > high > medium > low
  - Create unified feedback with action items
  - If consensus < 70%: /architect-ext to mediate
---
Comprehensive review: $ARGUMENTS

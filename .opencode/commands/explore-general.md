---
description: Parallel research using explore + general subagents
subtask: true
parallel:
  - command: explore-research
    arguments: "$ARGUMENTS"
  - command: general-analyze
    arguments: "$ARGUMENTS"
return: ["Synthesize findings from explore and general"]
---
$ARGUMENTS

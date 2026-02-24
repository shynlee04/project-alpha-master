---
name: brainstorming
description: Explore ideas before implementation. One question at a time, multiple choice preferred, validate design incrementally.
---

# Brainstorming Ideas Into Designs

> **MAX Strategy**: Triggered on creative work requests

## Purpose

Turn ideas into fully formed designs through collaborative dialogue BEFORE any code.

## Process

### 1. Understand the Idea
- Check current project state
- Ask questions ONE AT A TIME
- Prefer multiple choice when possible
- Focus on: description, constraints, success criteria

### 2. Explore Approaches
- Propose 2-3 different approaches
- Lead with recommendation + reasoning
- Include trade-offs for each

### 3. Present Design
- Break into 200-300 word sections
- Validate after each section
- Cover: architecture, components, data flow, testing

## Key Principles

| Principle | Why |
|-----------|-----|
| One question at a time | Don't overwhelm |
| Multiple choice preferred | Easier to answer |
| YAGNI ruthlessly | Remove unnecessary features |
| Incremental validation | Present → check → continue |

## Document Output

After design validated:
- Write to `docs/plans/{date}-{topic}-design.md`
- Use date-time stamp in filename
- Commit before implementation

## Transition to Implementation

Ask: "Ready to set up for implementation?"
- Load `writing-plans` skill
- Create implementation checklist
- Begin execution phase

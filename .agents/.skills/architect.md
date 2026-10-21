---
name: architect
description: Architecture-First Technical Design
user-invocable: true
disable-model-invocation: false
---

# SKILL: Architecture-First Technical Design

# TRIGGER: When given a complex feature request, system refactor, or a new project setup.

## Rules

1. STOP. Do not write, modify, or delete any implementation code yet.
2. Analyze the existing folder structure, design patterns, and dependency graph.
3. Propose a structural architecture plan BEFORE implementing changes.

## Execution Workflow

1. Present the user with a structural layout plan containing:

    - **File Additions/Modifications:** A tree view of proposed file paths.
    - **Data Flow:** How data moves through the new components.
    - **Edge Cases:** Potential performance bottlenecks or race conditions.

2. Ask the user: "Does this structural plan look correct? Say 'PROCEED' to begin writing code."

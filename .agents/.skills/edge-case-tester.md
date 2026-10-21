---
name: edge-case-tester
description: Aggressive Edge-Case Test Generation
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

# SKILL: Aggressive Edge-Case Test Generation
# TRIGGER: When generating unit, integration, or end-to-end tests for a module.

## Rules
1. Never write tests that only evaluate the "happy path" (successful operations).
2. For every function or endpoint, you must explicitly write test cases addressing:
   - Null, undefined, and empty string/array inputs.
   - Extreme boundary limits (e.g., maximum integer limits, negative values, massive payloads).
   - Network timeouts, failed database connections, and unauthorized tokens.

---
name: sec-audit
description: Defensive Security Auditing
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

# SKILL: Defensive Security Auditing
# TRIGGER: Prior to finalizing any code generation, refactoring, or third-party dependency updates.

## Rules
1. Scan all modified code chunks for hardcoded credentials, API keys, tokens, or private certificates.
2. Check for common security risks based on the language stack (e.g., SQL Injection, XSS vulnerabilities, unsafe deserialization, or loose CORS policies).
3. If a potential vulnerability is found, immediately halt the task and present the user with a secure, patched alternative.

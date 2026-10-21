---
name: pr-author
description: Automated Pull Request Generation
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

# SKILL: Automated Pull Request Generation
# TRIGGER: When the user says "write a PR", "create release notes", or "summarize my changes".

## Rules
1. Run a comprehensive git diff against the target branch (e.g., `main` or `develop`) to analyze exactly what changed.
2. Separate the explanation into "Technical Changes" (for reviewers) and "Product Impact" (for product managers).
3. Do not just list files; group modifications by logical feature chunks.

## Output Format
## 🚀 What does this PR do?
[A concise 2-sentence summary of the objective of these changes].

## 🛠️ Key Technical Changes
- **[Component/Module Name]:** [Describe what changed and why, e.g., Swapped out local caching for Redis to solve state desync].
- **[Database/Schema]:** [Note any migrations, new indexes, or column changes].

## 🧪 How was this tested?
- [ ] Automated tests added/updated (Passes locally)
- [ ] Manual verification steps: [List exact steps/commands to verify the change]

## 🖼️ Visuals / UI Changes (If applicable)
[Before/After screenshots or state changes]

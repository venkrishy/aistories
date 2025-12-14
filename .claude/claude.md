@ai_docs/Agents.md

READ README.md, ai_docs/Agents.md, and README_PROJECT.md, then run git ls-files to understand the context of the project.

Please don't use EMOJIs in any logging statements.  I hate them.
All code must be written in a modular way, and where possible, using good object-oriented design principles.

1. Minimal output - Limit to under 1,000 tokens (where possible), show final answers only, no code dumps or verbose exploration.
2. Log work - Write summaries to claude_history.txt (300 words max per line, with token counts)
3. Always use Context7 - Automatically use Context7 MCP tools for code generation, setup, config, or library docs
4. pnpm only - Never use npm
5. Testing/PR standards - Run lint and test before commits, title PRs with [<project_name>] format
6. Use Serena MCP.  If you are not having serena in the /mcp list, inform me.

Please execute the slash command /context_prime on startup

## Node
    - Never use Javascript, use Typescript only
    - Use ES modules only
    - never use require


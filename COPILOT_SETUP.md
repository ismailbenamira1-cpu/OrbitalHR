# Copilot setup (3 steps)

1. Copy these files into your GitHub repo, keeping the same folders, and commit:
   - `src/App.jsx` (adds the chat panel)
   - `functions/_shared/ai.js` (new)
   - `functions/api/compliance-assistant.js`
   - `functions/api/employee-summary.js`
2. In Cloudflare: Workers & Pages, your project, Settings, Variables and Secrets. Add a **Secret**:
   `ANTHROPIC_API_KEY` = your key from console.anthropic.com. Optional: `CLAUDE_MODEL` (default `claude-haiku-5-5`).
   If you add no Anthropic key, it falls back to your existing `GEMINI_API_KEY`.
3. Cloudflare redeploys after the commit. Open the site and click **Ask Copilot** (bottom right).

Never put the API key in the repo or in any `VITE_` variable.

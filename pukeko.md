<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Pukeko PRD

## Repo decision log

Last updated: March 10, 2026

### Confirmed product and architecture decisions

- The current build should continue from the existing Handy codebase and keep the current Tauri shell for now.
- Do not replatform or start from scratch before Stage 1 is working end to end.
- The desktop shell should still feel native on macOS even though it is no longer a Swift/AppKit app.
- Model and AI runtimes stay behind local process boundaries where that makes sense.
- The primary day-to-day UX is menu bar first, not a large companion window.
- The always-available floating pill is a core interaction surface, not an optional flourish.
- Default dictation should use the Mac `fn` key as the hold-to-talk trigger unless the user changes it.
- Stage 1 should use Handy's existing menu bar, shortcut, overlay, and paste flow wherever possible.
- Local transcription target is Parakeet.
- Stage 1 insertion should use the same practical paste/insertion path Handy already uses, with clipboard fallback if needed.
- Local rewrite target is pinned to `mlx-community/Qwen3.5-0.8B-MLX-4bit` for now.
- Do not download larger Qwen rewrite tiers yet.
- Hosted or subscription-backed rewrite should use `codex app-server` over `stdio`, not the TypeScript SDK and not an OpenAI-compatible HTTP bridge.
- The previous generic Codex/OpenAI bridge was a stopgap and should be treated as replaced by the app-server path.

### Current build stages

- The staged plan in this section takes priority over broader later sections in this document.
- **Stage 1: working dictation.** Goal: hold `fn`, speak, release, get Parakeet transcription pasted back into the active app reliably.
- Stage 1 includes the minimum onboarding and permissions needed to make dictation work, plus menu bar and floating pill behavior that supports the loop.
- Stage 1 does not require AI rewriting. Raw or lightly cleaned transcription is acceptable if the full capture-to-paste loop works well.
- **Stage 2: AI rewrite.** Add two rewrite paths: hosted rewrite via `codex app-server` and local rewrite via Qwen `0.8B`.
- Stage 2 should keep local-first behavior and let the user choose when rewrite runs.
- **Stage 3: everything else.** Command Mode, history reprocessing, dictionary improvements, styles, scratchpad, and app-aware behavior come after Stages 1 and 2 are solid.

### Validation notes

- Local Qwen `0.8B` inference has already been validated directly on this machine.
- The app should continue to prefer local-first processing and only use hosted rewrite when the user explicitly selects it.

## Product summary

**Name:** Pukeko

**Tagline:** Open-source Mac voice dictation that grows into polished voice writing.

**Positioning:** Pukeko is a Mac-only, open-source, system-wide voice writing app built from the existing Handy app. The immediate goal is reliable Parakeet transcription and paste-back in any focused text field. After that, Pukeko adds optional local or hosted rewriting, with Codex and Qwen as the first rewrite targets.[^1][^2]

---

## Vision

Standard dictation tools capture what the user said.
Pukeko should capture what the user meant.

The product should feel like a native Mac utility: always available, nearly invisible when idle, and instantly useful anywhere text can be entered. The target interaction mirrors the documented Wispr Flow Mac pattern: menu bar presence, microphone and Accessibility permissions, hold a shortcut in any app, speak, and get text inserted where the cursor already is.[^2][^1]

---

## Problem

Typing is slower than speaking for many users, but most dictation tools fail in predictable ways:

- They transcribe too literally.
- They are brittle outside a few supported apps.
- They require too much cleanup after capture.
- They do not adapt to vocabulary, context, or tone.

Users want to ramble, revise mid-sentence, and think aloud while still ending up with clean writing. Long term, Pukeko should default to polished insertion, but right now Stage 1 prioritizes reliable transcription and paste-back first.

---

## Core promise

1. Press a hotkey.
2. Speak naturally, even if rambling or filler-heavy.
3. Stage 1: Pukeko transcribes with Parakeet and pastes the result back into the active app.
4. Stage 2: Pukeko can optionally rewrite that text with Codex or local Qwen before insertion.[^1][^2]

**Example transformation**

- Input: "So yeah basically I think we should um maybe consider like doing the project differently you know"
- Output: "I believe we should consider an alternative approach to the project."

**Product thesis**

- Standard dictation captures what users said.
- Pukeko captures what users meant.
- The default output is polished writing, not raw transcript.

---

## Goals

- Deliver the fastest path from spoken thought to usable written text on macOS.
- Make local-first usage the default.
- Support any focused text field that allows Accessibility-based insertion.
- Provide strong customization for tone, formatting, vocabulary, and workflow.
- Offer both BYOK and paid hosted convenience.
- Allow advanced users to reuse external AI subscriptions in a separate mode.

---

## Non-goals

- Windows, iPhone, Android in v1.
- Full enterprise admin suite in v1.
- Browser-extension-first architecture.
- Deep multi-user collaboration in v1.
- Full document editing inside the app.

---

## Target users

- Knowledge workers writing email, docs, chat, and notes.
- Developers dictating prompts, comments, tickets, filenames, and technical prose.
- Users with RSI or fatigue who prefer voice over typing.
- Power users who want low-friction global shortcuts and menu bar utilities.
- Privacy-sensitive users who prefer local-only or hybrid pipelines.

---

## Success criteria

- First dictation success within 5 minutes of install.
- Reliable insertion into the majority of common macOS text inputs.
- Noticeably lower editing effort than raw dictation.
- Daily habit formation for messaging, email, and note-taking.

---

## Experience

## Product principles

- Invisible when idle, obvious when active.
- One primary action: hold, speak, release.
- Default to the keyboard the user already has under their left hand.
- Work in the background without requiring the user to open the app window.
- Prefer polished text over literal transcription.
- Never steal focus from the current app.
- Always provide a fallback if direct insertion fails.

## Mac UX model

Pukeko runs as a background menu bar app with launch-at-login. The normal experience should not require opening the main window. The everyday control surfaces are the menu bar dropdown, global shortcut handling, and a compact floating pill that hovers on screen while Pukeko is available.

The main window exists for onboarding, history, style controls, dictionary management, and deeper settings. After setup, most users should be able to go days without opening it.

On first launch, onboarding walks the user through microphone permission, Accessibility permission, language selection, shortcut setup, mic testing, and privacy preferences, following the same Mac setup elements Wispr documents.[^3][^1]

## Core interaction

1. User clicks into any text field.
2. User presses and holds `fn` by default, or a custom shortcut if they have changed it.
3. The floating pill expands into a listening state and becomes visually active.
4. Audio capture begins immediately.
5. Local ASR produces a transcript.
6. Rewrite logic converts the transcript into polished text.
7. On key release, the pill collapses and final text is inserted at the cursor.
8. User can undo or reopen the session from History.

### Floating pill behavior

- A small capsule-shaped pill stays visible while Pukeko is enabled.
- In idle state it remains compact and low-noise.
- On key down it expands, animates into a listening state, and shows live microphone activity.
- During processing it can indicate transcribing or rewriting without stealing focus.
- After insertion it returns to its compact resting state.

### Default shortcut behavior

- Default dictation trigger: hold `fn`, speak, release.
- The trigger should feel immediate on key down and complete on key up.
- Users can override this in Settings if `fn` conflicts with their workflow.

## First-run onboarding

- Install and launch.
- Sign in or skip to local-only mode.
- Microphone permission.
- Accessibility permission.[^1]
- Language choice or auto-detect.[^3]
- Shortcut setup, with `fn` preselected as the recommended default.
- Mic test with live audio bars.
- Short interactive tutorial.
- A "Try Pukeko" quick-start drawer that opens common target apps like Notes, Mail, Slack, or a code editor, inspired by the guided first-use pattern in Wispr's setup materials.[^1]

## Interaction modes

- **Dictation Mode:** fast polished insertion.
- **Raw Transcript Mode:** minimal cleanup and near-verbatim output.
- **Rewrite Mode:** stronger prose improvement from messy speech.
- **Command Mode:** transforms selected text with a spoken instruction, matching the selected-text voice workflow Wispr documents.[^4]
- **Hands-Free Mode:** tap once to start, tap once to stop.
- **Scratchpad Mode:** dictate into a floating local note before inserting elsewhere.
- **Power Mode:** app-aware automatic behavior based on the active window.

## Command Mode UX

Wispr's help docs describe Command Mode as a desktop mode activated by a separate shortcut, used on selected text, and able to replace that text with transformed output, with ESC to cancel. Pukeko mirrors that concept.[^4]

Flow:

1. User highlights text in any app.
2. User holds the command shortcut.
3. User speaks an instruction such as "make this shorter" or "translate to Dutch."
4. On release, selected text is replaced.
5. Cmd+Z restores the original.

---

## Features

## Core features

### System-wide dictation

- Works in any focused text field supported by Accessibility insertion.
- Uses global hotkeys.
- Never requires switching apps.
- Preserves cursor position when possible.

### Menu bar utility

- Persistent menu bar icon.
- Quick status menu: Home, start or stop dictation, paste last transcript, shortcuts, microphone, accessibility, languages, history, settings, help, quit.
- This dropdown is the primary control surface for everyday use when the main window is closed.
- The app should feel fully usable as a background utility even if the window is rarely opened.

### Floating pill

- Always-available compact pill visible while Pukeko is running.
- Expands on hold-to-talk and shrinks when idle.
- Serves as the lightweight, always-there affordance that tells the user Pukeko is ready.
- Shows listening, transcribing, rewrite, failure, and fallback states without becoming a full window.

### Real-time dictation states

- Idle → Listening → Transcribing → Rewriting → Inserted → Failed → Clipboard fallback.

### Editing while speaking

Real-time cleanup including punctuation handling, filler removal, numbered lists, and backtracking correction of phrases like "actually…" mid-utterance, matching the formatting behaviors documented on Wispr's public features pages.[^5][^1]

### Spoken editing commands

- New line.
- New paragraph.
- Bullet list.
- Numbered list.
- Undo last phrase.
- Press enter.
- Stop listening.
- Cancel.

---

## Voice processing

### Processing paths

- Local only.
- BYOK cloud.
- Hosted cloud.
- Hybrid: local transcription + hosted rewrite.
- Subscription Reuse Mode (separate, see below).

### Local model strategy

**ASR: Parakeet-MLX**
The `senstella/parakeet-mlx` repository presents Parakeet-MLX as an implementation of NVIDIA Parakeet ASR models for Apple Silicon using MLX. A Swift-native `swift-parakeet-mlx` implementation also exists. The repo exposes a CLI, Python API, aligned sentence/token timestamps, chunking, local-attention for lower memory, and `transcribe_stream` for real-time capture.[^6][^7]

**Rewrite: Qwen3.5**
The `QwenLM/Qwen3.5` repo exists as an Apache-2.0 open model family. Public Hugging Face model pages include `Qwen3.5-0.8B`, `Qwen3.5-4B`, and larger quantized MoE variants.[^8][^9][^10][^11]

**Model tiers**

| Tier         | Model                    | Use case                                        |
| :----------- | :----------------------- | :---------------------------------------------- |
| Fast         | Qwen3.5-0.8B             | Low-RAM Macs, fast casual dictation [^9]        |
| Balanced     | Qwen3.5-4B               | Most users, best quality/latency tradeoff [^10] |
| High-quality | Qwen3.5 large quantized  | High-memory Macs, long-form writing [^11]       |
| ASR default  | Parakeet-MLX (TDT class) | All Macs by default [^6]                        |

### User controls

- Choose dictation language.[^3]
- Choose local or remote processing.
- Choose local ASR package and download assets.
- Choose local rewrite tier.
- Connect API keys for hosted routing.
- Set per-mode routing rules.
- Control latency vs quality.
- Enable or disable streaming preview.

---

## Subscription Reuse Mode

### Purpose

An optional advanced mode that lets users route rewrite and command-mode tasks through existing external AI subscriptions, rather than paying for a second hosted layer inside Pukeko. Off by default, clearly marked experimental.

### Supported backends

**Claude-compatible via Anthropic Agent SDK**
Anthropic's Agent SDK overview says it is the renamed Claude Code SDK and exposes the same tools, agent loop, and context management that power Claude Code. Importantly, Anthropic's docs also state that third-party developers may not offer claude.ai login or claude.ai rate limits for their own products without prior approval, so this mode must use API keys or approved provider auth, not claude.ai account piggybacking.[^12]

**Codex-compatible via provider bridge**
OpenClaw's OpenAI provider docs show that Codex supports ChatGPT sign-in for subscription access or API-key sign-in for usage-based access, and maps Codex-style usage through provider/model refs such as `openai-codex/*`. Pukeko can implement a compatible adapter.[^13]

### Scope

- Rewrite Mode.
- Command Mode.
- History reprocessing.
- Long-form polish.

### Not in scope for v1

- Mandatory dependency on external CLI sessions.
- Hidden terminal automation.
- Always-on streaming rewrite through agent backends.
- Making subscription reuse the default path.

---

## Styles and Power Mode

### Styles

User-editable presets: Formal, Casual, Very casual, Technical, Concise, Friendly, Minimal, Custom.

Wispr's docs describe configurable Styles by context categories including personal, work, email, and other, and note that style formatting is currently English-only. Pukeko generalizes this into app-aware style profiles auto-applied by bundle identifier.[^14]

### Power Mode app presets

- **Slack:** casual tone, optional emoji allowance.
- **Gmail:** professional tone and paragraph formatting.
- **VS Code:** code-aware, lighter prose rewrite.
- **Notes:** minimal cleanup and structure.

### Style controls

- Punctuation density.
- Paragraph length.
- Capitalization strictness.
- Emoji allowance.
- List preference.
- Formality, concision, technicality.
- Preserve slang toggle.
- Preserve speaker disfluency toggle.
- Per-app overrides plus one-click temporary override.

---

## History panel

- Search past recordings and sessions.
- View raw transcript vs polished output side by side.
- Replay audio if stored locally.
- Reprocess a session with a different style, rewrite tier, or backend.
- Compare Voice vs AI output.
- Delete one or all sessions.
- Export transcript or copy polished output.
- Report issue from a session.

---

## Dictionary and accuracy

### Personal dictionary

- Names, jargon, acronyms, product names, casing preferences, domain-specific words.
- Auto-save corrections toggle: manual edits to transcripts get added as canonical entries.[^15]
- Review and manage learned entries.

### Accuracy stack

- Decoder-time word boosting and contextual biasing for rare terms.
- Post-transcription canonicalization layer.
- Alternate pronunciation mapping for acronyms and compounds.
- App-specific vocabulary boosts.
- Technical presets with seed vocabularies for developers.[^16][^17]

### Developer mode

- Developer vocabulary presets.
- Code-aware rewrite rules.
- Less aggressive prose cleanup in editors.
- Filename and symbol preservation where possible.

---

## Context awareness

- Read selected text and nearby editable text.
- Use prior sentence context to improve capitalization, continuity, and spelling.[^18]
- **Optional enhanced context mode:** captures a safe snapshot of the active text region for better rewrite context. Fully opt-in with strong visual disclosure.

Context awareness in Wispr auto-excludes password fields from reading, which Pukeko should replicate for the context extraction layer specifically.[^18]

---

## Requirements

| Area               | Requirement                                        | Priority | Acceptance criteria                                                         |
| :----------------- | :------------------------------------------------- | -------: | :-------------------------------------------------------------------------- |
| Activation         | Global hotkey from anywhere in macOS               |       P0 | User starts dictation without switching apps                                |
| Activation UX      | Default trigger is hold `fn`                       |       P0 | User can press `fn`, speak, and release without opening the app window      |
| Insertion          | Paste final text via Accessibility APIs            |       P0 | Works in browsers, mail apps, chat apps, notes apps, and editors            |
| Onboarding         | Guided install, mic, Accessibility, shortcut setup |       P0 | First successful dictation in under 5 minutes                               |
| Dictation          | Hold-to-talk capture                               |       P0 | Audio starts on key-down, stops on key-up                                   |
| Pill UI            | Floating pill available while app is running       |       P0 | User always has a visible low-noise indicator that Pukeko is ready          |
| Rewrite default    | Final output defaults to polished prose            |       P0 | Rambling speech becomes clear text in common cases                          |
| Raw mode           | Optional transcript-first mode                     |       P1 | User can bypass rewrite                                                     |
| Command mode       | Rewrite highlighted text with spoken instructions  |       P1 | Selected text is replaced and undo works                                    |
| Local ASR          | Parakeet-MLX integration                           |       P0 | App runs local transcription on Apple Silicon [^6]                          |
| Local rewrite      | Qwen3.5 support                                    |       P0 | App rewrites locally using a selectable Qwen3.5 tier [^8][^10][^9]          |
| Model management   | Download, remove, update local assets              |       P1 | User manages local assets in Settings                                       |
| Hybrid routing     | Local ASR + hosted rewrite                         |       P0 | User can mix local and remote stages                                        |
| Subscription reuse | Separate advanced routing mode                     |       P1 | Claude-compatible and Codex-compatible rewrite routing available [^12][^13] |
| Styles             | Auto-apply by active app                           |       P0 | Slack, Gmail, VS Code, Notes modes work predictably                         |
| History            | Search, compare, reprocess, delete, report         |       P0 | Sessions discoverable and manageable                                        |
| Dictionary         | Manual entries plus auto-learned corrections       |       P0 | Corrected words improve future output                                       |
| Context            | Optional selected-text and text-region context     |       P1 | Rare names and app-specific terms improve                                   |
| Screenshot context | Optional screen-region assist                      |       P2 | Strictly opt-in with clear disclosure                                       |
| Undo               | Single-action undo after insertion                 |       P0 | Most recent insertion reverted immediately                                  |
| Reliability        | Fallback when direct insertion fails               |       P0 | User can copy output manually without data loss                             |
| Streaming preview  | Partial text before final insertion                |       P1 | User sees draft transcription while speaking                                |
| Performance        | Low-latency capture and insertion                  |       P0 | Feels instant for everyday messaging and writing                            |

---

## Functional requirements

- Menu bar app with launch at login.
- Menu bar dropdown as the primary quick-control surface.
- Always-visible floating pill with compact idle and expanded listening states.
- Microphone permission flow.
- Accessibility permission flow.
- Configurable keyboard shortcuts with Mac-safe constraints.[^19]
- Optional mouse button trigger later.
- Per-app style mapping.
- Searchable local history database.
- Encrypted local credential storage for BYOK keys.
- Pluggable provider architecture for transcription and rewrite.
- Local asset manager for model downloads.
- Safe crash recovery with session preservation.
- Clipboard fallback when insertion fails.
- Visible remote-processing indicator.
- Accountless local-only mode.
- Export and import settings.
- Dictionary import and export.

---

## Architecture

### Components

- Mac menu bar shell.
- Global shortcut manager.
- Audio capture service.
- Local transcription adapter (Parakeet-MLX).[^7][^6]
- Rewrite router (local Qwen3.5 + hosted adapters).[^9][^10][^8]
- Subscription reuse router (Claude Agent SDK adapter + Codex provider bridge).[^12][^13]
- Accessibility insertion service.
- Context collector for selected and surrounding text.
- Optional screenshot context service.
- Dictionary and canonicalization engine.
- Local history store.
- Model asset manager.
- Credential manager.
- Crash reporter with redaction.
- Update service.

### Pipeline

1. User holds shortcut.
2. Audio capture starts.
3. Parakeet-MLX transcribes locally by default.[^6]
4. Contextual biasing and canonicalization applied.
5. Transcript routed to local Qwen3.5, hosted backend, or subscription-reuse backend.[^8][^13][^12]
6. Rewrite output filtered through style and app rules.
7. Final text inserted via Accessibility APIs.
8. Session stored in History per user settings.

### Data model

**Session:** ID, timestamp, active app, language, processing route, audio path (optional), raw transcript, polished output, style used, error state, duration.

**Dictionary entry:** written form, alternate spoken forms, category, weight, casing lock, source (manual or auto-learned), last used date.

**Style profile:** name, app mapping, formality, concision, emoji policy, list preference, paragraph preference, technicality, preserve slang toggle.

**Provider config:** provider type, auth method, local/remote flag, model identifier, routing scope, allowed modes, fallback behavior.

---

## User stories

- As a writer, I want to hold one shortcut and speak into any app so I can replace typing.
- As a student, I want to ramble through ideas and get clean prose instead of raw transcript.
- As a developer, I want app-aware behavior in editors so cleanup does not break code.
- As a privacy-sensitive user, I want a fully local mode when possible.
- As a power user, I want BYOK cloud routing for better quality when I choose it.
- As a reviewer, I want to compare Voice and AI output side by side.
- As a multilingual user, I want to choose my dictation language during setup.[^3]
- As an advanced user, I want to reuse a Claude-compatible or Codex-compatible backend for premium rewrite tasks without changing the default local dictation path.[^13][^12]

---

## Implementation stages

### Stage 1 - working dictation first

- Reuse the current Handy app shell instead of rebuilding the app framework.
- Menu bar app, floating pill, and minimum onboarding needed for first successful dictation.
- Global hotkey dictation with `fn` as the default on macOS.
- Parakeet local transcription working reliably.[^6]
- Paste the transcript back into the focused app using Handy's current insertion path.
- Keep clipboard fallback so the user never loses text.
- Success condition: press, speak, release, and see text appear reliably in real apps.

### Stage 2 - AI rewrite

- Hosted rewrite via `codex app-server`.
- Local rewrite via Qwen `0.8B`.[^10][^9][^8]
- User-selectable rewrite routing with local-first defaults.
- Rewrite should be optional so Stage 1 dictation remains fast and dependable.
- Basic compare between transcript and rewritten output.

### Stage 3 - workflow upgrades

- Command Mode.
- Reprocess pipeline.
- Selected-text context.
- History improvements.
- Dictionary improvements.
- Styles and Power Mode.
- Scratchpad and other advanced workflow features.

### Later

- Screenshot context.
- Provider marketplace.
- Shared dictionaries.
- Team presets.
- MDM-ready deployment.

---

## Open questions

- What is the exact fallback behavior on apps where the normal insertion path fails?
- How aggressive should default rewriting be?
- Should Command Mode and Dictation Mode share a shortcut family or stay separate?
- Should screenshot context be allowed in all modes or only with explicit per-session opt-in?
- What is the best default local rewrite tier by Mac memory class?
- Should Subscription Reuse Mode support long-lived sessions or remain task-based only?

---

## Launch metrics

- First dictation success rate.
- Median time to first successful insertion.
- Median insertion latency.
- Daily active dictation users.
- Average words dictated per active user.
- Rewrite acceptance rate.
- Undo rate after insertion.
- Crash-free session rate.

<div align="center">⁂</div>

[^1]: https://docs.wisprflow.ai/articles/3152211871-setup-guide

[^2]: https://docs.wisprflow.ai/articles/6409258247-starting-your-first-dictation

[^3]: https://docs.wisprflow.ai/articles/3191899797-use-flow-with-multiple-languages

[^4]: https://docs.wisprflow.ai/articles/4816967992-how-to-use-command-mode

[^5]: https://docs.wisprflow.ai/articles/5373093536-how-do-i-use-smart-formatting-and-backtrack

[^6]: https://github.com/senstella/parakeet-mlx

[^7]: https://github.com/FluidInference/swift-parakeet-mlx

[^8]: https://github.com/QwenLM/Qwen3.5

[^9]: https://huggingface.co/Qwen/Qwen3.5-0.8B

[^10]: https://huggingface.co/Qwen/Qwen3.5-4B

[^11]: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-GPTQ-Int4

[^12]: https://platform.claude.com/docs/en/agent-sdk/overview

[^13]: https://wisprflow.ai/features

[^14]: https://docs.wisprflow.ai/articles/2368263928-how-to-setup-flow-styles

[^15]: https://docs.wisprflow.ai/articles/4052411709-teach-flow-your-words-with-the-dictionary

[^16]: https://docs.wisprflow.ai/articles/6434410694-use-flow-with-cursor-vs-code-and-other-ides

[^17]: https://wisprflow.ai/post/developer-tools

[^18]: https://docs.wisprflow.ai/articles/4678293671-feature-context-awareness

[^19]: https://docs.wisprflow.ai/articles/2612050838-supported-unsupported-keyboard-hotkey-shortcuts

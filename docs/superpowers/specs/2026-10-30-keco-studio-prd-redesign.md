# Keco Studio PRD Website Redesign

## Purpose

Rebuild the public website homepage around one primary job: help a visitor
understand Keco Studio and download the correct desktop client. The source of
truth is `Keco_Studio网站PRD.docx`, refined by the decisions recorded here.

This is an information architecture and interaction rewrite, not a visual
rebrand. The current website's visual language must remain recognizable.

## Confirmed Scope

- Replace the current homepage content with a single-page product and download
  experience.
- Keep the repository's static HTML, CSS, and vanilla JavaScript architecture.
- Keep `pricing.html` and `game-designers.html` in the repository, but remove
  them from the new homepage navigation.
- Provide complete English and Simplified Chinese interface copy.
- Use English by default and remember an explicit language choice locally.
- Preserve the existing automatic day/night theme and manual theme override.
- Use the current screenshot in `assets/screenshots/` as a temporary source for
  the hero and all feature carousels.
- Use real GitHub Release files for supported desktop downloads.
- Do not require an account before downloading.
- Do not start a download until the visitor explicitly clicks a download
  control.

## Existing Visual Baseline

The redesign must derive its styling from the existing `styles.css` tokens and
components. It must not introduce a competing design system.

### Color

- Light background: `#ffffff`
- Light panel: `#f3f5fa`
- Light ink: `#0b1020`
- Secondary ink: `#5b6275`
- Primary accent: `#1d4ed8`
- Dark background: `#0b1020`
- Dark panel: `#141a2b`
- Dark card: `#1a2134`
- Dark theme accent: `#6b8cff`

### Typography

- Continue using the current stack based on `Source Sans 3`, with the existing
  Rotis and system fallbacks.
- Reuse the existing display, section, body, label, and caption scale.
- Keep normal letter spacing and the current regular-to-semibold weight range.

### Layout And Components

- Keep the 1440 px maximum content width, 12-column grid, and 24 px gutter.
- Keep square corners on buttons, panels, screenshot frames, and controls.
- Keep thin rule-based separation, existing button treatments, and the dark
  footer.
- Keep the current focus outline, reduced-motion behavior, and responsive
  breakpoints.
- The PRD's rounded feature containers are intentionally superseded by the
  user's requirement to preserve the current visual style.

### Signature Element

The real Keco Studio workspace is the dominant visual proof. A large product
screenshot appears immediately after the hero copy and repeats in controlled
feature crops. It is framed with the site's existing panel, line, and label
language rather than a new decorative device.

## Page Structure

```text
Sticky header
  Utility links / language
  Logo / five feature anchors / theme / language / download
Hero
  Product name and value proposition / detected download action
  Real Keco Studio product screenshot
Five product feature sections
  Game Design System
  AI Agent
  Simulator
  Script
  Map
Download versions and system requirements
Installation guidance
FAQ and support
Closing download call to action
Footer
```

The first desktop viewport must show the product name, value proposition,
recommended download action, and a visible portion of the product screenshot.
Mobile must show the same primary action without horizontal overflow.

## Header

The existing two-level sticky header remains. The utility row contains help
status and language controls. The primary row contains:

- Keco logo linking to the top of the page.
- Anchors for Game Design System, AI Agent, Simulator, Script, and Map.
- Existing theme control.
- Language control showing the language the visitor can switch to.
- Primary client download action.
- Existing mobile menu behavior at narrow widths.

Anchor navigation uses smooth scrolling unless the visitor requests reduced
motion. The active visual treatment remains the existing blue underline.

## Hero And Primary Download

Hero copy is fixed by the PRD:

- Product name: `Keco Studio`
- Headline: `Make your game, one slice at a time.`
- English supporting copy: `Keco is a workbench for building games. You write
  the design; Keco turns it into data and art, helps you build a playable slice
  in Godot, then scores it against a fixed standard and tells you what to fix
  next.`
- Chinese content is a faithful translation, not shortened marketing copy.

The hero uses the existing 12-column structure. The primary button names the
detected supported platform. A secondary action moves to the full version
selector. Release version, file type, file size, and publication date are
visible near the primary action.

The product screenshot is displayed at its natural 1893:1012 ratio inside a
stable frame. It uses object fitting without cropping critical navigation in
the full hero view.

## Download Data And Platform Detection

The current stable client source is the `Keco-Studio/keco-desktop` GitHub
Release `v0.1.7`, published `2026-09-29`.

Supported assets:

| Platform | Architecture | File | Size |
| --- | --- | --- | ---: |
| Windows | x64 | `Keco-Studio-Setup-0.1.7-windows-x64.exe` | 5,300,935 bytes |
| macOS | Apple Silicon | `Keco-Studio-0.1.7-macos-arm64.dmg` | 1,837,056 bytes |
| macOS | Intel | `Keco-Studio-0.1.7-macos-x64.dmg` | 1,941,574 bytes |

Detection rules:

- Windows recommends Windows x64.
- macOS uses high-entropy user-agent architecture data when the browser makes
  it available.
- macOS without reliable architecture data presents the two Mac choices and
  recommends Apple Silicon without silently downloading either asset.
- Linux shows Linux as detected and `Coming soon`; it does not attach a fake
  download URL.
- Mobile and tablet visitors see `Send to your computer` guidance plus the
  available desktop choices. No mobile application is claimed.
- Unknown desktop platforms see the full version selector.

All available platform choices remain accessible regardless of detection. A
click on an available version begins the real GitHub download and exposes a
download status panel containing installation guidance, a retry link, and a
link back to the version selector. After three seconds, the status panel makes
the retry and alternative-version actions visually prominent; the page cannot
reliably assert whether the browser completed the transfer.

## Feature Sections And Carousels

Feature order is fixed:

1. Game Design System
2. AI Agent
3. Simulator
4. Script
5. Map

Every section uses the same current-site feature-row grammar: five columns of
copy and seven columns of screenshot panel on desktop, stacked copy then media
on mobile. The structure remains consistent rather than alternating direction.

Each feature contains the PRD copy in English and Chinese. Each screenshot
carousel has:

- A stable 1893:1012 aspect ratio.
- Three configured slides in the initial release, all using the current source
  image with different crop positions and truthful captions.
- Previous and next icon buttons with accessible labels.
- Pagination dots with the active slide exposed to assistive technology.
- A three-second automatic interval.
- Pause on pointer hover and keyboard focus.
- Timer reset after a manual change.
- A subtle horizontal or opacity transition consistent with the existing
  motion language.
- No automatic motion when reduced motion is requested.
- A fixed-size failure state with a retry action.

The asset configuration is centralized in JavaScript so future screenshots can
replace a path and caption without changing markup or carousel logic.

## Version, Requirements, And Installation

The section uses current panel and rule styles, not rounded cards.

Temporary requirements approved for `v0.1.7`:

| Requirement | Minimum | Recommended |
| --- | --- | --- |
| Windows | Windows 10, 64-bit | Windows 11, 64-bit |
| macOS | macOS 12 | Current macOS release |
| Memory | 4 GB | 8 GB |
| Storage | 100 MB installation space | 500 MB free space |
| Account | Required on first launch | Existing Keco account |
| Network | Required | Stable broadband connection |

Windows instructions state that the current installer is unsigned and may
trigger SmartScreen. macOS instructions direct the visitor to choose the DMG
matching the Mac chip and state that current builds are ad-hoc signed but not
notarized. Instructions must describe Finder Open or Privacy & Security's Open
Anyway control without suggesting unsafe security bypasses.

Linux and mobile entries are visible but marked as coming soon and disabled as
download actions.

## FAQ And Auxiliary Links

FAQ uses the existing native `details` interaction and is collapsed by default.
It answers the eight questions in the PRD:

- What is Keco Studio?
- Who is it for?
- Which operating systems are supported?
- What should I do if downloading or installation fails?
- Is an account required for first use?
- Is project data stored locally or in the cloud?
- How do I update or uninstall the client?
- Where can I find release updates or support?

Answers are conservative and based only on verified product and desktop
documentation. Where storage behavior is not fully documented, the answer
states that the desktop application connects to the online Keco Studio service
and does not promise local-only storage.

Help, privacy, terms, cookies, and filing links have no supplied destination or
legal text. They remain visible as non-navigating status controls labeled
`Coming soon` / `即将提供`, with no `#` links that unexpectedly jump the page.
Existing verified community links and the public GitHub organization remain
available in the footer.

## Localization

English is the initial language. A language dictionary controls all visible
interface text, accessibility labels, download statuses, captions, FAQ content,
and document metadata that can be updated at runtime.

The chosen value is saved under a dedicated local-storage key. Storage failure
must not break the language control. The page updates `html.lang` to `en` or
`zh-CN`. Platform names, version numbers, filenames, and URLs are shared data
rather than duplicated translations.

## Interaction And Failure Handling

- A missing screenshot keeps its reserved aspect ratio and shows localized
  failure text plus a retry button.
- A missing download URL renders a disabled coming-soon control.
- JavaScript enhancements are defensive: the static content, navigation, FAQ,
  and direct supported download links remain understandable if optional logic
  does not initialize.
- Theme and language storage errors are ignored after applying a usable in-memory
  state.
- The mobile menu closes after selecting an anchor and reports its expanded
  state through ARIA.
- Carousel controls, theme, language, menu, and downloads are keyboard usable.

## Responsive Behavior

- Desktop uses the existing 12-column grid and current type scale.
- Tablet collapses feature text and image panels into a single column while
  preserving the screenshot aspect ratio.
- Mobile keeps primary actions full-width where needed, prevents long bilingual
  labels and filenames from overflowing, and keeps icon controls at least 44 px.
- Fixed-format elements use explicit aspect ratios and stable dimensions so
  loading, language switching, and slide changes do not shift surrounding
  content.

## Testing And Acceptance

Automated tests must cover:

- English default and saved Chinese restoration.
- Complete language switching for representative navigation, hero, status,
  FAQ, and accessibility-label content.
- Platform detection and download mapping for Windows, Mac Apple Silicon, Mac
  Intel, Linux, mobile, and unknown platforms.
- No automatic download during page load.
- Three-second carousel progression, pause, wraparound, manual reset, and
  reduced-motion behavior.
- Mobile menu and existing theme behavior.
- Static HTML contains the five feature anchors, direct supported download
  fallbacks, FAQ questions, and no dead `href="#"` controls.

Manual verification must include:

- Serving the site locally and checking desktop and mobile widths.
- Light and dark themes.
- English and Chinese at desktop and mobile widths.
- Hero and each carousel showing a nonblank product image.
- No layout overlap, horizontal scrolling, or shifting carousel heights.
- Supported download URLs returning a valid GitHub response.
- GitHub Pages build completing successfully after publication.

## Files And Ownership

- `index.html`: semantic single-page structure and no-JavaScript fallbacks.
- `styles.css`: existing visual system plus scoped styles for the new homepage
  components and states.
- `site.js`: theme preservation, localization, platform detection, download
  state, carousel behavior, and mobile navigation.
- `tests/`: focused Node tests for localization, downloads, carousel state, and
  retained theme behavior.
- `assets/screenshots/`: current placeholder source and later product screenshot
  replacements.

The redesign does not introduce a framework, package manager requirement,
backend, analytics, newsletter submission, account flow, or fabricated legal
content.

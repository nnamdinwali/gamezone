# CalTracker reference findings for Rock City

The supplied CalTracker video shows a single-column, vertically scrollable mobile dashboard with a clear hero-to-detail hierarchy. The most important metric is visually dominant at the top, followed by a small set of secondary metrics and then detailed list content. The composition uses generous whitespace and safe-area-aware mobile spacing rather than a dense multi-widget dashboard.

The visual language is restrained and purposeful: an off-white background, white rounded cards, subtle borders or low-elevation shadows, and high corner radii around 16–20 points. Typography uses a bold sans-serif for primary numbers, medium-weight labels for categories, and quieter gray text for supporting units and remaining values. The reference uses one primary warm accent plus semantic colors for data categories instead of a decorative neon palette.

The interaction language is focused and calm. The video shows a growth-style progress animation on the primary visualization and a smooth centered loading state. The implementation guidance for Rock City is therefore to prioritize one clear earnings/cashout hero, a small metric row, and a focused offer/activity list; reduce decorative gradients and competing widgets; preserve icon consistency; and use subtle transitions for progress growth.

Preserved constraints: Rock City’s existing reward logic, ads, notification behavior, and NGN 3,349.90 cashout minimum must not change during the visual redesign.

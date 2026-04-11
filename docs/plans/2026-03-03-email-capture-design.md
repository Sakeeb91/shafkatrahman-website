# Email Capture Design

**Date:** 2026-03-03
**Platform:** Buttondown (free tier)
**Username:** shafkatsakeeb
**Form action:** `https://buttondown.com/api/emails/embed-subscribe/shafkatsakeeb`

## Approach

Inline forms only. No popups, no modals, no exit-intent. Styled native to the dark theme.

## Placements

### 1. Homepage — between bio and social icons

Copy:
> I write about AI infrastructure, scaling laws, and agent systems — what's actually happening, not what's trending. One email per week. Free.

### 2. End of article — above "Back to Writing" link

Copy:
> If you read this far, you'd probably like the newsletter. One email per week. Free.

### 3. Mid-article — for posts over 1,500 words (between sections)

Copy:
> Getting value from this? I send one analysis per week.

## Form Details

- Single field: email only (no name)
- CTA button text: "Subscribe"
- Method: POST to Buttondown embed endpoint
- Success state: form swaps inline to "You're in. Check your inbox." (minimal JS)
- No subscriber count displayed (add when list exceeds 1,000)

## Technical

- Update CSP in `_headers` to allow `buttondown.com` as form-action
- New `.email-capture` CSS section in `style.css`
- Dark theme consistent, muted — not louder than surrounding content
- No card/border on homepage, subtle separator on article pages
- Responsive: input + button on one line desktop, stacked on mobile

## Files to modify

- `style.css` — add email capture styles
- `index.html` — homepage form
- `_headers` — CSP update
- All article HTML files — end-of-article form
- Long articles (frost-crystals, ai_infrastructure, data-center) — mid-article form

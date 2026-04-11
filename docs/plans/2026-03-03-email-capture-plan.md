# Email Capture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Buttondown email capture forms to the homepage and all article pages.

**Architecture:** Pure HTML forms POST to Buttondown's embed endpoint. Minimal JS for success state only. CSS added to the shared stylesheet. CSP headers updated to allow Buttondown.

**Tech Stack:** HTML forms, CSS, Buttondown embed API, Cloudflare Pages headers

---

### Task 1: Add email capture CSS to style.css

**Files:**
- Modify: `style.css` (append before final media query at line ~2433)

**Step 1: Add email capture styles**

Add the following CSS before the `/* Mobile responsive */` comment at line 2433:

```css
/* Email Capture */
.email-capture {
    margin: 2rem 0;
}

.email-capture p {
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 1rem;
}

.email-capture-form {
    display: flex;
    gap: 0.5rem;
    max-width: 28rem;
}

.email-capture-form input[type="email"] {
    flex: 1;
    padding: 0.6rem 0.9rem;
    background: var(--muted-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--foreground);
    font-family: var(--font-body);
    font-size: 0.85rem;
}

.email-capture-form input[type="email"]::placeholder {
    color: var(--muted);
}

.email-capture-form input[type="email"]:focus {
    outline: none;
    border-color: var(--primary);
}

.email-capture-form button {
    padding: 0.6rem 1.2rem;
    background: var(--foreground);
    color: var(--background);
    border: none;
    border-radius: var(--radius);
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 200ms ease;
}

.email-capture-form button:hover {
    opacity: 0.85;
}

.email-capture-success {
    color: var(--muted);
    font-size: 0.9rem;
}

/* Article page email capture */
.article-email-capture {
    border-top: 1px solid var(--border);
    padding-top: 2rem;
    margin-top: 3rem;
}

.article-email-capture-mid {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 1.5rem 0;
    margin: 2.5rem 0;
}
```

And add to the existing mobile media query at the bottom:

```css
    .email-capture-form {
        flex-direction: column;
    }
```

**Step 2: Commit**

```bash
git add style.css
git commit -m "Add email capture styles to stylesheet"
```

---

### Task 2: Update CSP headers

**Files:**
- Modify: `_headers`

**Step 1: Add buttondown.com to CSP**

Add `form-action 'self' https://buttondown.com;` to the Content-Security-Policy header. Also add `https://buttondown.com` to the `default-src` directive.

The updated CSP line should be:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; form-action 'self' https://buttondown.com
```

**Step 2: Commit**

```bash
git add _headers
git commit -m "Add buttondown.com to CSP form-action"
```

---

### Task 3: Add email capture to homepage

**Files:**
- Modify: `index.html` (between hero-body div and social-section div, around line 103)

**Step 1: Add the email capture section**

Insert between the closing `</div>` of `hero-body` and the opening `<div class="social-section">`:

```html
<div class="email-capture animate-slide-up-delay">
    <p>I write about AI infrastructure, scaling laws, and agent systems — what's actually happening, not what's trending. One email per week. Free.</p>
    <form
        action="https://buttondown.com/api/emails/embed-subscribe/shafkatsakeeb"
        method="post"
        class="email-capture-form"
        onsubmit="setTimeout(()=>{this.parentElement.innerHTML='<p class=email-capture-success>You\\'re in. Check your inbox.</p>'},1000)"
    >
        <input type="email" name="email" placeholder="your@email.com" required>
        <button type="submit">Subscribe</button>
    </form>
</div>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "Add Buttondown email capture to homepage"
```

---

### Task 4: Add email capture to article pages (end of article)

**Files:**
- Modify: `writings/maiutics.html` — before `<footer>` (line ~492)
- Modify: `writings/art-intelligence-patterns.html` — before `<footer>` (line ~453)
- Modify: `writings/research/ai_infrastructure_analysis.html` — before `<footer>` (line ~906)
- Modify: `writings/research/data-center-investment-analysis.html` — before `<footer>` (line ~1243)
- Modify: `writings/window-frost-thermodynamics/frost-crystals-physics.html` — before `</main>` (line ~840)

**Step 1: Add email capture before footer/end of each article**

Insert this HTML block before each article's `<footer>` tag (or before `</main>` for frost article):

```html
<div class="article-email-capture" style="max-width: 640px; margin-left: auto; margin-right: auto; border-top: 1px solid var(--border, rgba(148,163,184,0.4)); padding-top: 2rem; margin-top: 3rem;">
    <p style="color: var(--muted, #94a3b8); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">If you read this far, you'd probably like the newsletter. One email per week. Free.</p>
    <form
        action="https://buttondown.com/api/emails/embed-subscribe/shafkatsakeeb"
        method="post"
        style="display: flex; gap: 0.5rem; max-width: 28rem;"
        onsubmit="setTimeout(()=>{this.parentElement.innerHTML='<p style=color:#94a3b8;font-size:0.9rem>You\\'re in. Check your inbox.</p>'},1000)"
    >
        <input type="email" name="email" placeholder="your@email.com" required
               style="flex:1; padding:0.6rem 0.9rem; background:rgba(148,163,184,0.1); border:1px solid rgba(148,163,184,0.4); border-radius:0.25rem; color:inherit; font-family:inherit; font-size:0.85rem;">
        <button type="submit"
                style="padding:0.6rem 1.2rem; background:#e2e8f0; color:#0f1419; border:none; border-radius:0.25rem; font-family:inherit; font-size:0.85rem; font-weight:500; cursor:pointer; white-space:nowrap;">Subscribe</button>
    </form>
</div>
```

Note: Article pages use inline `<style>` blocks rather than the shared stylesheet, so we use inline styles here to match their pattern.

**Step 2: Commit**

```bash
git add writings/
git commit -m "Add email capture to all article pages"
```

---

### Task 5: Deploy and verify

**Step 1: Push**

```bash
git push
```

**Step 2: Deploy to Cloudflare Pages**

```bash
wrangler pages deploy . --project-name=shafkatrahman
```

**Step 3: Wait for CI**

```bash
gh run list --limit 2
# Wait for completion
gh run view <run-id> --json status,conclusion
```

**Step 4: Verify live pages**

Check homepage and at least one article page to confirm the forms render correctly.

**Step 5: Update PROGRESS.md**

Mark task 1.3 as Done with commit hashes.

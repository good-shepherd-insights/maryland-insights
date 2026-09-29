# STYLE.md

Use this file to define what your writing must do, contain, and prove. `STYLE.md` contains substantive rules for argument, evidence, article structure, and publication readiness.

## What belongs here

- **Argument:** thesis standards, stakes, reasoning, counterarguments, originality, and intellectual payoff.
- **Evidence:** sourcing, verification, examples, data, provenance, and the level of support consequential claims require.
- **Article structure:** openings, sequencing, sections, transitions at the level of ideas, development, endings, formats, and reader movement.
- **Publication readiness:** the substantive and structural conditions a piece must satisfy before it is ready to publish.

Do not put word choice, sentence construction, cadence, punctuation, verbal tics, or tone rules in this file. Those belong in `VOICE.md`.

Classification test: if a rule changes the claim, support, organization, or readiness standard of the article, it belongs here. If it changes wording, sentence construction, or tone, it belongs in `VOICE.md`. Split mixed feedback into separate rules.

## Writing identity

- **Body of work or publication:** Maryland Insights site copy
- **What it is:** Site copy, feature pages, About, Services, homepage for the Maryland Insights GTM platform
- **What it is for:** Tells a Maryland business owner or Maryland agency what Maryland Insights is, what it isn't, and how to start. Every piece should move a qualified reader toward the next step.
- **What makes it distinct:** Combines state-level data positioning with engineering-grade infrastructure framing, and is ruthlessly honest about its boundaries

## Audience Context

- **Governing audience guide, if maintained:** None. Optional `AUDIENCE.md` not yet created.
- **Assignment-specific reader:** Primary reader is a Maryland marketing agency owner or operator. Secondary reader is a Maryland business owner who has been told about Maryland Insights by an agency. Tertiary reader is anyone evaluating the platform on the open web.

## Reader promise

Every piece should give the reader:

- A clear statement of what Maryland Insights is, anchored in the founder's voice, that survives a second reading
- An honest statement of what Maryland Insights is not, drawn with the same precision
- A specific reason this matters to them right now, grounded in either their customer reality or their technical reality
- A clear next step. The piece should leave the reader knowing what to do, who to talk to, or which page to read next.

The piece must serve one goal. One page. One reader action: book a conversation, read a feature page, contact us, or stop and disqualify themselves. Multiple goals per page dilute every goal.

## Thematic territory

### Recurring themes

- The data exists, but no one built the infrastructure to catch it at the local level. National brands fish with massive nets. Local businesses need a scalpel.
- The tools were never built for local businesses. They were built for someone else at a different scale, and local businesses inherited them and made do.
- Augmentation, not replacement. The platform makes what agencies and businesses already have work the way it was supposed to.
- Maryland-specific, not national. The clarity comes from exclusivity.
- Time back for the work that actually differentiates a business: strategy, creativity, customer relationships.
- Foundation over surface. Ten years of watching people invest in the wrong layer.

### Productive tensions

- Local credibility versus national-scale engineering tools
- Foundation work versus the visible features agencies sell
- Augmentation versus replacement (we make you better, not replace you)
- DIY enablement versus the explicit preference for agency partnership
- Honest boundary-drawing versus the temptation to be everything to everyone

### Outside the territory

- Ads and ad management. We do not run ads. Do not write copy that implies we do.
- Website design and build. We do not build websites. Do not describe Maryland Insights as a website builder or design agency.
- Direct growth guarantees. The platform enables growth. We do not promise results.
- National or global ambitions. Maryland is the boundary. Do not drift.
- Church and ministry framing. The founder has past work in that space. This project does not carry it.

## Intellectual posture

- **Claims:** Bold but precise. Stated as fact, not opinion. "We are X" not "We believe we are X."
- **Complexity:** Honest about messiness. Real customer situations do not resolve cleanly. Do not oversimplify the local-vs-national tension or the tool-debt argument.
- **Counterarguments:** Anticipate them and address them in line. "I get it, from a legacy standpoint, there's so much built on WordPress that you can't just uproot it. Fine." Then challenge.
- **Originality:** The original move is the combination: state-level data plus foundation-layer engineering plus augmentation framing. Do not bury any of the three. Do not introduce features that do not serve this combination.
- **Usefulness:** Reader walks away with three things: what Maryland Insights is, what it is not, and the next concrete step (a conversation, an audit, a migration).

## Evidence and provenance

- **Source of truth for voice and content:** The full interview transcript stored in the `maryland-insights` Hydra DB (collection `about-us`, source `about-us.md`). Verbatim phrases from this transcript are the highest-fidelity evidence.
- **Source of truth for positioning:** `MARYLAND-INSIGHTS-CORE-SUMMARY.md` at the project root. The transcript predates it. The summary is the canonical doc.
- **Source of truth for technical depth:** The founder's stated knowledge of the engineering stack (Vercel, Cloudflare, serverless, headless CMS, Astro, Next.js). Not stated explicitly in the transcript but consistent with the founder's "enterprise engineers have access to blazing-fast tools" line. Use with confirmation flagging.
- **Standards for citations:** Specific numbers, customer names, breach counts, performance stats. Do not invent. If the source does not say it, either omit it or stop and ask.
- **Distinguishing fact from inference:**
  - Reported fact = in the transcript or repo evidence
  - Personal experience = stated as founder experience, attributed
  - Inferred = added from founder's domain expertise, must be flagged as added in any draft
- **Claims that need extra verification:** Anything about competitor features, vendor pricing, regulatory claims, or load-time and uptime guarantees.

## Structural principles

### Primary structure: Boundary then depth

1. Open by stating what Maryland Insights is, in one or two short stacks.
2. Draw the line: what we are not, what we do not do.
3. Pivot to the deeper argument (foundation vs. surface, local vs. national, data as decision fuel).
4. Land on the augmentation framing.
5. Close on earned clarity or a customer moment.

**Use when:** Any About, Services, or homepage piece.

**Do not force it when:** Short feature explanations, where a story-then-principle pattern is enough.

### Alternate structure: Story then principle

1. Open with a specific customer situation (the restaurant and the small event).
2. Name the pattern underneath the story.
3. Apply the pattern to the reader's situation.
4. Close on what changes for them.

**Use when:** Feature pages that explain a specific capability (data, hosting, integrations).

## Openings

Strong openings tend to:

- Land the substantive claim in the first sentence (BLUF: bottom line up front).
- Use the founder's natural opener ("Let's talk about X" or a direct statement of the topic).
- Skip throat-clearing, mission-statement preambles, "welcome to our website" framing.

Avoid:

- "Welcome to Maryland Insights"
- "In today's fast-paced digital landscape"
- "We are pleased to announce"
- Any sentence that could appear on any platform's About page

Lead with what the reader gets, not with what the company is. The reader should know within five seconds whether this page is for them.

## Development and movement

- **Alternating pattern:** Story, then principle, then application. Repeat.
- **Speed:** The argument advances quickly. After each claim, the next sentence either gives evidence or complicates the claim. No filler transitions.
- **Section weight:** Earn each section. If a section can be cut without losing the piece, cut it.
- **Where practical instruction belongs:** Late in the piece, after the conceptual argument has landed. The reader needs to know what Maryland Insights is before they need to know how to start.
- **The messy middle:** The "wrong layer" argument (ten years of watching people invest in surface, not foundation) earns space. Do not compress it.
- **Scannable structure:** Write for scanners, not readers. Subheads carry weight. One idea per paragraph. Short paragraphs beat long ones. Bullets where the items are parallel. The reader should be able to extract the substance from a fast skim.
- **Audience-separated framing:** When the piece addresses more than one reader (businesses and agencies, technical and non-technical), split them into separate sections. Do not hedge with phrases like "whether you are a business or an agency." That hedges for both and serves neither.
- **Specificity:** Concrete numbers, named tools, named places, named boundary cases. Vague claims read as filler. Specific claims read as earned. When the source supplies a stat ("nine times out of ten"), use it. When it does not, do not invent.
- **Benefits over features:** Each capability earns its place by naming what the reader gets, not what the platform does. "Real-time data on who is visiting" beats "analytics dashboard."

## Endings

Strong endings tend to:

- Land on a one-word or short fragment ("Clarity.")
- Or a founder reflection ("I could have been doing this.")
- Or a direct, honest next step ("Start with a conversation.")
- Honor the boundary drawn in the opening.

Avoid:

- Generic inspiration.
- Sentimental wrap-up.
- Summary of points already made.
- False certainty about outcomes.

## Recurring moves and formats

| Move or format | Purpose | When it works | Failure mode |
|---|---|---|---|
| The boundary draw | Define what Maryland Insights is by stating what it is not. | First 200 words of an About or Services page. | Using it for any list of three, not just identity-defining ones. |
| The story-then-principle | Customer situation, then pattern, then application. | Feature pages, hosting, data. | The story has to be specific. Generic stories do not land. |
| The wrong-layer pivot | "Ten years of watching people invest in the wrong layer." | The deeper conceptual argument. | Do not use more than once per piece. |
| The augmentation restatement | "Not to replace. To make what you have finally work. Augmentation, not replacement." | Closing argument or platform-relationship explanation. | Using it as the opener. It earns weight late. |
| The signature close | One-word fragment or founder reflection. | Last 1 to 2 sentences of a piece. | Using it without earning it. |

## Writing anti-patterns

| Pattern | Why it does not belong | Better move |
|---|---|---|
| Calling Maryland Insights a SaaS | Violates the core positioning. | Platform, infrastructure, foundation, GTM platform. |
| Calling Maryland Insights a website builder or design agency | Violates the explicit "what we do not do" boundary. | Hosting, maintenance, integrations. Foundation layer. |
| Promising direct growth results | Violates the boundary. | "The platform enables it." |
| Smoothing the founder's voice into marketing prose | Loses the thing that makes it ours. | Stack declaratives, preserve the rhythm. |
| Generic Maryland-local color | "Charm City," "Old Line State." Flat and unmemorable. | Specific Maryland references only when they earn it. |
| Implying ad management | Violates explicit boundary. | Reframe as "the foundation that supports whatever traffic shows up." |
| Transcript cadence in every section | Reads as someone transcribing a conversation, not as professional copy. | Use transcript cadence sparingly. See `VOICE.md` "Form vs. register." |
| Hedging for both audiences | "Whether you are a business or an agency" dilutes for both. | Split into audience-separated sections. |
| Template pillar names | "Build / Optimize / Rank / Grow" is borrowed, not the founder's mental model. | Use the founder's actual concepts: Foundation, Decision Fuel, Maryland Visibility, Time Back. |
| Multiple page goals | Dilutes every goal. | One page, one reader action. |
| Invented stats | Damages trust. | Omit or stop and ask. |
| Closing on aspiration without action | "We're excited to help" without a CTA is filler. | Close on earned clarity plus a clear next step. |

## Copywriting principles for website copy that converts

Drawn from current research on conversion-focused copywriting. Apply these alongside the founder's voice and the project's substantive rules.

### Lead with the value proposition, not the identity

The reader should know within five seconds what the page is for and whether it is for them. The founder's three-beat negative identity is a powerful opener, but it is a boundary move, not a value-prop move. Follow the identity beat with a clear statement of what the reader gets.

### One page, one goal

Every page serves one reader action: book a conversation, read the next feature, contact us, or self-disqualify. Multiple goals dilute every goal. A page that tries to do everything does nothing well.

### Write for one reader, not everybody

Generic appeal to everyone appeals to no one. The primary reader is a Maryland marketing agency owner or operator. Secondary reader is a Maryland business owner referred by an agency. Write for the primary reader first. Let the secondary reader find themselves in the framing.

### Specificity over generality

Specific numbers, named tools, named boundary cases. Vague claims read as filler. Specific claims read as earned. "Maryland Insights is the foundation Maryland businesses and the agencies serving them run on" is specific. "Maryland Insights is a powerful platform for growth" is filler.

### Benefits over features

Each capability earns its place by naming what the reader gets. The platform does X so the reader can do Y. Never stop at X.

### Voice-of-customer language

The full interview transcript in Hydra DB (`about-us` collection, source `about-us.md`) is the voice-of-customer source for this project. Use the founder's own phrasings when they earn their place. Do not paraphrase into corporate synonyms.

### Clarity over cleverness

Every sentence moves the reader toward "yes." If a sentence does not, cut it. Clever metaphors, wordplay, and abstract framing cost conversion without adding meaning.

### Strategic proof

Layer proof throughout the page. The transcript supplies specific proof points ("nine times out of ten, a local Maryland agency will do better for you than a national"). Use them. When proof is not in source, do not invent. Note where proof is missing and either omit the claim or stop and ask.

### Match copy to funnel stage

Awareness-stage copy explains what Maryland Insights is and why it exists. Decision-stage copy is for the reader who has already decided and needs the next step. About and Services are mostly awareness. The "Partner with Us" button on the story section and the get-started CTA are the decision-stage moments.

### Compelling, varied CTAs

A single CTA on the page is enough if it is clear. The reader should know what to do next without searching for the action. Do not bury the CTA in a footer. Repeat it at the natural decision moment, not five times throughout.

### Scannable structure

Write for scanners. Subheads carry weight. One idea per paragraph. Short paragraphs beat long ones. Bullets where the items are parallel. The reader should be able to extract the substance from a fast skim.

## Positive examples

### About-us right version

- **Source:** `examples/about-us-right-version.md`
- **What it demonstrates:** The three-beat negative identity, the foundation-layer framing, the augmentation closing.
- **What not to imitate mechanically:** The specific paragraph breaks. The rhythm matters. The exact line breaks are not sacred.

### Hosting explainer

- **Source:** `examples/hosting-explainer.md`
- **What it demonstrates:** The run-on feature list, the augmentation restatement, the founder's stacked-declarative rhythm, honest boundary-drawing.
- **What not to imitate mechanically:** The specific tool names (Vercel, Cloudflare, Astro). Those are stack choices. The discipline is showing the engineering layer, not naming any specific vendor.

## Negative examples

### About-us polished-marketing version

- **Source:** `examples/about-us-polished-marketing.md`
- **What fails:** Generic polished-marketing About-page cadence. No signature phrases. No three-beat negative. No augmentation restatement. Could appear on any platform's site.
- **Why it conflicts with this writing:** Loses the founder's voice entirely. Reads as a model default, not as the Maryland Insights founder.
- **Preferred direction:** Rewrite in stacked declaratives, preserve the verbatim signature phrases, and earn the boundary-drawing.

## Publication readiness

A piece is ready when:

- It draws the line clearly (what Maryland Insights is, what it is not).
- It uses verbatim signature phrases where they earn their weight.
- It preserves the founder's voice through verbatim phrases and selected signature moves, in professional copy register. Not transcript-style cadence.
- The engineering layer is added with explicit flagging of what was added versus what was in source.
- No em-dashes (the long dash character) appear anywhere in the piece.
- It serves one page goal with one clear CTA.
- It is scannable. Subheads carry weight. One idea per paragraph.
- The boundary drawn is clear enough that a reader cannot mistake Maryland Insights for a SaaS, website builder, or ad manager.
- Open questions are surfaced to the user before shipping.
- The piece reads like the founder wrote it on a good day, not like someone transcribing an interview.

### Pre-publication checklist

- [ ] Does the piece fulfill the reader promise (what it is, what it is not, why now, what next)?
- [ ] Is the boundary drawn clearly enough that a reader cannot mistake Maryland Insights for a SaaS, website builder, or ad manager?
- [ ] Does each section advance or complicate the piece? Can any be cut?
- [ ] Are signature phrases used verbatim where they earn their weight?
- [ ] Have any added-from-domain-expertise claims been flagged for confirmation?
- [ ] Does the structure serve this particular material?
- [ ] Does the ending extend rather than merely recap?
- [ ] Is the page scannable? Subheads carry weight? One idea per paragraph?
- [ ] Is the CTA clear, single, and unmissable?
- [ ] Has the draft been checked against `VOICE.md`?
- [ ] Has the draft been scanned for em-dashes?
- [ ] Has the founder's signature cadence been used sparingly, not in every section? (See `VOICE.md` "Form vs. register.")
- [ ] Has any specific competitor, vendor, or stat been invented rather than sourced?

## Confirmed lessons

- 2026-09-28: Em-dashes banned across the project, in copy and in examples. See `feedback_no_em_dashes.md` memory.
- 2026-09-28: Three-source-layer discipline established. Transcript (verbatim or tight paraphrase), domain expertise (flag when added), inferred (stop and ask).
- 2026-09-28: Founder's three-beat negative identity pattern is the signature move for opening boundaries. Do not smooth it into prose.
- 2026-09-28: Founder voice lives in verbatim phrases and selected signature moves. Transcript-style cadence is the wrong register for website copy. Use it sparingly, never in every section. See `VOICE.md` "Form vs. register."
- 2026-09-28: SME copywriting discipline for website copy that converts: lead with value prop, one page one goal, specificity over generality, benefits over features, voice-of-customer language, clarity over cleverness, scannable structure. See "Copywriting principles for website copy that converts" below.
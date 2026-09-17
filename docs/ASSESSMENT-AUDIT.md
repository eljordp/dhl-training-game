# Written assessment audit — 2026-09-17

## Findings and changes

1. Old grader accepted a bullet when 40% of its extracted words appeared anywhere. Substring matches, weak stemming, and synonyms merging `compliant/non-compliant` and `match/mismatch` produced false passes and false negatives. Replaced with explicit question-specific concept relationships and contradiction checks. No paid model, API key, model download, or network grading call.
2. The original 37-answer browser run scored 79%. Its answers are preserved verbatim in `tests/fixtures/employee-run.ts`. Under corrected questions/rubrics, 36 answers have all core ideas recognized and one is flagged; aggregate recognized-idea score is 97%. This is a regression replay, not a new blind employee test or a certification result.
3. ECX was incorrectly taught as Economy Select. DHL's own product documentation describes intra-EU Express Worldwide. The original run repeated the wrong key and now correctly requires review. Removed unsupported generic EXP definition and ask for verification of lane/product availability.
4. Examples were scored as mandatory facts: China-made laptop, particular gift thresholds, large/light box wording. Examples are now context, while scoring uses required principles.
5. Saudi question asked for three things but scored four and omitted the required National/Short Address. Rewritten around current address, contact and customs checks.
6. Quantity/value question assumed $100 was each without stating it. Requires clarification of unit versus total and quantity correction.
7. Removed blanket claims about signature release, automatic customs outcomes, DTP guaranteeing fastest clearance, all shipments needing identical customs paperwork, all supplied invoices needing CRA recreation, and "top five" DHL failure rankings without data. Broader carrier rules and local CRA procedures are distinct.
8. Canadian gift note incorrectly implied full-value taxation above CAD $60. Replaced with qualified excess-value treatment and source.
9. Results formerly regraded/saved during render; timer included tier-selection and previous-attempt time; acknowledgment state survived restart. Finalization is now an event, time freezes on completion, attempts reset, and duplicate/stale-save guards are present.
10. Manager views substituted questions-passed percentage for the awarded partial-credit score. Views now use stored `score`, surface review flags, and new written attempts save exact question/rubric snapshots. New written scores are recomputed server-side before database storage.
11. Guest saves and database errors previously returned indistinguishable success. API now distinguishes saved, guest/unconfigured, and failure. Guest users see that results are not sent to a manager and can download an answer-by-answer text report.

## Evidence and limits

- 208 automated tests: all 37 original answers, every rubric, blank/nonsense/keyword lists, alternative examples and paraphrases, wrong and contradictory answers, aggregate scoring, report consistency and server input validation.
- TypeScript and production build pass. Changed quiz/grading files pass ESLint. Existing unrelated lint errors remain in game/results/consent components; no clean full-repository lint claim.
- Local browser replay: all 37 questions completed, 97%, 36/37 fully recognized, one review (ECX); repeat seven-question attempt reset correctly, 86% with a deliberately false declaration under review. No browser console errors in that check.
- Local report download verified on disk (37 answers); phone-sized result page inspected at 390×844.
- Deterministic pattern recognition is not unrestricted language understanding. Unknown expressions, typos, complex negations, multilingual answers or contradictions outside tested patterns can still need review. The UI labels recognized ideas and review needs, rather than claiming an employee has failed or is certified. Do not use it as a sole employment decision tool.
- Manager persistence requires a signed-in account and configured database; a guest trial does not notify JP automatically. No new employee account or private database record was created for the browser QA.
- The separate 12-scenario CRA simulator was not fully audited here. Its mobile form overflow and lane-specific service assumptions remain separate work.

## Primary references checked

- [DHL Express Commerce product definitions](https://support.dhlexpresscommerce.com/hc/en-gb/articles/900003468466-Setup-DHL-Express): ECX/WPX scope.
- [DHL Terms of Carriage](https://mydhlplus.dhl.com/content/dam/downloads/global/en/t-c/terms_conditions_of_carriage_en-2024.pdf.coredownload.pdf): delivery, return charges, actual/volumetric weight, liability versus insurance, truthful shipment data and contact information.
- [DHL Saudi update](https://www.dhl.com/discover/zh-tw/ship-with-dhl/export-with-dhl/saudi-arabia-regulatory) and [Saudi Central Bank published circular](https://rulebook.sama.gov.sa/en/providing-postal-service-providers-national-address): National Address requirement effective January 1, 2026.
- [DHL Brazil service description](https://mydhl.express.dhl/br/pt/shipment/service-type.html): CPF/CNPJ and import documentation.
- [DHL customs invoice guide](https://www.dhl.com/discover/en-my/ship-with-dhl/services/dhl-shipping-tools/create-dhl-commercial-invoice): customer invoices can be uploaded in supported workflows. This does not independently establish a particular location's CRA SOP.
- [CBSA gifts guidance](https://www.cbsa-asfc.gc.ca/import/courier/menu-eng.html): qualifying Canadian gifts and excess over CAD $60, including exclusions.

Local operator procedures, current lane availability and destination-specific requirements still need confirmation by the DHL operator reviewing the training.

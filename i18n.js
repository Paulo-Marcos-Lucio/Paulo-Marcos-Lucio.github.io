(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
     Toggle de idioma PT-BR / EN-US, 100% client-side.

     Como funciona: o HTML já contém o texto em português (idioma "de
     fábrica" da página). Na primeira chamada de applyLang(), cada elemento
     alvo tem seu conteúdo ORIGINAL capturado numa propriedade JS própria
     (ex.: el._pt) antes de qualquer troca — não existe um dicionário PT
     escrito à mão aqui, só o dicionário EN. Isso evita divergência entre
     o HTML e uma cópia PT duplicada no JS: a fonte da verdade do português
     é sempre o próprio markup.

     Convenção de atributos:
       data-i18n="chave"        → troca el.textContent (texto puro)
       data-i18n-html="chave"   → troca el.innerHTML (texto com <strong>/<a>/<code> etc.)
       data-i18n-attrs="attr:chave|attr2:chave2" → troca atributos (aria-label, title...)
       data-i18n-href="chave"   → troca href (usado nos links de WhatsApp com
                                   texto pré-preenchido, para não abrir o
                                   WhatsApp em português para quem está lendo
                                   a página em inglês)
     ───────────────────────────────────────────────────────────────────────── */

  var EN = {
    'skip': 'Skip to content',

    'nav.servicos': 'Services',
    'nav.ferramentas': 'Tools',
    'nav.pro': 'Pro Edition',
    'nav.pacotes': 'Packages',
    'nav.contato': 'Contact',

    'hero.eyebrow': 'Self-scan of my own site: started at C·70, now at B·89 — the climb published, no touch-ups',
    'hero.ctaWhatsapp': 'Message me on WhatsApp',
    'hero.ctaGhost': 'See my tools',
    'hero.stat1Label': 'self-scan of my site: found it, fixed it, retested it',
    'hero.stat2Label': 'secrets found in the corpus · 0 false positives',
    'hero.stat3Num': '5 tools',
    'hero.stat3Label': 'open source, tested, green CI',
    'hero.tagNetworking': 'Networking',
    'hero.badgeWarn': 'hosting limit',
    'hero.scanTls': '🔒 TLS / Certificate',

    'provoke.eyebrow': 'Three questions',
    'provoke.title': 'Answer honestly — to yourself',
    'provoke.lead': 'If you hesitated on any of them, the diagnosis answers all three. With evidence, not guesswork.',
    'provoke.cta': 'See the answer in a real report',

    'services.eyebrow': 'Services',
    'services.title': 'What I do for your application',
    'svc1.title': 'Web vulnerability diagnosis',
    'svc1.desc': 'Analysis of the exposed surface: headers, TLS/certificate, cookies, CORS, HTTP methods, file exposure, and DNS/email security. Report with severity, evidence, and fix recommendations.',
    'svc1.tag3': 'executive report',
    'svc1.laudoLink': 'See a real report',
    'svc2.title': 'Fix and hardening',
    'svc2.desc': 'From recommendation to execution: I implement (or guide your team through) CSP, HSTS, modern TLS, secure cookies, restrictive CORS, and removal of exposed sensitive routes and files.',
    'svc3.title': 'Retest and follow-up',
    'svc3.desc': 'After the fix, a new scan proves the risk reduction. Scheduled scanning becomes continuous evidence of vulnerability management — exactly what LGPD expects.',
    'svc3.tag1': 'retest included',
    'svc3.tag2': 'recurring',
    'svc4.title': 'LGPD compliance (art. 46)',
    'svc4.desc': "Diagnosis and dated documentation that help your company demonstrate the technical security measures LGPD requires — a factor Brazil's data-protection authority (ANPD) weighs when calculating sanctions.",
    'svc4.tag1': 'dated evidence',
    'svc4.tag2': 'technical measures',

    'metodo.eyebrow': 'Method',
    'metodo.title': 'How an engagement works',
    'step1.title': 'Diagnosis', 'step1.desc': 'Non-intrusive scan of the exposed surface and evidence collection.',
    'step2.title': 'Prioritization', 'step2.desc': 'Findings ranked by severity (CVSS) and business risk.',
    'step3.title': 'Remediation', 'step3.desc': 'Applying fixes or supporting your team, item by item.',
    'step4.title': 'Retest', 'step4.desc': 'A new scan proves the risk actually went down.',
    'step5.title': 'Recurrence', 'step5.desc': 'Scheduled monitoring as continuous evidence.',

    'tools.eyebrow': 'Tools · Open source',
    'tools.title': 'The suite I use — and leave open for you to audit',
    'tools.stat1Label': 'rules and recall on the Esteira corpus · 0 false positives',
    'tools.stat2Label': 'JWT vectors on the Chaveiro corpus · 0 false positives',
    'tools.stat3Num': '7.1s → <0.01s',
    'tools.stat3Label': 'CI lockup from ReDoS, measured and fixed',

    'suite1.frente': 'Perimeter',
    'suite2.frente': 'Secrets',
    'suite3.frente': 'Authentication',
    'suite4.frente': 'Supply chain',
    'suite5.frente': 'Remediation',
    'suite6.frente': 'Surveillance',
    'suiteAll.title': 'All repositories',
    'suiteAll.desc': 'Includes my reference suite for regulated financial systems (Pix, Open Finance, mTLS on ICP-Brasil) — the engineering rigor behind the AppSec lens.',
    'suiteAll.link': 'View on GitHub',

    'project1.badge': 'Real proof · Sentinela',
    'project1.title': 'I started with my own site — found it, fixed it, retested it',
    'project1.feat2': 'Headers, TLS, cookies, CORS, HTTP methods, DNS/email — mapped to the OWASP Top 10:2025 + CWE',
    'project1.feat4': "Report in HTML, Markdown, JSON, and SARIF 2.1.0 (ingestible by GitHub's Security tab)",
    'project1.feat5': "Reproducible in two commands — not a mockup, it's my own target",
    'project1.cta': 'View on GitHub ↗',

    'terminal1.title': 'sentinela — retest',
    'terminal1.hygieneLabel': 'Hygiene score:',
    'terminal1.eraLabel': '(was C · 70)',
    'terminal1.sectionHeaders': 'Security Headers',
    'terminal1.clickjacking': 'Clickjacking — GitHub Pages limitation',
    'terminal1.sectionTls': 'TLS / Certificate',
    'terminal1.tlsOk': 'TLS 1.3 · valid certificate',
    'terminal1.sectionDns': 'DNS / Email',
    'terminal1.hostingInfo': 'Managed hosting — not penalized',
    'terminal1.savedTo': '→ report saved to relatorio.html',

    'pro.eyebrow': 'Pro Edition',
    'proProject.badge': 'Sentinela · Pro edition',
    'proProject.title': 'What you see / what I see',
    'proProject.cta': 'I want active confirmation (Pro)',

    'terminal2.title': 'sentinela — Pro edition',
    'terminal2.comment': '── my own target, vulnerable on purpose ──',
    'terminal2.surfaceLabel': 'surface mapped:',
    'terminal2.surfaceValue': 'entire application',
    'terminal2.a05': 'A05 · Injection (confirmed)',
    'terminal2.crit': 'CRITICAL',
    'terminal2.sqliNote': '(boolean+time)',
    'terminal2.high': 'HIGH',
    'terminal2.footer1': '1.00 / 1.00 in a controlled lab · 0 false positives',
    'terminal2.footer2': '→ read-only · authorized · inert marker',

    'suiteSub.title': 'The entire suite has a Pro edition',
    'proSuite1.frente': 'Secrets',
    'proSuite1.link': 'Pro = scope + service',
    'proSuite2.frente': 'Authentication',
    'proSuite2.link': 'Pro = scope + service',
    'proSuite3.frente': 'Supply chain',
    'proSuite3.link': 'Pro = scope + service',
    'proSuite4.title': 'OWASP Lab · Pro',
    'proSuite4.frente': 'Remediation',
    'proSuite4.link': 'Pro = service',

    'pro.stat1Num': 'Nothing leaves the public side',
    'pro.stat1Label': "what's open stays open, forever",
    'pro.stat2Num': "Confirms, doesn't exploit",
    'pro.stat2Label': 'safe payload, inert marker, read-only',
    'pro.stat3Num': 'Red line in code',
    'pro.stat3Label': "written authorization only — it's a flag, not a promise",

    'cred.eyebrow': 'Authority',
    'cred.title': "I wrote the code your team is going to have to change",
    'cred1.title': 'Secure development in practice',
    'cred1.desc': "Java/Spring developer. I wrote reference implementations for Brazil's regulated financial systems — Pix, Open Finance, DICT, Open Insurance — with authentication, mTLS on ICP-Brasil, and FAPI. Public code, tested.",
    'cred2.title': 'My own open tooling',
    'cred2.desc': 'I build my own analysis tools — public, tested code that documents my technical judgment.',
    'cred3.title': 'Networking and Linux',
    'cred3.desc': 'A solid foundation in networking, servers, and Linux — the terrain where web applications actually run and get exposed.',
    'credNote.cta': 'See my engineering repositories ↗',

    'pacotes.eyebrow': 'Packages',
    'pacotes.title': 'Choose where to start',
    'work1.tier': 'Starting point',
    'work1.title': 'Diagnosis',
    'work1.list1': 'Full scan of the exposed surface',
    'work1.list2': 'Executive report (for leadership)',
    'work1.list3': 'Technical report with severity and evidence',
    'work1.list4': 'Prioritized fix recommendations',
    'work1.list5': 'Results walkthrough meeting',
    'work1.price': 'Fixed price in the proposal · results meeting included',
    'work1.cta': 'I want to start with the diagnosis',

    'work2.tier': 'Recommended',
    'work2.title': 'Diagnosis + Fix',
    'work2.list1': 'Everything in Diagnosis',
    'work2.list2': 'Fix/hardening of prioritized findings',
    'work2.list3': 'Retest proving the risk reduction',
    'work2.list4': 'Dated attestation letter with scope (LGPD)',
    'work2.price': 'Fixed price in the proposal · retest and attestation included',
    'work2.cta': 'I want the recommended package',

    'work3.tier': 'Ongoing',
    'work3.title': 'Follow-up',
    'work3.list1': 'Scheduled scanning (monthly/per release)',
    'work3.list2': 'Risk-evolution report',
    'work3.list3': 'Direct channel for security questions',
    'work3.list4': 'Continuous evidence for compliance',
    'work3.price': 'Fixed monthly fee in the proposal · no lock-in',
    'work3.cta': 'I want ongoing follow-up',

    'pacotes.foot': "Security is measurable risk reduction — proven with a dated retest, not a PDF full of promises.",

    'contato.title': 'Has your web system ever been reviewed by a technical peer?',
    'contato.lead': "Tell me in one line what the application is and the context — you'll already know the next step. Still measuring? Run Sentinela against your domain; if the grade comes back below B, send me the report and the conversation starts from your finding, not my pitch.",
    'contato.ctaWhatsapp': 'Message me on WhatsApp',

    'footer.tag': 'Web Application Security · AppSec · Brazil',
    'waFab.label': 'Message me',
  };

  var EN_HTML = {
    'terminal1.cspOk': 'CSP present (via &lt;meta&gt;)',
    'hero.title': 'I wrote the reference implementations of Pix and Open Finance.<br />\n            <span class="gradient-text">Now I find what’s exposed in your system.</span>',
    'hero.subtitle': 'Headers, TLS, cookies, CORS, DNS, forms, and injection (SQLi/XSS): I map the surface an attacker sees and hand you back a fix plan that fits inside your team’s sprint — <strong>because I’ve been the dev team</strong>. Open source, tested: <a href="#ferramentas">see the suite I use</a>.',

    'provoke.card1': 'If I open your site <strong>right now</strong>, how many security headers will I find <strong>missing</strong>?',
    'provoke.card2': 'Is there a <code>.env</code>, <code>.git</code>, or backup file <strong>exposed</strong> at the root of your domain? Are you <strong>sure</strong>?',
    'provoke.card3': 'When was the last time someone <strong>proved</strong> — with a date and evidence — that your application is protected?',

    'services.lead': 'I focus on the layer where most low-cost, high-impact problems live: <strong>security configuration and hygiene</strong> for internet-facing web systems.',
    'metodo.lead': 'Clear scope, auditable delivery. From the first diagnosis to recurring follow-up — security is <strong>continuous risk reduction</strong>, measured and proven with every retest.',

    'tools.lead1': 'You’re not hiring a black box. Every engagement is backed by <strong>my own tested, open tooling</strong> — five fronts of the OWASP Top 10, from perimeter to authentication, from leaked secrets to the supply chain. No single scanner wins across the board: I run my suite alongside gitleaks, trufflehog, and zizmor — and what you’re hiring is the <strong>triage and the report</strong>, not the scanner.',
    'tools.lead2': 'Don’t take my word for it: I published the <a href="https://github.com/Paulo-Marcos-Lucio/guardiao/blob/main/BENCHMARK.md" target="_blank" rel="noopener"><strong>honest benchmark</strong></a> against those three incumbents — pinned versions and commits, reproducible, and it <strong>says where they’re leaner than me</strong>. Anyone who only shows you where they win is hiding something.',

    'suite1.desc': 'Non-intrusive web configuration diagnostic — headers, TLS, cookies, CORS, DNS <strong>plus injection surface</strong> (forms, CSRF, parameter reflection) — mapped to the OWASP Top 10:2025. The <strong>Pro</strong> edition adds code: it <strong>confirms</strong> SQLi/XSS with safe proof, authorization-only.',
    'suite2.desc': 'Leaked-secrets scanner for your code <strong>and Git history</strong> — normalized entropy, baseline, SARIF, and a pre-commit hook. Recall <strong>13/14</strong> on the corpus, 0 false positives.',
    'suite3.desc': 'JWT/JWS token auditor — <code>alg:none</code>, algorithm confusion, HMAC secret brute-forcing, <code>jku</code>/<code>kid</code> SSRF + a validation reference.',
    'suite4.desc': 'CI/CD (GitHub Actions) security auditor — script injection, actions not pinned by SHA, <code>pull_request_target</code>, permissions.',
    'suite5.desc': '<strong>8 vulnerabilities across 3 categories</strong> of the OWASP Top 10:2025 (A01, A04, and A05) — spotlighting <strong>injection (A05: SQLi, XSS, command)</strong> — each one paired <strong>vulnerable → exploit → fixed</strong>, with an automated test proving the fixed side <strong>actually fixes it</strong>. Built in Spring Boot.',
    'suite6.desc': 'Passive, continuous reading of headers, TLS, DNS, and Certificate Transparency across a handful of my own and reference targets, <strong>kept as a time series</strong> — because a report taken on a single day only says how the target looked that day; drift only shows up by measuring every day and comparing. Runs on its own in GitHub Actions, public.',

    'project1.desc': 'I ran my own tool against <strong>my own domain</strong>, non-intrusively. It came back <strong>C · 70/100</strong> and listed what was wrong. I fixed what the platform allows (CSP via <code>&lt;meta&gt;</code>) and the retest climbed to <strong>B · 89/100</strong> — published as-is, no touch-ups. <strong>Why not an A?</strong> The remaining gaps (X-Frame-Options, X-Content-Type-Options, HSTS with subdomains) are <strong>headers that GitHub Pages doesn’t let any site set</strong> — a hosting limit, not a site flaw, and the tool itself tells me so with the exact line and output (custom domain + CDN). <strong>A scanner gives you a number; a diagnosis tells you why that’s the number and what to do about it.</strong>',
    'project1.feat1': '<strong>Found it → fixed it → retested it:</strong> the C·70 → B·89 climb is the retest I sell, done on my own target',
    'project1.feat3': 'Recognizes managed hosting and <strong>doesn’t penalize you for DNS you don’t control</strong> (github.io’s missing DMARC was reported honestly)',
    'project1.feat6': "<strong>Why I don’t close this with HTML:</strong> this site runs on static hosting with no response-header control (GitHub Pages) — that’s why CSP ships via <code>&lt;meta&gt;</code>, and the browser drops the <code>frame-ancestors</code> directive in that form. Decision on record: staying here for now; the <code>_headers</code> file already in the repo solves this the day I move to a host that reads it",

    'pro.title': 'What’s <span class="gradient-text">open stays open</span>. Pro only adds.',
    'pro.lead': 'Nothing leaves the public side — what’s free today is yours, free, forever. Pro never takes away: it <strong>adds</strong>, and always says why. In <strong>Sentinela</strong>, it adds code — the active engine that <strong>confirms</strong> the flaw (it sends requests against the target; that’s why it only runs with written authorization, not as a binary anyone can download). In the other tools the engine is identical to the one you download: what Pro adds is the <strong>service</strong> — triage, fix, and dated report. Detection is free; <strong>fixing is work, and work is what I sell</strong>.',
    'proProject.desc': 'Same target, same day. The public diagnostic says <em>“this is an injection surface.”</em> Pro takes the missing step and says <em>“this <strong>confirms</strong> it”</em> — with a safe payload and an inert marker, <strong>without exploiting</strong>, without extracting a single piece of data, without persisting anything. The distance between <em>maybe</em> and <em>confirmed</em> is the distance between sleeping and not sleeping.',
    'proProject.feat1': "Confirms <strong>SQLi, XSS</strong>, and five more injection classes — it doesn't infer, it proves",
    'proProject.feat2': 'Maps the <strong>entire application</strong>, page by page — not just the URL you typed',
    'proProject.feat3': 'Confirms <strong>live</strong> whether an API endpoint actually requires authentication',
    'proProject.feat4': 'Read-only, only under <strong>written authorization</strong> — the red line is code, not a promise',

    'suiteSub.desc': 'Sentinela is the only case where Pro means <strong>extra code</strong> (the active engine above). In the other four, the engine is <strong>identical to what you download</strong> — Pro adds <strong>scope and service</strong>: the whole organization instead of one target, the triage that separates real findings from noise, the fix I carry out, and the retest that proves it. Same honesty: nothing leaves the public side, and every addition says why it exists.',
    'proSuite1.desc': '<strong>You run:</strong> the secrets search on the repository you point at. <strong>Pro adds:</strong> the <strong>entire organization</strong> and <strong>full Git history</strong> (not just HEAD), the triage that adjudicates each finding as real or false positive, and the <strong>per-provider rotation plan with a retest</strong> proving the credential is out of circulation — plus the LGPD evidence report.',
    'proSuite2.desc': '<strong>You run:</strong> the audit of a single JWT token, 100% offline. <strong>Pro adds:</strong> an audit of your <strong>entire system’s issuer and verifier</strong>, analysis of the JWKS you hand me, <strong>FAPI / Open Finance Brasil compliance</strong> framing, and a dated report — from someone who’s written issuers and verifiers in regulated finance.',
    'proSuite3.desc': '<strong>You run:</strong> the audit of your GitHub Actions workflows. <strong>Pro adds:</strong> scanning the <strong>entire organization</strong> in one pass, <strong>verified remediation</strong> (I fix the workflow and the retest proves the hole closed), an OIDC trust-policy audit, and the executive report your regulator files away.',
    'proSuite4.desc': '<strong>You run:</strong> the open lab — 8 vulnerabilities, vulnerable→fixed, with tests. <strong>Pro adds:</strong> a <strong>live workshop</strong> with your team, mapping each lab flaw to the <strong>client’s real code</strong>, and a method transfer — the team understands the <em>why</em> behind each fix, not just the patch.',

    'cred.lead': 'I come from <strong>building systems where a security mistake isn’t an option</strong> — the reference implementations of Pix, Open Finance, and DICT. I bring that same bar to your diagnosis, and the fixes I recommend fit inside your team’s sprint.',
    'credNote.p1': 'Want to check the engineering rigor yourself? My <strong>public suite of reference implementations</strong> for the regulated financial market (Spring Boot, hexagonal architecture, observability, CI) is all on GitHub.',

    'pacotes.lead': 'Always a <strong>fixed-scope package</strong>, defined scope, and <strong>retest included</strong>. No mandatory retainer and no sales call just to learn the price: you get a fixed-price proposal in the very first conversation. If it doesn’t fit your moment, I’ll tell you right away.',
    'work1.desc': 'The prioritized map of what’s exposed on your surface — with evidence. It’s the step that swaps “I think we’re secure” for <strong>dated evidence</strong>.',
    'work2.desc': 'From the problem to <strong>proof that it’s solved</strong>: I find it, I fix it — and prove it with a retest. You walk away with the evidence in hand.',
    'work3.desc': 'Security that <strong>doesn’t expire in a PDF</strong>: a new scan with every release — and evidence always ready for audit.',

    'footer.meta': '© <span id="year">2026</span> Paulo Marcos Lucio · São Paulo, Brazil · Diagnosis conducted under authorization and defined scope',
  };

  var EN_ATTRS = {
    'hero.statsAriaLabel': 'Measured, reproducible proof',
    'hero.cardAriaLabel': 'Diagnostic sample',
    'hero.ctaWhatsappAria': 'Message me on WhatsApp',
    'tools.statsAriaLabel': 'Numbers measured on a public corpus, reproducible in two commands',
    'proProject.ctaAria': 'Message me on WhatsApp about the Pro edition',
    'pro.statsAriaLabel': 'The boundary of the Pro edition',
    'work1.ctaAria': 'I want to start with the diagnosis — message on WhatsApp',
    'work2.ctaAria': 'I want the recommended package: Diagnosis + Fix — message on WhatsApp',
    'work3.ctaAria': 'I want ongoing follow-up — message on WhatsApp',
    'waFab.ariaLabel': 'Message me on WhatsApp',
  };

  var EN_HREF = {
    'hero.wa': 'https://wa.me/5512991478991?text=Hi%20Paulo%2C%20I%20found%20you%20through%20your%20site%20and%20I%27d%20like%20a%20security%20diagnostic%20for%20my%20application.',
    'pro.wa': 'https://wa.me/5512991478991?text=Hi%20Paulo%2C%20I%20found%20you%20through%20your%20site%20and%20I%27d%20like%20the%20deep-dive%20%28Pro%20edition%29%20for%20my%20application.',
    'work1.wa': 'https://wa.me/5512991478991?text=Hi%20Paulo%2C%20I%27d%20like%20the%20Diagnosis%20package.',
    'work2.wa': 'https://wa.me/5512991478991?text=Hi%20Paulo%2C%20I%27d%20like%20the%20Diagnosis%20%2B%20Fix%20package%20%28the%20recommended%20one%29.',
    'work3.wa': 'https://wa.me/5512991478991?text=Hi%20Paulo%2C%20I%27d%20like%20the%20recurring%20Follow-up%20package.',
    'contato.wa': 'https://wa.me/5512991478991?text=Hi%20Paulo%2C%20I%20found%20you%20through%20your%20site%20and%20I%27d%20like%20to%20talk%20about%20a%20security%20diagnostic.',
  };

  var META = {
    pt: {
      title: 'Paulo Marcos Lucio · Segurança de Aplicações Web (AppSec) · BR',
      description: 'Consultoria em segurança de aplicações web no Brasil: diagnóstico e correção de vulnerabilidades, hardening, análise de cabeçalhos, TLS, CORS e exposição — mapeado ao OWASP Top 10 e à LGPD. Suíte de ferramentas open source. Para PMEs e fintechs.',
      keywords: 'segurança de aplicações web, AppSec, diagnóstico de vulnerabilidades, pentest web, hardening, OWASP Top 10, LGPD, cabeçalhos de segurança, TLS, consultoria cybersecurity Brasil',
      ogTitle: 'Paulo Marcos Lucio · Segurança de Aplicações Web (AppSec)',
      ogDescription: 'Diagnóstico e correção de vulnerabilidades em sistemas web para PMEs e fintechs. OWASP Top 10 · TLS · LGPD art. 46. Suíte de ferramentas open source.',
      ogImageAlt: 'Paulo Marcos Lucio — Segurança de Aplicações Web (AppSec): diagnóstico, correção, OWASP Top 10 e LGPD',
      ogLocale: 'pt_BR',
      twitterTitle: 'Paulo Marcos Lucio · Segurança de Aplicações Web',
      twitterDescription: 'Diagnóstico e correção de vulnerabilidades em sistemas web. OWASP Top 10 · TLS · LGPD.',
      jobTitle: 'Consultor em Segurança de Aplicações Web (AppSec)',
      knowsAbout: ['Segurança de Aplicações Web', 'OWASP Top 10', 'Diagnóstico de Vulnerabilidades', 'TLS', 'Cabeçalhos de Segurança HTTP', 'LGPD', 'Hardening de Servidores', 'Linux'],
      htmlLang: 'pt-BR',
    },
    en: {
      title: 'Paulo Marcos Lucio · Web Application Security (AppSec) · Brazil',
      description: "Web application security consulting in Brazil: vulnerability diagnosis and remediation, hardening, header analysis, TLS, CORS, and exposure — mapped to the OWASP Top 10 and Brazil's LGPD. Open-source tool suite. For SMBs and fintechs.",
      keywords: 'web application security, AppSec, vulnerability diagnosis, web pentest, hardening, OWASP Top 10, LGPD, security headers, TLS, cybersecurity consulting Brazil',
      ogTitle: 'Paulo Marcos Lucio · Web Application Security (AppSec)',
      ogDescription: 'Vulnerability diagnosis and remediation for web systems, for SMBs and fintechs. OWASP Top 10 · TLS · LGPD art. 46. Open-source tool suite.',
      ogImageAlt: 'Paulo Marcos Lucio — Web Application Security (AppSec): diagnosis, remediation, OWASP Top 10, and LGPD',
      ogLocale: 'en_US',
      twitterTitle: 'Paulo Marcos Lucio · Web Application Security',
      twitterDescription: 'Vulnerability diagnosis and remediation for web systems. OWASP Top 10 · TLS · LGPD.',
      jobTitle: 'Web Application Security (AppSec) Consultant',
      knowsAbout: ['Web Application Security', 'OWASP Top 10', 'Vulnerability Diagnosis', 'TLS', 'HTTP Security Headers', 'LGPD', 'Server Hardening', 'Linux'],
      htmlLang: 'en',
    }
  };

  function setMetaContent(selector, content) {
    var el = document.querySelector(selector);
    if (el && content != null) el.setAttribute('content', content);
  }

  function applyMeta(lang) {
    var m = META[lang] || META.pt;
    document.title = m.title;
    setMetaContent('meta[name="description"]', m.description);
    setMetaContent('meta[name="keywords"]', m.keywords);
    setMetaContent('meta[property="og:title"]', m.ogTitle);
    setMetaContent('meta[property="og:description"]', m.ogDescription);
    setMetaContent('meta[property="og:image:alt"]', m.ogImageAlt);
    setMetaContent('meta[property="og:locale"]', m.ogLocale);
    setMetaContent('meta[name="twitter:title"]', m.twitterTitle);
    setMetaContent('meta[name="twitter:description"]', m.twitterDescription);
    document.documentElement.setAttribute('lang', m.htmlLang);

    var ld = document.querySelector('script[type="application/ld+json"]');
    if (ld) {
      if (ld._pt === undefined) ld._pt = ld.textContent;
      try {
        var data = JSON.parse(ld._pt);
        data.jobTitle = m.jobTitle;
        data.knowsAbout = m.knowsAbout;
        ld.textContent = JSON.stringify(data, null, 2);
      } catch (e) { /* JSON-LD malformado: não quebra a troca de idioma por causa disso */ }
    }
  }

  function applyLang(lang) {
    var isEn = lang === 'en';

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (el._pt === undefined) el._pt = el.textContent;
      var key = el.getAttribute('data-i18n');
      el.textContent = isEn && EN[key] != null ? EN[key] : el._pt;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      if (el._pt === undefined) el._pt = el.innerHTML;
      var key = el.getAttribute('data-i18n-html');
      el.innerHTML = isEn && EN_HTML[key] != null ? EN_HTML[key] : el._pt;
    });

    document.querySelectorAll('[data-i18n-attrs]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attrs');
      spec.split('|').forEach(function (pair) {
        var idx = pair.indexOf(':');
        if (idx < 0) return;
        var attr = pair.slice(0, idx);
        var key = pair.slice(idx + 1);
        var storeKey = '_pt_' + attr;
        if (el[storeKey] === undefined) el[storeKey] = el.getAttribute(attr);
        var val = isEn ? EN_ATTRS[key] : undefined;
        el.setAttribute(attr, val != null ? val : el[storeKey]);
      });
    });

    document.querySelectorAll('[data-i18n-href]').forEach(function (el) {
      if (el._ptHref === undefined) el._ptHref = el.getAttribute('href');
      var key = el.getAttribute('data-i18n-href');
      var val = isEn ? EN_HREF[key] : undefined;
      el.setAttribute('href', val != null ? val : el._ptHref);
    });

    applyMeta(isEn ? 'en' : 'pt');

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      var active = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    // Botão flutuante: sempre convida a trocar, então mostra a bandeira/texto
    // do idioma OPOSTO ao que está ativo agora (não do idioma atual).
    var fab = document.querySelector('[data-lang-fab]');
    if (fab) {
      var flagEl = fab.querySelector('[data-lang-fab-flag]');
      var textEl = fab.querySelector('[data-lang-fab-text]');
      if (isEn) {
        if (flagEl) flagEl.textContent = '🇧🇷';
        if (textEl) textEl.innerHTML = 'Ler em<br/>Português';
        fab.setAttribute('aria-label', 'Ler esta página em Português');
        fab.setAttribute('data-lang-fab-target', 'pt');
      } else {
        if (flagEl) flagEl.textContent = '🇺🇸';
        if (textEl) textEl.innerHTML = 'Read in<br/>English';
        fab.setAttribute('aria-label', 'Read this page in English');
        fab.setAttribute('data-lang-fab-target', 'en');
      }
    }

    document.documentElement.setAttribute('data-lang', lang);

    try { localStorage.setItem('site-lang', lang); } catch (e) { /* modo privado etc. — segue sem persistir */ }
  }

  function initialLang() {
    try {
      var saved = localStorage.getItem('site-lang');
      if (saved === 'pt' || saved === 'en') return saved;
    } catch (e) { /* localStorage indisponível — segue com o padrão */ }
    return 'pt';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-lang-btn'));
      });
    });
    var fab = document.querySelector('[data-lang-fab]');
    if (fab) {
      fab.addEventListener('click', function () {
        applyLang(fab.getAttribute('data-lang-fab-target') || 'en');
      });
    }
    applyLang(initialLang());
  });
})();

// Page content. Each page: { path, title, description, h1 in body, trail (breadcrumbs), body, schema? }
import { site, products, sizeGuide, telHref, waHref } from './site.mjs';
import { productArt, glyph, formScale, routeArt, icon } from './art.mjs';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const home = ['/', 'Home'];
const quote = (slug, label = 'Request a quote') => `<a class="btn btn-primary" href="/contact/${slug ? `?product=${slug}` : ''}">${label}</a>`;

const hero = ({ h1, lead, actions = '', art = '', kicker = '' }) => `
<section class="page-hero">
  <div class="wrap page-hero-grid${art ? '' : ' no-art'}">
    <div>
      ${kicker ? `<p class="kicker">${kicker}</p>` : ''}
      <h1>${h1}</h1>
      <p class="lead">${lead}</p>
      ${actions ? `<div class="actions">${actions}</div>` : ''}
    </div>
    ${art ? `<div class="page-hero-art">${art}</div>` : ''}
  </div>
</section>`;

const cta = (title = 'Start with your requirement', text = 'Tell us the product, form, quantity and destination. We will come back with available options and the questions we need answered to quote accurately.') => `
<section class="section">
  <div class="wrap cta-panel">
    <div><h2>${title}</h2><p>${text}</p></div>
    <div class="actions">${quote()}<a class="btn btn-ghost" href="/ZAPAX-GLOBAL-product-overview.pdf" download>Download product overview (PDF)</a></div>
  </div>
</section>`;

const list = (items, cls = 'ticks') => `<ul class="${cls}">${items.map((i) => `<li>${icon('check')}<span>${i}</span></li>`).join('')}</ul>`;
const features = (items) => `<div class="features">${items.map(([ic, t, d]) => `<div class="feature">${icon(ic)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div>`;
const steps = (items) => `<ol class="steps">${items.map(([t, d]) => `<li><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>`;
const prose = (html) => `<div class="prose">${html}</div>`;
const split = (left, right, cls = '') => `<section class="section ${cls}"><div class="wrap split">${left}<div>${right}</div></div></section>`;
const head = (h2, p = '') => `<div class="section-head"><h2>${h2}</h2>${p ? `<p>${p}</p>` : ''}</div>`;
const faqList = (items) => `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}${icon('down')}</summary><div><p>${a}</p></div></details>`).join('')}</div>`;
const faqSchema = (items) => ({ '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

// Company registrations: only confirmed entries (see site.registrations).
const regs = site.registrations.filter((r) => r.number || r.always);
const regCards = (items) => `<ul class="regs">${items.map((r) => `
  <li class="reg">
    ${icon('doc')}
    <div>
      <h3>${r.name}</h3>
      <p class="reg-auth">${r.authority}</p>
      ${r.number ? `<p class="reg-no"><span>${r.label}</span> <strong>${esc(r.number)}</strong></p>` : ''}
      ${r.note ? `<p class="reg-note">${r.note}</p>` : ''}
      <p class="reg-links">${r.file ? `<a class="link" href="${r.file}" target="_blank" rel="noopener">View certificate ${icon('arrow')}</a>` : ''}<a class="link" href="${r.verify}" target="_blank" rel="noopener">Verify on the official portal ${icon('arrow')}</a></p>
    </div>
  </li>`).join('')}
</ul>`;

const productRows = (group) => `
<ul class="product-rows">${products.filter((p) => !group || p.group === group).map((p) => `
  <li>
    <a class="product-row" href="/products/${p.slug}/">
      <span class="product-row-art">${productArt(p.art)}</span>
      <span class="product-row-text"><strong>${p.name}</strong><span>${p.summary}</span></span>
      <span class="product-row-forms">${p.forms.map(([g, t]) => `<span class="form-chip">${glyph(g)}${t}</span>`).join('')}</span>
      <span class="product-row-go">${icon('arrow')}<span class="sr-only">View ${p.name}</span></span>
    </a>
  </li>`).join('')}
</ul>`;

const productNames = 'dehydrated onion, garlic, black garlic, ginger, vegetables and fruits';
const visionGrowth = `Today we export ${productNames}. This is our starting point, not our limit. We plan to grow into a wide range of products made and grown across India, adding each new category only when we can supply it to the standard our buyers trust.`;

const processSteps = [
  ['Share your requirement', 'Send the product, form or grade, quantity, packaging and destination port. The more detail you share, the faster we can respond accurately.'],
  ['We confirm options', 'We check availability with our producing partners and come back with what can be supplied, plus any questions about your specification.'],
  ['Agree the specification', 'Parameters, packing and documents are written down and agreed. Samples can be arranged where the product and partner allow.'],
  ['Receive a clear offer', 'You receive a quotation stating price, the Incoterms rule, payment terms and the expected dispatch window.'],
  ['Production, packing and documents', 'We coordinate the order with the producing partner, follow the agreed packing and prepare the export documents.'],
  ['Shipment and follow-up', 'We keep you updated through dispatch and arrival, and ask for your feedback so the next order goes even better.'],
];

// ---------- Home ----------
const homePage = {
  path: '/',
  title: 'ZAPAX GLOBAL | Dehydrated Onion, Garlic and Ginger Exporter from India',
  description: 'ZAPAX GLOBAL exports dehydrated onion, garlic, black garlic, ginger, vegetables and fruits from India, with every specification agreed in writing before shipment.',
  bodyClass: 'is-home',
  body: `
<section class="home-hero">
  <div class="wrap">
    <p class="kicker">Export company · Gujarat, India</p>
    <h1>Indian exports, carried on trust.</h1>
    <div class="home-hero-row">
      <p class="lead">ZAPAX GLOBAL exports dehydrated onion, garlic, black garlic, ginger, vegetables and fruits from India, sourced through trusted producing partners. Every detail is agreed with you in writing, so the trust built at the first inquiry travels with your order all the way to your port.</p>
      <div class="actions">${quote()}<a class="btn btn-ghost" href="/products/">Browse products</a></div>
    </div>
  </div>
  <div class="wrap form-scale-wrap">${formScale()}</div>
</section>

<section class="section intro">
  <div class="wrap split">
    <h2 class="statement">Trust that travels with every shipment.</h2>
    <div class="prose">
      <p>ZAPAX GLOBAL is an export company based in Gujarat, India. We connect importers, distributors and manufacturers around the world with trusted producing partners across India, and we remain your single point of contact from the first inquiry to the arrival of your shipment.</p>
      <p>We do not run our own processing plant. We work with producing partners selected for each product, which means we can match the right source to your specification and grow our range as buyer needs evolve.</p>
      <p><a class="link" href="/about/">Read our story ${icon('arrow')}</a></p>
    </div>
  </div>
</section>

<section class="section tint" id="products">
  <div class="wrap">
    ${head('What we export today', 'Dehydrated and speciality food products, each available in the forms shown. Exact specifications and current availability are confirmed against your brief.')}
    ${productRows()}
    <p class="note">This is where we start, not where we stop. We plan to export many more products from India. If you are sourcing something that is not listed, <a href="/contact/">tell us what you need</a>.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${head('Quality is agreed before anything travels', 'Our sourcing philosophy is simple: be specific, be transparent and check before dispatch.')}
    ${features([
      ['search', 'Partners chosen per product', 'We select producing partners for their experience with each product, and review their processes and documentation before we work together.'],
      ['doc', 'Specifications in writing', 'Moisture, particle size, colour, microbiology and packing are agreed on a specification sheet, so both sides know exactly what is being shipped.'],
      ['check', 'Checks before dispatch', 'Lots are checked against the agreed specification before packing. Independent inspection or laboratory testing can be arranged at your request.'],
      ['chat', 'Honest answers', 'If something cannot be confirmed, we say so. We would rather lose an order than promise what we cannot deliver.'],
    ])}
    <p><a class="link" href="/quality/">See our quality approach ${icon('arrow')}</a></p>
  </div>
</section>

<section class="section tint">
  <div class="wrap">
    ${head('How your order travels from India to you', 'A clear, six-step process, with you kept informed at every stage.')}
    ${steps(processSteps)}
  </div>
</section>

<section class="section dark">
  <div class="wrap split split-art">
    <div>
      <h2>Export coordination, handled from Gujarat</h2>
      <p class="lead">Gujarat is home to some of India’s busiest ports. From here we coordinate the practical side of international trade, so your team can focus on the product.</p>
      ${list([
        'Bulk and retail packaging options agreed per product',
        'Export documents prepared and checked against your destination’s requirements',
        'Shipping coordination by sea in dry containers, and by air where suitable',
        'One contact for questions, updates and after-shipment feedback',
      ])}
      <div class="actions"><a class="btn btn-light" href="/export/">Our export capabilities</a></div>
    </div>
    <div class="route-wrap">${routeArt()}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${head('Why buyers trust ZAPAX GLOBAL')}
    <dl class="reasons">
      <div><dt>One accountable contact</dt><dd>You speak to the same team from inquiry to delivery, not a chain of intermediaries.</dd></div>
      <div><dt>Clarity before commitment</dt><dd>Specifications, packing, documents and Incoterms are agreed in writing before you place an order.</dd></div>
      <div><dt>Transparency about our model</dt><dd>We tell you that we work with producing partners, and we share their relevant certificates and reports for your review.</dd></div>
      <div><dt>Flexible, growing range</dt><dd>Our partner network lets us source new products and forms as your requirements change.</dd></div>
      <div><dt>Every deal on written terms</dt><dd>The same pre-agreed terms apply to the first shipment and the hundredth, in every product category, protecting both sides from fraud. <a href="/trade-terms/">Read our trade terms</a>.</dd></div>
      <div><dt>Long-term thinking</dt><dd>We measure success by repeat orders and relationships that last, not by a single shipment.</dd></div>
    </dl>
  </div>
</section>

<section class="section tint">
  <div class="wrap">
    ${head('Registered and verifiable', `${esc(site.legalName)} is a registered limited liability partnership in India. Check our registrations yourself on the official government portals.`)}
    ${regCards(regs)}
    <p><a class="link" href="/company-registrations/">All company registrations and export licences ${icon('arrow')}</a></p>
  </div>
</section>

<section class="section vision" aria-labelledby="vision-h">
  <div class="wrap">
    <h2 id="vision-h">Our vision</h2>
    <p class="vision-quote">${site.vision}</p>
    <div class="split vision-split">
      <div><h3>Our mission</h3><p>${site.mission}</p></div>
      <div><h3>Beyond one category</h3><p>${visionGrowth}</p><p><a class="link" href="/vision/">Read our full vision ${icon('arrow')}</a></p></div>
    </div>
  </div>
</section>

<section class="section tint">
  <div class="wrap split">
    <div><h2>Responsible sourcing, practical sustainability</h2><p class="lead">We focus on what an export partner can genuinely influence: fair dealings with producing partners, less waste and efficient shipments.</p></div>
    <div class="prose">
      <p>Dehydration turns surplus harvests into shelf-stable products, and removing water means fewer tonnes shipped for the same amount of food. We plan full container loads, right-size packaging and work with partners who value good production practice.</p>
      <p><a class="link" href="/sustainability/">Our approach to sustainability ${icon('arrow')}</a></p>
    </div>
  </div>
</section>
${cta('Ready to discuss your next order?')}
`,
};

// ---------- About ----------
const aboutPage = {
  path: '/about/',
  title: 'About Us | Export Company from Gujarat, India',
  description: 'ZAPAX GLOBAL LLP was founded in Gujarat by Chetan Punani and Keval Chauhan to carry India’s products to the world on trust. Our story, founders and values.',
  schemaType: 'AboutPage',
  trail: [home, ['/about/', 'About']],
  body: `
${hero({ h1: 'Built in Gujarat to carry India’s best to the world', lead: 'ZAPAX GLOBAL began with a simple belief: international buyers deserve an Indian export partner who is clear, dependable and honest about what it can deliver. Trust is what we build, and what travels with every order.' })}
${split('<h2>Our story</h2>', prose(`
  <p>ZAPAX GLOBAL was founded in Gujarat, India, by Chetan Punani and Keval Chauhan. Gujarat is one of India’s great trading states, with major ports and a long tradition of commerce, and buyers around the world already depend on Indian products such as onion, garlic, ginger and spices.</p>
  <p>The founders saw that buyers abroad often struggle to find an Indian supplier they can rely on, one that gives straight answers, agrees specifications properly and stays responsive after the order is placed. They started ZAPAX GLOBAL to fill that gap.</p>
  <p>We are a young company, and we are open about it. We do not own processing facilities. Instead, we work with producing partners chosen for each product, and we take responsibility for coordination, communication and export execution. We began with dehydrated food products, and we are building a company that will export many more of India’s products.</p>`))}
<section class="section tint">
  <div class="wrap split">
    <div><h2 class="h3">Our vision</h2><p class="statement-sm">${site.vision}</p><p><a class="link" href="/vision/">Read our full vision ${icon('arrow')}</a></p></div>
    <div><h2 class="h3">Our mission</h2><p class="statement-sm">${site.mission}</p></div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${head('Founders', 'ZAPAX GLOBAL is led by its two founders, who are personally involved in every buyer relationship.')}
    <ul class="founders">${site.people.map((pp) => `<li><span class="founder-mark" aria-hidden="true">${pp.name.split(' ').map((w) => w[0]).join('')}</span><div><h3>${pp.name}</h3><p>${pp.role}, ZAPAX GLOBAL</p></div></li>`).join('')}</ul>
    <p class="founders-note">Their long-term goal is to build an export company that buyers return to for years, across shipments and product categories, because every deal is handled on clear, written terms.</p>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${head('What we value')}
    <dl class="reasons">
      <div><dt>Integrity</dt><dd>We say what we know and confirm what we do not. We never present a partner’s certificate or capability as our own.</dd></div>
      <div><dt>Clarity</dt><dd>Specifications, prices and timelines are written down so there are no surprises.</dd></div>
      <div><dt>Respect</dt><dd>We value the farmers and processors who make our products, and the buyers who trust us with their supply.</dd></div>
      <div><dt>Reliability</dt><dd>We follow through on commitments and keep you informed, especially when something changes.</dd></div>
      <div><dt>Growth</dt><dd>We aim to improve with every order and to grow by earning long-term relationships.</dd></div>
    </dl>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${head('Our goals', 'The commitments that guide how we are building ZAPAX GLOBAL.')}
    ${list([
      'Establish a recognised international export brand from India',
      'Build lasting relationships with buyers around the world',
      'Maintain consistent product quality from order to order',
      'Develop reliable sourcing and supply networks',
      'Keep improving our export operations and customer experience',
      'Expand our product portfolio strategically, one well-supported category at a time',
    ], 'ticks two-col')}
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <h2>Who we work with</h2>
    <div>${features([
      ['globe', 'Importers and distributors', 'Building dependable supply of products from India for their regional markets.'],
      ['box', 'Food manufacturers', 'Seasoning blenders, soup, snack and ready-meal producers who need consistent ingredients.'],
      ['scale', 'Private label and retail', 'Brands exploring bulk or packed supply for their own label, where order scope allows.'],
    ])}</div>
  </div>
</section>
${cta('Let’s talk about your requirements')}
`,
};

// ---------- Products index ----------
const productsPage = {
  path: '/products/',
  title: 'Dehydrated Onion, Garlic, Ginger and More from India',
  description: 'Dehydrated onion, garlic, black garlic, ginger, vegetables and fruits from India. Available forms, specification parameters and export packaging for each product.',
  schemaType: 'CollectionPage',
  trail: [home, ['/products/', 'Products']],
  schema: [{ '@type': 'ItemList', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `${site.domain}/products/${p.slug}/` })) }],
  body: `
${hero({ h1: 'Products from India, ready to travel', lead: 'Browse our current range. Every product page lists available forms, the parameters we agree on the specification sheet, packaging options and how the product travels.' })}
<section class="section">
  <div class="wrap">
    <h2 class="group-h">Our current range</h2>
    ${productRows()}
  </div>
</section>
<section class="section tint" id="size-guide">
  <div class="wrap split">
    <div><h2>Size guide for dehydrated cuts</h2><p>Common size bands used in the trade, for reference when writing your inquiry. Your order specification is always confirmed in writing.</p></div>
    <div class="table-wrap"><table><caption class="sr-only">Reference size bands for dehydrated cuts</caption><thead><tr><th scope="col">Form</th><th scope="col">Reference size</th></tr></thead><tbody>${sizeGuide.map(([f, s]) => `<tr><th scope="row">${f}</th><td>${s}</td></tr>`).join('')}</tbody></table></div>
  </div>
</section>
${cta('Looking for something not listed?', 'Our range is growing beyond what you see here. Tell us the product from India and the specification you need, and we will check whether we can supply it.')}
`,
};

// ---------- Product detail pages ----------
const productPages = products.map((p) => {
  const others = products.filter((o) => o !== p).slice(0, 3);
  const faqs = [
    ...p.faq,
    ['What information should I include in my inquiry?', 'Include the product and form, required specification or grade, estimated quantity, preferred packaging, destination port and target shipment date.'],
    ['Are your specifications fixed?', 'No. The parameters on this page are agreed per order on a specification sheet, based on your application, your market’s regulations and what our producing partners can supply.'],
  ];
  return {
    path: `/products/${p.slug}/`,
    waText: `Hello ZAPAX GLOBAL, I am interested in ${p.name}. Please share details.`,
    title: p.title,
    description: p.description,
    trail: [home, ['/products/', 'Products'], [`/products/${p.slug}/`, p.name]],
    schema: [faqSchema(faqs)],
    body: `
${hero({ kicker: `${p.group} products`, h1: p.h1, lead: p.intro[0], actions: `${quote(p.slug, `Request a ${p.name.toLowerCase()} quote`)}<a class="btn btn-ghost" href="#specification">View specification</a>`, art: productArt(p.art, `Illustration of ${p.name.toLowerCase()}`) })}
<section class="section">
  <div class="wrap split">
    <div><h2>Overview</h2></div>
    <div class="prose">
      <p>${p.intro[1]}</p>
      <h3>Products and varieties</h3><p>${p.varieties.join(', ')}.</p>
    </div>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${head('Available forms')}
    <ul class="forms">${p.forms.map(([g, t]) => `<li>${glyph(g)}<span>${t}</span></li>`).join('')}</ul>
  </div>
</section>
<section class="section" id="specification">
  <div class="wrap split">
    <div>
      <h2>Specification parameters</h2>
      <p>These are the parameters we agree with you on the product specification sheet. Values depend on the form, the producing partner and your market’s requirements, so we confirm them per order rather than publishing generic figures.</p>
      ${p.group === 'Dehydrated' ? '<p><a class="link" href="/products/#size-guide">Reference size guide ' + icon('arrow') + '</a></p>' : ''}
    </div>
    <div class="table-wrap"><table><caption class="sr-only">${p.name} specification parameters</caption><thead><tr><th scope="col">Parameter</th><th scope="col">How it is specified</th></tr></thead><tbody>${p.params.map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}</tbody></table></div>
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <div><h2>Applications</h2>${list(p.applications)}</div>
    <div><h2>Packaging options</h2><dl class="defs">${p.packing.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl><p><a class="link" href="/packaging/">More about packaging ${icon('arrow')}</a></p></div>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div><h2 class="h3">${icon('thermo')} Storage</h2><p>${p.storage}</p></div>
    <div><h2 class="h3">${icon('ship')} Export suitability</h2><p>${p.suitability}</p></div>
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <div><h2>Questions about ${p.name.toLowerCase()}</h2></div>
    ${faqList(faqs)}
  </div>
</section>
${others.length ? `<section class="section"><div class="wrap">${head('Related products')}<ul class="related">${others.map((o) => `<li><a href="/products/${o.slug}/">${productArt(o.art)}<span>${o.name}</span></a></li>`).join('')}</ul></div></section>` : ''}
${cta(`Request a quote for ${p.name.toLowerCase()}`, 'Share your form, specification, quantity and destination. We will confirm availability and send a clear offer.')}
`,
  };
});

// ---------- Quality ----------
const qualityPage = {
  path: '/quality/',
  title: 'Quality Assurance | How We Source, Check and Ship',
  description: 'How ZAPAX GLOBAL handles product selection, sourcing standards, inspection, packaging, transport, documentation and traceability for exports from India.',
  trail: [home, ['/quality/', 'Quality']],
  body: `
${hero({ h1: 'Quality you can check, not just a promise', lead: 'Quality in export trade means the product that arrives matches the product that was agreed. Here is how we make sure the trust you place in an order travels with it, stage by stage, and what we can and cannot claim.' })}
<section class="section">
  <div class="wrap">
    ${head('From selection to shipment')}
    ${steps([
      ['Product selection', 'We start from your application and market. Your intended use decides the right variety, form and specification.'],
      ['Sourcing standards', 'We work with producing partners who have relevant experience with the product, and we review their processes, hygiene practices and available documentation before supplying from them.'],
      ['Specification agreement', 'Parameters such as moisture, particle size, colour, foreign matter and microbiology are agreed on a written specification sheet before the order.'],
      ['Inspection before dispatch', 'Lots are checked against the agreed specification before packing. At your request, and usually at your cost, we can arrange independent inspection or laboratory analysis.'],
      ['Packaging and handling', 'Products are packed in the agreed materials, with clean, food-grade liners and moisture protection suited to the product and route.'],
      ['Storage and transport', 'Goods are kept dry and away from contamination before loading, so they arrive in the condition in which they left.'],
      ['Documentation', 'Certificates of analysis, phytosanitary certificates and other documents your market requires are prepared and shared with you before shipment.'],
    ])}
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <h2>Traceability</h2>
    <div class="prose"><p>Where our producing partners provide lot or batch coding, it is carried through to the packing and the shipping documents, so a product can be traced back to its production lot. We tell you before you order what level of traceability is available for each product.</p></div>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <h2>About certifications</h2>
    <div class="prose">
      <p>Food safety and quality certifications are held by the facilities that process the product. When you consider a product, we share the producing partner’s relevant certificates and test reports for your review.</p>
      <p>ZAPAX GLOBAL does not display certification logos on this website, and we will never present a partner’s certification as our own. If your market requires a specific certification, tell us early and we will confirm whether we can supply from a certified source.</p>
    </div>
  </div>
</section>
${cta('Have a specific quality requirement?', 'Send us your specification sheet or the parameters your market requires, and we will confirm what can be met.')}
`,
};

// ---------- Export capabilities ----------
const exportPage = {
  path: '/export/',
  title: 'Export Capabilities | Bulk Supply from India',
  description: 'How ZAPAX GLOBAL coordinates bulk exports from India: product handling, packaging, buyer requirements, shipping, documents and communication.',
  trail: [home, ['/export/', 'Export capabilities']],
  body: `
${hero({ h1: 'Export coordination from inquiry to arrival', lead: 'We handle the practical work of exporting from India, so you deal with one trusted partner who understands both the product and the paperwork, wherever your goods are travelling.' })}
<section class="section">
  <div class="wrap">
    ${head('What we handle for you')}
    ${features([
      ['box', 'Product handling', 'We coordinate how each product is prepared, packed and stored at the producing partner, following the agreed specification.'],
      ['scale', 'Bulk supply inquiries', 'We quote for bulk quantities, from part loads to full containers. Minimum quantities depend on the product, so tell us the volume you have in mind.'],
      ['doc', 'Buyer requirements', 'Your specification, labelling, documentation and inspection requirements are recorded at the start and checked before dispatch.'],
      ['ship', 'Shipping coordination', 'We work with freight forwarders to arrange sea freight in dry containers, and air freight where the product and market justify it.'],
      ['file', 'Documentation support', 'We prepare the commercial and regulatory documents for your shipment and share drafts for checking before they are finalised.'],
      ['chat', 'Communication', 'You receive regular updates at each stage, from order confirmation through loading to arrival, in clear business English.'],
    ])}
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <div><h2>Trade terms</h2><p>Offers are quoted on the Incoterms® rule agreed with you, for example FOB at an Indian port, or CFR or CIF to your destination port. Each quotation states the price basis, payment terms and expected dispatch window.</p><p><a class="link" href="/shipping/">How shipping and delivery work ${icon('arrow')}</a></p></div>
    <div><h2>What to include in an inquiry</h2>${list(['Product, form and grade', 'Specification or intended application', 'Estimated quantity per shipment and per year', 'Preferred packaging and labelling', 'Destination port and preferred Incoterms', 'Target shipment date'])}</div>
  </div>
</section>
${cta()}
`,
};

// ---------- Packaging ----------
const packagingPage = {
  path: '/packaging/',
  title: 'Export Packaging for Dehydrated Products',
  description: 'Export packaging for dehydrated products: poly-lined cartons, foil vacuum bags and retail pouches, plus labelling, palletisation and container loading.',
  trail: [home, ['/export/', 'Export'], ['/packaging/', 'Packaging']],
  body: `
${hero({ h1: 'Packaging built for the journey', lead: 'The right packing depends on the product, the destination climate, transit time and how you handle goods at the other end. We agree it with you before the order is confirmed.' })}
<section class="section">
  <div class="wrap split">
    <h2>Dehydrated products</h2>
    <dl class="defs">
      <div><dt>Poly-lined corrugated cartons</dt><dd>Food-grade polyethylene liner inside a corrugated carton. Commonly requested net weights include 10 kg, 20 kg and 25 kg, subject to product and agreement.</dd></div>
      <div><dt>Aluminium foil vacuum bags</dt><dd>Extra protection against moisture, oxygen and aroma loss for sensitive products such as powders. Available to discuss for suitable products.</dd></div>
      <div><dt>Retail stand-up pouches</dt><dd>Customised retail packs can be explored where the product, labelling requirements and order size allow.</dd></div>
    </dl>
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <h2>Labelling and loading</h2>
    <div class="prose">
      <p>Cartons and bags can be marked with product name, net weight, lot number, production and best-before dates, country of origin and any destination-specific information you require. Send us your label artwork or requirements early, as some markets have strict rules.</p>
      <p>Palletisation, stretch wrapping and container loading plans are discussed per order to make good use of container space while protecting the goods.</p>
    </div>
  </div>
</section>
${cta('Need a specific pack format?')}
`,
};

// ---------- Documentation ----------
const docs = [
  ['Commercial invoice', 'States the goods, value, Incoterms rule and parties to the sale. Required for customs clearance everywhere.'],
  ['Packing list', 'Details the number of packages, weights and marks, so the shipment can be checked on arrival.'],
  ['Bill of lading or air waybill', 'The transport document issued by the carrier. An original bill of lading is often used to transfer ownership of goods shipped by sea.'],
  ['Certificate of origin', 'Confirms the goods originate in India. A preferential certificate may reduce import duty where a trade agreement applies.'],
  ['Phytosanitary certificate', 'Issued by India’s plant protection authorities for plant-based products where the importing country requires it, confirming the goods meet its plant health rules.'],
  ['Certificate of analysis', 'Laboratory results for the agreed parameters of the shipped lot, from the producer’s laboratory or an independent laboratory if requested.'],
  ['Fumigation certificate', 'Required by some destinations for certain products or for wooden packaging materials.'],
  ['Insurance certificate', 'Provided when insurance is part of the agreed terms, for example under CIF.'],
];
const documentationPage = {
  path: '/documentation/',
  title: 'Export Documentation for Products from India',
  description: 'Documents commonly needed to import products from India: commercial invoices, packing lists, bills of lading, certificates of origin and phytosanitary certificates.',
  trail: [home, ['/export/', 'Export'], ['/documentation/', 'Documentation']],
  body: `
${hero({ h1: 'Export documentation, prepared and checked', lead: 'Documents decide whether a shipment clears customs smoothly, and correct paperwork is how trust travels across borders. Here are the documents commonly involved in exports from India. The exact set depends on your product and destination.' })}
<section class="section">
  <div class="wrap">
    <dl class="doc-grid">${docs.map(([t, d]) => `<div>${icon('doc')}<dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <h2>How we handle documents</h2>
    <div class="prose">
      <p>At the start of every order we confirm the list of documents your market and your bank require. Draft documents are shared with you for checking before they are finalised, which helps avoid costly corrections after the goods have sailed.</p>
      <p>Import regulations change. Please also confirm the current requirements with your customs broker or the relevant authority in your country.</p>
    </div>
  </div>
</section>
${cta('Have specific documentation requirements?')}
`,
};

// ---------- Shipping ----------
const shippingPage = {
  path: '/shipping/',
  title: 'Shipping and Delivery Information',
  description: 'How shipping and delivery work for ZAPAX GLOBAL export orders: Incoterms, sea and air freight, transit times, risk transfer and what affects delivery dates.',
  trail: [home, ['/export/', 'Export'], ['/shipping/', 'Shipping and delivery']],
  body: `
${hero({ h1: 'Shipping and delivery', lead: 'How we arrange shipments and what to expect. The specific terms of each order are set out in its quotation and sales contract, which take precedence over this general information.' })}
<section class="section">
  <div class="wrap prose prose-wide">
    <h2>Incoterms and responsibility</h2>
    <p>Each order uses an Incoterms® rule agreed with you. Under FOB, for example, responsibility passes to you once the goods are loaded on board at the Indian port, and you arrange the main freight. Under CFR or CIF, we arrange the freight to your destination port, and under CIF we also arrange cargo insurance. The agreed rule is stated on the quotation and invoice.</p>
    <h2>Modes of transport</h2>
    <p>Our products ship by sea in dry containers, or by air for urgent or smaller consignments. Shipments typically leave from a west-coast port in Gujarat, or from another Indian port where the product or route makes that more practical.</p>
    <h2>Transit times and dispatch dates</h2>
    <p>Each quotation states an expected dispatch window. Transit times depend on the route, the carrier’s schedule and transhipment, and are estimates provided by shipping lines rather than guarantees. We share the vessel details and expected arrival date as soon as the booking is confirmed.</p>
    <h2>Delays</h2>
    <p>Port congestion, weather, carrier schedule changes, inspections and regulatory holds can affect shipments. If anything changes, we tell you promptly and work with you and the forwarder on the best way forward.</p>
    <h2>On arrival</h2>
    <p>Import clearance, duties and local delivery at the destination are normally the buyer’s responsibility unless agreed otherwise. Please inspect goods on arrival and report any concern in writing with photographs as soon as possible, so it can be investigated with the relevant parties.</p>
  </div>
</section>
${cta()}
`,
};

// ---------- Sustainability ----------
const sustainabilityPage = {
  path: '/sustainability/',
  title: 'Sustainability and Responsible Sourcing',
  description: 'ZAPAX GLOBAL’s practical approach to responsible sourcing, reducing food waste, using resources efficiently and building a sustainable export business.',
  trail: [home, ['/sustainability/', 'Sustainability']],
  body: `
${hero({ h1: 'Responsible trade, one practical step at a time', lead: 'We are a young company, so we focus on what we can influence today, and we report honestly on it. We make no environmental claims we cannot support.' })}
<section class="section">
  <div class="wrap">
    ${head('Where we focus')}
    ${features([
      ['sprout', 'Responsible sourcing', 'We prefer producing partners who follow good production and manufacturing practices, and we aim for fair, transparent dealings with them, including clear terms and timely communication.'],
      ['leaf', 'Less food waste', 'Dehydration turns perishable harvests into ingredients that keep for months, so more of what farmers grow reaches the people who eat it.'],
      ['ship', 'Efficient shipments', 'Removing water means less weight and volume shipped for the same amount of food. We plan full container loads where possible and pack to use space well.'],
      ['box', 'Right-sized packaging', 'We match packaging to the product and route, enough to protect quality without unnecessary material.'],
    ])}
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <h2>Growing sustainably</h2>
    <div class="prose">
      <p>For us, a sustainable business also means steady growth: adding products only when we can supply them reliably, building long-term relationships rather than one-off trades, and improving our processes with every order.</p>
      <p>As ZAPAX GLOBAL grows, we intend to set measurable goals and report on them openly. Buyers with specific sustainability requirements, such as sourcing documentation or packaging preferences, are welcome to discuss them with us.</p>
    </div>
  </div>
</section>
${cta('Have sustainability requirements for your supply chain?', 'Tell us what your business needs to document, and we will confirm what our partners can provide.')}
`,
};

// ---------- FAQ ----------
const faqs = [
  ['Is ZAPAX GLOBAL a manufacturer?', 'No. ZAPAX GLOBAL is a sourcing and export company. We work with producing partners selected for each product, and we coordinate specifications, packing, documents and shipment. We are always transparent about this.'],
  ['Where is ZAPAX GLOBAL based?', `We are based in ${site.region}, India. Our full office address is on our <a href="/contact/">contact page</a>.`],
  ['What products do you export?', `We currently export ${productNames}. We do not export fresh produce. Our range is growing, so ask us about other products from India.`],
  ['Do you plan to export other products from India?', 'Yes. Dehydrated food products are our starting point. We plan to expand into many more categories of products from India, adding each one only when we can supply it reliably. If you are sourcing something else from India, tell us and we will tell you honestly whether we can help.'],
  ['What is your minimum order quantity?', 'It depends on the product and packing. Many buyers order by the container, but tell us the volume you need and we will confirm what is possible.'],
  ['Can I get samples?', 'Samples can be arranged for many products, depending on the product and the producing partner. Request them in your inquiry along with your specification.'],
  ['Which Incoterms do you offer?', 'We quote on the Incoterms rule agreed with you, for example FOB, CFR or CIF. The rule is stated on every quotation.'],
  ['Which certifications do you have?', 'Certifications such as food safety schemes are held by the processing facilities we work with. We share the relevant partner certificates and test reports for your review, and we will not present them as our own.'],
  ['Which documents will I receive?', 'Typically a commercial invoice, packing list, bill of lading and certificate of origin, plus a phytosanitary certificate, certificate of analysis or other documents as your market requires. We confirm the list before each order.'],
  ['How do I request a quote?', 'Use our inquiry form and include the product, form, specification, quantity, packaging and destination port. The more detail you include, the more accurate our quotation will be.'],
  ['How do you protect buyers against fraud?', 'Every deal follows pre-agreed written terms. We contact you only through our official phone number and email addresses, our bank account is in the company’s name, and bank details are never changed by email or chat. Full details are on our trade terms page.'],
  ['What are your payment terms?', 'Payment terms are agreed in writing for each contract and stated on the proforma invoice. Common international options include advance payment, letter of credit (LC) and documents against payment (D/P).'],
  ['Which countries do you ship to?', 'We welcome inquiries from buyers worldwide. Whether we can ship to your country depends on the product and the destination’s import rules, which we check before quoting.'],
];
const faqPage = {
  path: '/faq/',
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions from international buyers about ZAPAX GLOBAL: business model, products, minimum orders, samples, Incoterms, certifications and documents.',
  trail: [home, ['/faq/', 'FAQ']],
  schema: [faqSchema(faqs)],
  body: `
${hero({ h1: 'Frequently asked questions', lead: 'Straight answers to the questions international buyers ask us most. If yours is not here, ask us directly.' })}
<section class="section"><div class="wrap narrow">${faqList(faqs)}</div></section>
${cta('Still have a question?', 'Send us a message and our team will reply with a clear answer.')}
`,
};

// ---------- Contact ----------
const countryCodes = 'AF AX AL DZ AS AD AO AI AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BA BW BR BN BG BF BI KH CM CA CV KY CF TD CL CN CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RE RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TC TV UG UA AE GB US UY UZ VU VA VE VN VG VI YE ZM ZW'.split(' ');
const regionName = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = countryCodes.map((c) => regionName.of(c)).sort((a, b) => a.localeCompare(b, 'en'));

const field = (name, label, input, { required, hint } = {}) => `
<div class="field">
  <label for="f-${name}">${label}${required ? ' <span class="req" aria-hidden="true">*</span>' : ' <span class="opt">(optional)</span>'}</label>
  ${hint ? `<p class="hint" id="f-${name}-hint">${hint}</p>` : ''}
  ${input}
  <p class="error" id="f-${name}-error" hidden></p>
</div>`;
const netlifyForm = site.formEndpoint === 'netlify';
const describedBy = (name, hint) => `aria-describedby="${hint ? `f-${name}-hint ` : ''}f-${name}-error"`;

const contactPage = {
  path: '/contact/',
  title: 'Contact Us | Request a Quote',
  description: 'Request a quote for dehydrated onion, garlic, black garlic, ginger, vegetables or fruits from India. Share the product, quantity and destination port.',
  schemaType: 'ContactPage',
  bodyClass: 'is-contact',
  trail: [home, ['/contact/', 'Contact']],
  body: `
${hero({ h1: 'Request a quote', lead: 'Tell us what you need. We read every inquiry and reply with available options, a clear offer or the questions we need answered to quote accurately.' })}
<section class="section">
  <div class="wrap contact-grid">
    <form class="inquiry" id="inquiry" action="${netlifyForm ? '/contact/' : site.formEndpoint || '#'}" method="post" novalidate${netlifyForm ? ' name="inquiry" data-netlify="true" netlify-honeypot="website"' : ''} data-endpoint="${esc(site.formEndpoint)}" data-email="${esc(site.email)}" data-phone="${esc(site.phone)}" data-wa="${esc(waHref())}">
      <div class="form-grid">
        ${field('name', 'Full name', `<input id="f-name" name="name" type="text" autocomplete="name" required maxlength="100" ${describedBy('name')}>`, { required: true })}
        ${field('company', 'Company name', `<input id="f-company" name="company" type="text" autocomplete="organization" required maxlength="150" ${describedBy('company')}>`, { required: true })}
        ${field('email', 'Business email', `<input id="f-email" name="email" type="email" autocomplete="email" required maxlength="150" ${describedBy('email')}>`, { required: true })}
        ${field('country', 'Country', `<select id="f-country" name="country" autocomplete="country-name" required ${describedBy('country')}><option value="">Select your country</option>${countries.map((c) => `<option>${esc(c)}</option>`).join('')}</select>`, { required: true })}
        ${field('phone', 'Phone or WhatsApp', `<input id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="30" inputmode="tel" ${describedBy('phone', 1)}>`, { hint: 'Include your country code, for example +44.' })}
        ${field('product', 'Product of interest', `<select id="f-product" name="product" required ${describedBy('product')}><option value="">Select a product</option>${products.map((p) => `<option value="${p.name}" data-slug="${p.slug}">${p.name}</option>`).join('')}<option>Several products</option><option>Other product</option></select>`, { required: true })}
        ${field('quantity', 'Required quantity', `<input id="f-quantity" name="quantity" type="text" maxlength="100" ${describedBy('quantity', 1)}>`, { hint: 'For example 10 MT, or one 20 ft container per month.' })}
        ${field('port', 'Destination port', `<input id="f-port" name="destination_port" type="text" maxlength="100" ${describedBy('port')}>`)}
        <div class="span-2">${field('message', 'Message or specifications', `<textarea id="f-message" name="message" rows="6" maxlength="4000" ${describedBy('message', 1)}></textarea>`, { hint: 'Form or cut, mesh size, packaging, documents and target shipment date.' })}</div>
      </div>
      <div class="hp" aria-hidden="true"><label for="f-website">Leave this field empty</label><input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
      <input type="hidden" name="_subject" value="New ZAPAX GLOBAL website inquiry">${netlifyForm ? '\n      <input type="hidden" name="form-name" value="inquiry">' : ''}
      <p class="form-legal">Fields marked <span class="req">*</span> are required. We use your details only to respond to your inquiry. See our <a href="/privacy/">privacy policy</a>.</p>
      <button class="btn btn-primary btn-lg" type="submit">Send inquiry</button>
      <div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
    </form>
    <aside class="contact-aside">
      <h2 class="h3">What happens next</h2>
      <ol class="mini-steps">
        <li>We review your requirement and check availability with our producing partners.</li>
        <li>We reply by email with options or any questions about your specification.</li>
        <li>Once the details are clear, you receive a written quotation based on pre-agreed terms.</li>
      </ol>
      <h2 class="h3">Talk to us directly</h2>
      <ul class="contact-list">
        <li>${icon('phone')}<a href="${telHref}">${site.phone}</a></li>
        <li>${icon('whatsapp')}<a href="${waHref()}" target="_blank" rel="noopener">Chat on WhatsApp</a></li>
        ${site.email ? `<li>${icon('mail')}<a href="mailto:${site.email}">${site.email}</a></li>` : ''}
      </ul>
      <h2 class="h3">Our office</h2>
      <ul class="contact-list">
        <li>${icon('pin')}<span>${esc(site.legalName)}<br>${site.addressLines.join('<br>')}</span></li>
      </ul>
      <p><a class="link" href="${site.mapsUrl}" target="_blank" rel="noopener">View on Google Maps ${icon('arrow')}</a></p>
      <p class="small">Our team works on India Standard Time (UTC+5:30).</p>
      <p class="notice">${icon('check')}<span>ZAPAX GLOBAL only uses the phone number above${site.emailDomain ? ` and <strong>@${site.emailDomain}</strong> email addresses` : ''}. Bank details are never changed by email or chat. <a href="/trade-terms/">How we prevent fraud</a></span></p>
    </aside>
  </div>
</section>
`,
};

// ---------- Trade terms & fraud prevention ----------
const tradeTermsPage = {
  path: '/trade-terms/',
  title: 'Trade Terms and Fraud Prevention',
  description: 'Every ZAPAX GLOBAL deal follows pre-agreed written terms. How we protect buyers and our business from fraud, and how to verify genuine ZAPAX GLOBAL communication.',
  trail: [home, ['/export/', 'Export'], ['/trade-terms/', 'Trade terms and fraud prevention']],
  body: `
${hero({ h1: 'Every deal on agreed terms, in writing', lead: 'International trade only works when both sides can trust each other. That is why every ZAPAX GLOBAL deal, first or repeat, large or small, in any product category, follows the same pre-agreed written terms. They protect you, protect us, and keep the relationship strong for the long term.' })}
<section class="section">
  <div class="wrap split">
    <div><h2>Agreed before any order</h2><p>No order is confirmed until both parties have accepted these points in writing, in the proforma invoice or sales contract.</p></div>
    <div>${list([
      'Product, specification sheet and approved sample, where applicable',
      'Quantity, packing, labelling and marking',
      'Price, currency and Incoterms® rule',
      'Payment terms and the bank account in the company’s name',
      'Dispatch window, documents and any inspection',
      'How quality claims and disputes will be handled',
    ])}</div>
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <h2>The same terms for every shipment and category</h2>
    <div class="prose">
      <p>We do not relax our process for a familiar buyer or tighten it for a new one. The terms that protect a first trial order also apply to the hundredth container, and to every product we supply, today and as our range grows.</p>
      <p>Consistency is how trust is built over years rather than one shipment at a time.</p>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${head('How to recognise genuine ZAPAX GLOBAL communication', 'Fraudsters sometimes impersonate exporters. These checks protect you.')}
    ${features([
      ['phone', 'Official phone and WhatsApp', `We contact you from <a href="${telHref}">${site.phone}</a>. If someone claims to represent ZAPAX GLOBAL from another number, verify with us on this number first.`],
      ['mail', 'Official email', site.emailDomain ? `Our team writes only from <strong>@${site.emailDomain}</strong> addresses. Treat look-alike domains or free email accounts as suspicious.` : 'Our team writes only from our official company email domain. Treat look-alike domains or free email accounts as suspicious.'],
      ['doc', 'Bank details never change by message', 'Our bank account is in the company’s name and appears on the official proforma invoice. We never change bank details by email or chat. If you receive such a request, call us before paying.'],
      ['doc', 'Registered company', `Payments go only to ${esc(site.legalName)}. You can check our registrations on the <a href="/company-registrations/">company registrations page</a>.`],
      ['check', 'Written confirmation', 'Every price, specification and payment instruction is confirmed in writing in the proforma invoice or contract, never only by voice or chat.'],
    ])}
  </div>
</section>
<section class="section tint">
  <div class="wrap split">
    <h2>What we ask from buyers</h2>
    <div class="prose">
      <p>To protect both sides, before confirming a first order we may ask for your company name and registration details, import licence or registration where your country requires one, an official business email address, and the delivery address and port.</p>
      <p>Payment terms are agreed for each contract. Common international options include advance payment, letter of credit (LC) and documents against payment (D/P).</p>
      <p>If you ever suspect that someone is misusing the ZAPAX GLOBAL name, contact us on <a href="${telHref}">${site.phone}</a> or through our <a href="/contact/">contact page</a>.</p>
    </div>
  </div>
</section>
${cta('Start a relationship built on clear terms')}
`,
};

// ---------- Vision ----------
const visionPage = {
  path: '/vision/',
  title: 'Our Vision | Exporting the Best of India to the World',
  description: 'The vision and mission of ZAPAX GLOBAL: starting with dehydrated food products and growing into a wide range of products from India, built on trust.',
  trail: [home, ['/vision/', 'Our vision']],
  body: `
${hero({ kicker: 'Our vision', h1: 'Carrying the best of India to the world, on trust', lead: site.vision })}
<section class="section">
  <div class="wrap split">
    <h2>Our mission</h2>
    <div class="prose"><p class="statement-sm">${site.mission}</p></div>
  </div>
</section>
<section class="section tint">
  <div class="wrap">
    ${head('Starting focused, built to grow', 'We are not a company of one category. Dehydrated food products are where we begin.')}
    <div class="split">
      <div><h3>Where we are today</h3><p>We export ${productNames}, in the forms and specifications our buyers need, with every detail agreed in writing.</p><p><a class="link" href="/products/">See our current range ${icon('arrow')}</a></p></div>
      <div><h3>Where we are going</h3><p>India makes and grows an extraordinary range of products. Our plan is to bring more and more of them to buyers around the world, across many categories, through the same partner network and the same written terms.</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${head('How we will grow', 'Growth only matters if trust grows with it.')}
    ${features([
      ['search', 'One category at a time', 'We add a new product only when we have found producing partners who can supply it reliably and to specification.'],
      ['doc', 'The same written terms', 'Every new product follows the same pre-agreed terms that protect our buyers today.'],
      ['check', 'Quality before volume', 'We would rather grow slowly and keep our promises than grow quickly and break them.'],
      ['globe', 'Led by buyer needs', 'Many new products start with a buyer asking us to source them. Tell us what you need from India.'],
    ])}
  </div>
</section>
<section class="section dark">
  <div class="wrap split">
    <h2>Where trust travels.</h2>
    <div class="prose">
      <p>Our slogan is our promise. Every shipment carries more than goods: it carries the trust you placed in us when you agreed the terms.</p>
      <p>We protect that trust with clear specifications, honest answers, registered and verifiable company details, and communication you can rely on, from the first inquiry to the moment your goods arrive.</p>
    </div>
  </div>
</section>
${cta('Tell us what you want to source from India', 'Whether it is in our current range or something new, share your requirement and we will give you an honest answer.')}
`,
};

// ---------- Company registrations ----------
const registrationsPage = {
  path: '/company-registrations/',
  title: 'Company Registrations and Export Licences',
  description: `Registrations and export licences of ${site.legalName}, a registered LLP in Gujarat, India, with links to verify each one on official government portals.`,
  trail: [home, ['/about/', 'About'], ['/company-registrations/', 'Company registrations']],
  body: `
${hero({ kicker: 'Trust and compliance', h1: 'Registered, licensed and verifiable', lead: `${esc(site.legalName)} is a limited liability partnership registered in India. These are the registrations that allow us to trade and export, with links to the official portals where you can check them independently.` })}
<section class="section">
  <div class="wrap">
    ${head("Our registrations", "Each entry links to the government portal that issued it, so you can confirm it without relying on us.")}
    ${regCards(regs)}
    <p class="notice">${icon('check')}<span>Need copies for your supplier onboarding? Ask through our <a href="/contact/">contact page</a> or call <a href="${telHref}">${site.phone}</a>. Copies are sent only from our official email and phone.</span></p>
  </div>
</section>
${cta('Work with a registered export partner')}
`,
};

// ---------- Legal ----------
const updated = 'November 2026';
const privacyPage = {
  path: '/privacy/',
  title: 'Privacy Policy',
  description: 'How ZAPAX GLOBAL collects, uses and protects personal information submitted through this website.',
  trail: [home, ['/privacy/', 'Privacy policy']],
  body: `
${hero({ h1: 'Privacy policy', lead: `Last updated ${updated}. This policy explains what personal information we collect through this website and how we use it.` })}
<section class="section"><div class="wrap prose prose-wide">
  <h2>Who we are</h2>
  <p>This website is operated by ${esc(site.legalName)}, based in ${site.region}, India. References to “we” or “us” mean ${site.brand}.</p>
  <h2>Information we collect</h2>
  <p>When you submit our inquiry form, we collect the details you provide: your name, company, business email address, country, phone or WhatsApp number, the product you are interested in, quantity, destination port and your message. We do not ask for sensitive personal information, and please do not include it.</p>
  <p>Like most websites, our hosting provider may automatically record technical information such as IP address, browser type and pages visited, for security and to keep the site running.</p>
  <h2>How we use your information</h2>
  <p>We use inquiry details to respond to you, prepare quotations, and manage any business relationship that follows. We do not sell your personal information or use it for unrelated marketing without your consent.</p>
  <h2>Service providers</h2>
  <p>When you send an inquiry, it is delivered to our business email through an email delivery service, and the same service sends you an automatic confirmation containing a copy of your inquiry. Our website host and email providers process data on our behalf and may store it outside your country. We choose providers that use appropriate security measures.</p>
  <h2>Cookies and analytics</h2>
  <p>This website does not use advertising cookies. If we enable website analytics, it will be used to understand how visitors use the site, and we will update this policy to describe it.</p>
  <h2>How long we keep information</h2>
  <p>We keep inquiry information for as long as needed to respond and to maintain our business records, and then delete it or keep it securely as required by law.</p>
  <h2>Your rights</h2>
  <p>You may ask to see, correct or delete the personal information we hold about you, or object to how we use it, subject to applicable law. To make a request, contact us through our <a href="/contact/">contact page</a>.</p>
  <h2>Changes to this policy</h2>
  <p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>
</div></section>`,
};

const termsPage = {
  path: '/terms/',
  title: 'Terms of Use',
  description: 'The terms that apply to using the ZAPAX GLOBAL website, including the status of product information and intellectual property.',
  trail: [home, ['/terms/', 'Terms of use']],
  body: `
${hero({ h1: 'Terms of use', lead: `Last updated ${updated}. By using this website you agree to these terms.` })}
<section class="section"><div class="wrap prose prose-wide">
  <h2>About this website</h2>
  <p>This website is operated by ${esc(site.legalName)}, ${site.region}, India. It provides general information about our products and services for business buyers.</p>
  <h2>Product information</h2>
  <p>Product descriptions, forms, reference sizes and packaging information on this website are for general guidance only. They are not an offer to sell and do not form part of any contract. Availability, specifications, prices and terms are confirmed in writing for each order, and the quotation and sales contract for that order take precedence over anything on this website.</p>
  <h2>Inquiries and orders</h2>
  <p>Submitting an inquiry does not create a contract. A contract exists only when both parties have agreed and confirmed the order terms in writing. How ZAPAX GLOBAL agrees and protects every deal is described in our <a href="/trade-terms/">trade terms and fraud prevention</a> page.</p>
  <h2>Intellectual property</h2>
  <p>The content, text, illustrations and design of this website belong to ${esc(site.legalName)} unless stated otherwise. You may view and print pages for your own business use, but you may not copy or republish content without our written permission. The ZAPAX GLOBAL name and logo are our brand identifiers.</p>
  <h2>Links</h2>
  <p>Links to other websites are provided for convenience. We are not responsible for the content of those websites.</p>
  <h2>Liability</h2>
  <p>We take care to keep the information on this website accurate, but we do not guarantee that it is complete or current. To the extent permitted by law, we are not liable for any loss arising from reliance on general website information.</p>
  <h2>Governing law</h2>
  <p>These terms are governed by the laws of India.</p>
  <h2>Contact</h2>
  <p>Questions about these terms can be sent through our <a href="/contact/">contact page</a>.</p>
</div></section>`,
};

const notFound = {
  path: '/404',
  title: 'Page not found',
  description: 'The page you were looking for could not be found. Browse ZAPAX GLOBAL products or contact our export team in Gujarat, India.',
  noindex: true,
  body: `
${hero({ h1: 'This page could not be found', lead: 'The link may be out of date, or the page may have moved. These pages may help.', actions: `<a class="btn btn-primary" href="/">Go to the homepage</a><a class="btn btn-ghost" href="/products/">Browse products</a><a class="btn btn-ghost" href="/contact/">Contact us</a>` })}`,
};

export const pages = [
  homePage, aboutPage, productsPage, ...productPages, qualityPage, exportPage, packagingPage, documentationPage, shippingPage,
  tradeTermsPage, registrationsPage, visionPage, sustainabilityPage, faqPage, contactPage, privacyPage, termsPage, notFound,
];

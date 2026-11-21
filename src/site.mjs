// Company facts and product catalog. This is the single source of truth for the site.
// Confirmed by ZAPAX ENTERPRISE: founders, address, phone/WhatsApp. Domain and email domain come from environment variables.

// Deployment settings come from environment variables (.env locally, host dashboard in production).
// See .env.example for documentation. Empty values are hidden on the site, never shown as fake links.
const env = (k, d = '') => (process.env[k] || d).trim(); // empty values fall back to the default

// No default production domain: the previously assumed zapax.com is a parked domain owned by a third party.
// SITE_URL wins; on Netlify without it, the site's primary URL (`URL`, e.g. https://name.netlify.app, or the custom
// domain once it is set as primary) is used; local builds use localhost.
const onNetlify = process.env.NETLIFY === 'true';
function siteUrl() {
  const raw = (env('SITE_URL') || (onNetlify && env('URL')) || 'http://localhost:8080').replace(/\/+$/, '');
  const u = new URL(raw); // throws on malformed values
  if (u.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(u.hostname)) throw new Error(`SITE_URL must use https:// (got ${raw})`);
  if (u.pathname !== '/' || u.search || u.hash) throw new Error(`SITE_URL must be the bare origin, e.g. https://www.example.com (got ${raw})`);
  return u.origin;
}

// Mailboxes live on the company's own domain: EMAIL_DOMAIN, or the SITE_URL host without "www.".
const emailDomain = env('EMAIL_DOMAIN') || (process.env.SITE_URL ? new URL(siteUrl()).hostname.replace(/^www\./, '') : 'zapaxenterprise.com');
const mailbox = (local) => (emailDomain ? `${local}@${emailDomain}` : '');

export const site = {
  brand: 'ZAPAX ENTERPRISE',
  slogan: 'Where trust travels.',
  legalName: env('LEGAL_NAME', 'ZAPAX ENTERPRISE LLP'),
  domain: siteUrl(),
  domainConfirmed: !!process.env.SITE_URL,
  emailDomain,
  email: env('CONTACT_EMAIL') || mailbox('info'),
  // Department mailboxes shown on the contact page and footer.
  // [label, address, short label for the footer]
  emails: [['Export inquiries', mailbox('exports'), 'Exports'], ['Sales', mailbox('sales'), 'Sales'], ['General information', mailbox('info'), 'Info'], ['Directors', mailbox('directors'), 'Directors']].filter(([, e]) => e),
  phone: env('CONTACT_PHONE', '+91 99980 50731'),
  whatsapp: env('WHATSAPP_NUMBER', '919998050731').replace(/\D/g, ''),
  // Built-in inquiry backend (server/): emails the team and sends the buyer a confirmation. Override with any form service URL.
  // 'netlify' = Netlify Forms (submissions in the Netlify dashboard + email notifications), used automatically on Netlify
  // until RESEND_API_KEY is set. ponytail: no buyer auto-confirmation in that mode; set the Resend variables to enable it.
  formEndpoint: env('FORM_ENDPOINT', onNetlify && !process.env.RESEND_API_KEY ? 'netlify' : '/api/inquiry'),
  gaMeasurementId: env('GA_MEASUREMENT_ID'),
  googleSiteVerification: env('GOOGLE_SITE_VERIFICATION'),
  founders: ['Chetan Punani', 'Keval Chauhan'],
  people: [
    { name: 'Chetan Punani', role: 'Co-Founder', email: mailbox('chetan'), slug: 'chetan-punani' },
    { name: 'Keval Chauhan', role: 'Co-Founder', email: mailbox('keval'), slug: 'keval-chauhan' },
  ],
  street: 'Opposite Old Ice Factory, Near Lake, Baleviya Kotha Road',
  addressLines: ['Opposite Old Ice Factory, Near Lake,', 'Baleviya Kotha Road,', 'Limbdi 363421, Gujarat, India'],
  postalCode: '363421',
  locality: 'Limbdi',
  region: 'Gujarat',
  country: 'India',
  // Exact office location confirmed by ZAPAX ENTERPRISE.
  geo: { lat: 22.568383, lng: 71.812215 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=22.568383%2C71.812215',
  // Official profiles only, e.g. [{ name: 'LinkedIn', url: 'https://www.linkedin.com/company/...' }]
  social: [],
  // Registrations shown on /company-registrations/ and the home page. Only entries with a `number` are shown
  // (the LLP entry always shows, as the registration itself is confirmed). Never enter a number that is not on the certificate.
  // Optional `file`: put a scan in public/legal/ (e.g. '/legal/iec-certificate.pdf'); hide signatures and personal PAN/Aadhaar first.
  registrations: [
    { name: 'LLP Certificate of Incorporation', authority: 'Ministry of Corporate Affairs, Government of India', label: 'LLPIN', number: '', file: '', verify: 'https://www.mca.gov.in', always: true, note: 'Registered under the Limited Liability Partnership Act, 2008.' },
    { name: 'GST Registration', authority: 'Goods and Services Tax Network, Government of India', label: 'GSTIN', number: '', file: '', verify: 'https://services.gst.gov.in/services/searchtp' },
    { name: 'Importer-Exporter Code (IEC)', authority: 'Directorate General of Foreign Trade, Ministry of Commerce and Industry', label: 'IEC', number: '', file: '', verify: 'https://www.dgft.gov.in' },
    { name: 'APEDA Registration-cum-Membership Certificate', authority: 'Agricultural and Processed Food Products Export Development Authority', label: 'RCMC No.', number: '', file: '', verify: 'https://apeda.gov.in' },
    { name: 'Spices Board Certificate of Registration as Exporter', authority: 'Spices Board India, Ministry of Commerce and Industry', label: 'CRES No.', number: '', file: '', verify: 'https://www.indianspices.com' },
    { name: 'FSSAI Licence', authority: 'Food Safety and Standards Authority of India', label: 'Licence No.', number: '', file: '', verify: 'https://foscos.fssai.gov.in' },
    { name: 'Udyam Registration (MSME)', authority: 'Ministry of Micro, Small and Medium Enterprises', label: 'Udyam No.', number: '', file: '', verify: 'https://udyamregistration.gov.in' },
  ],
  vision:
    'Build a globally respected Indian export enterprise that connects the richness of India’s products with international markets through quality, integrity, innovation and trusted relationships.',
  mission:
    'Deliver carefully sourced products and dependable export solutions while maintaining a strong commitment to quality, transparent communication, customer satisfaction and long-term partnerships.',
};
export const fullAddress = `${site.street}, ${site.locality} ${site.postalCode}, ${site.region}, ${site.country}`;
export const telHref = `tel:${site.phone.replace(/[^\d+]/g, '')}`;
export const waHref = (text = 'Hello ZAPAX ENTERPRISE, I would like to discuss an export inquiry.') => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

// Reference size bands commonly used in the dehydrated-vegetable trade. Shown as reference only.
export const sizeGuide = [
  ['Kibbled / flakes', 'Larger pieces, typically above 5 mm'],
  ['Chopped', 'Around 3–5 mm'],
  ['Minced', 'Around 1–3 mm'],
  ['Granules', 'Commonly 8–20, 20–40 or 40–80 mesh'],
  ['Powder', 'Commonly 60–120 mesh'],
];

// Parameters listed on a product specification sheet. Values are agreed per order, never published as generic numbers.
const dehydratedParams = [
  ['Moisture content', 'Maximum % agreed per product and form'],
  ['Particle size', 'Cut size in mm or mesh range for your application'],
  ['Colour and appearance', 'Described against an approved reference sample'],
  ['Flavour and aroma', 'Typical of the product, free from off-notes'],
  ['Foreign matter', 'Limit agreed and checked before packing'],
  ['Total and acid-insoluble ash', 'Limits stated on the specification sheet'],
  ['Microbiology', 'Total plate count, yeast and mould, coliforms, E. coli and Salmonella limits as required by your market'],
  ['Shelf life', 'Stated on the specification sheet for the agreed packing'],
];

const dehydratedStorage =
  'Store sealed in a cool, dry, odour-free place away from direct sunlight. Dehydrated products absorb moisture from the air, so reseal opened packs promptly. Exact storage conditions and shelf life are stated on the specification sheet for each order.';

const dehydratedPacking = [
  ['Poly-lined corrugated cartons', 'Commonly requested net weights include 10 kg, 20 kg and 25 kg, subject to product and agreement.'],
  ['Aluminium foil vacuum bags', 'Available to discuss for products and markets that need extra moisture and aroma protection.'],
  ['Retail stand-up pouches', 'Can be explored where the product, labelling requirements and order size allow.'],
];

export const products = [
  {
    slug: 'dehydrated-onion',
    group: 'Dehydrated',
    name: 'Dehydrated Onion',
    art: 'onion',
    title: 'Dehydrated Onion Exporter | Flakes to Powder',
    description:
      'Dehydrated white and red onion from India: kibbled, chopped, minced, granules and powder. Specifications and packing agreed with ZAPAX ENTERPRISE before every order.',
    h1: 'Dehydrated onion from India, from flakes to powder',
    summary: 'White, red and golden fried onion in every common cut, from kibbled flakes to fine powder.',
    intro: [
      'Onion is the backbone of savoury food manufacturing, and dehydrated onion gives processors that flavour in a stable, lightweight form that is easy to store and dose. Gujarat, where ZAPAX ENTERPRISE is based, is one of India’s main centres of onion dehydration.',
      'We work with producing partners to supply white, red and fried or toasted (golden) dehydrated onion in the cut and mesh your recipe needs, with the specification agreed in writing before you place an order.',
    ],
    varieties: ['White onion', 'Red onion', 'Fried and toasted (golden) onion'],
    forms: [
      ['flakes', 'Kibbled / flakes'],
      ['chopped', 'Chopped'],
      ['minced', 'Minced'],
      ['granules', 'Granules'],
      ['powder', 'Powder'],
      ['crushed', 'Fried / toasted'],
    ],
    photos: [
      ['onion-white-range', 'Dehydrated white onion range: flakes, chopped, minced, granules and powder', 'White onion: flakes, chopped, minced, granules, powder'],
      ['onion-red-range', 'Dehydrated red onion range: flakes, chopped, minced, granules and powder', 'Red onion: flakes, chopped, minced, granules, powder'],
      ['onion-golden-range', 'Golden onion range: fried onion, toasted chopped, toasted minced, toasted granules and roasted powder', 'Golden onion: fried, toasted chopped, minced, granules, roasted powder'],
    ],
    applications: ['Seasoning and spice blends', 'Soups, sauces and gravies', 'Ready meals and instant noodles', 'Snack coatings', 'Meat and plant-based processing', 'Dressings and dips'],
    params: dehydratedParams,
    packing: dehydratedPacking,
    storage: dehydratedStorage,
    suitability:
      'Dehydrated onion travels well by sea in dry containers. Because most of the water has been removed, it ships at a fraction of the weight of fresh onion and does not need refrigeration.',
    faq: [
      ['What is the difference between white and red dehydrated onion?', 'White onion gives a clean, sharp flavour and a pale colour that suits sauces and seasoning. Red onion has a pinkish colour and slightly sweeter notes. Tell us your application and we will suggest which to sample.'],
      ['Can you supply a specific mesh size?', 'Yes, state the mesh range or cut size you need in your inquiry. We confirm whether it is available from our producing partners before quoting.'],
    ],
  },
  {
    slug: 'dehydrated-garlic',
    group: 'Dehydrated',
    name: 'Dehydrated Garlic',
    art: 'garlic',
    title: 'Dehydrated Garlic Exporter | Flakes to Powder',
    description:
      'Dehydrated garlic from India as cloves, chopped, minced, granules and pure powder. Specifications, packing and export documents coordinated by ZAPAX ENTERPRISE.',
    h1: 'Dehydrated garlic for seasoning and food manufacturing',
    summary: 'Flakes, chopped, minced, granules and pure garlic powder.',
    intro: [
      'Dehydrated garlic gives food manufacturers a consistent, measurable garlic flavour without the peeling, waste and short shelf life of fresh bulbs.',
      'ZAPAX ENTERPRISE coordinates supply from producing partners in the forms below. Each order starts with a written specification covering cut size, moisture, colour and microbiological limits.',
    ],
    varieties: ['White garlic'],
    photos: [['garlic-range', 'Dehydrated garlic range: flakes, chopped, minced, granules and powder', 'Garlic: flakes, chopped, minced, granules, powder']],
    forms: [
      ['flakes', 'Flakes'],
      ['chopped', 'Chopped'],
      ['minced', 'Minced'],
      ['granules', 'Granules'],
      ['powder', 'Pure powder'],
    ],
    applications: ['Seasoning blends and rubs', 'Garlic bread and bakery', 'Sauces, marinades and pickles', 'Snack seasoning', 'Meat processing', 'Instant soups'],
    params: dehydratedParams,
    packing: dehydratedPacking,
    storage: dehydratedStorage,
    suitability:
      'Like onion, dehydrated garlic is shelf stable, ships in dry containers and holds its flavour well when packed in moisture-resistant liners.',
    faq: [
      ['Is your garlic powder pure or blended?', 'Our listed garlic powder is pure garlic. If you need a free-flowing or blended product, tell us the requirement and we will check what our partners can offer.'],
      ['Which garlic form suits seasoning blends?', 'Granules and powder blend evenly in dry seasonings. Minced and chopped garlic give visible pieces in sauces and toppings.'],
    ],
  },
  {
    slug: 'black-garlic',
    group: 'Other',
    name: 'Black Garlic',
    art: 'blackgarlic',
    title: 'Black Garlic Exporter | Bulbs, Cloves, Powder',
    description:
      'Black garlic from India: whole and solo bulbs, peeled cloves, paste and powder for gourmet, food service and health food brands. Specifications agreed per order.',
    h1: 'Black garlic: bulbs, peeled cloves, paste and powder',
    summary: 'Slow-aged garlic with a sweet, mellow flavour, as bulbs, peeled cloves, paste or powder.',
    photos: [['black-garlic-range', 'Black garlic range: whole bulb, solo bulb, peeled cloves, paste and powder', 'Black garlic: whole bulb, solo bulb, peeled cloves, paste, powder']],
    intro: [
      'Black garlic is made by slowly ageing whole garlic bulbs under controlled heat and humidity over several weeks. The cloves turn black and soft, and the sharp bite of raw garlic gives way to a sweet, mellow, balsamic-like flavour that chefs and food brands value.',
      'ZAPAX ENTERPRISE coordinates black garlic supply through producing partners. The ageing process, moisture, texture and packing are confirmed on a written specification before you place an order.',
    ],
    varieties: ['Multi-clove black garlic', 'Single-clove (solo) black garlic'],
    forms: [
      ['whole', 'Whole bulbs'],
      ['whole', 'Solo (single-clove) bulbs'],
      ['clove', 'Peeled cloves'],
      ['powder', 'Paste'],
      ['powder', 'Powder'],
    ],
    applications: ['Gourmet sauces, dressings and dips', 'Seasoning blends and rubs', 'Ready meals and food service', 'Snacks and bakery', 'Health food and wellness products', 'Retail and gift packs'],
    params: [['Ageing process', 'Ageing period and conditions stated on the specification sheet'], ...dehydratedParams],
    packing: [
      ['Vacuum-sealed bags', 'Commonly used for peeled cloves to protect texture and flavour.'],
      ...dehydratedPacking,
    ],
    storage:
      'Store in a cool, dry place away from direct sunlight. Peeled cloves keep best vacuum-sealed, and opened packs should be resealed promptly. Exact storage conditions and shelf life are stated on the specification sheet for each order.',
    suitability:
      'Black garlic is shelf stable without refrigeration when properly packed, so whole bulbs, vacuum-packed cloves and powder all ship by sea in dry containers.',
    faq: [
      ['How is black garlic different from dehydrated garlic?', 'Dehydrated garlic is dried quickly and keeps a sharp garlic flavour. Black garlic is aged slowly over weeks, which makes it soft, dark and sweet, with a mellow taste suited to gourmet and health food products.'],
      ['Which black garlic form should I choose?', 'Whole bulbs suit retail and gift packs, peeled cloves suit food service and ready meals, and powder blends easily into seasonings and sauces. Tell us your application and we will suggest which to sample.'],
    ],
  },
  {
    slug: 'dehydrated-ginger',
    group: 'Dehydrated',
    name: 'Dehydrated Ginger',
    art: 'ginger',
    title: 'Dehydrated Ginger Exporter | Slices to Powder',
    description:
      'Dried whole ginger, slices, flakes, granules and powder from India for food, beverage and seasoning use. Specifications confirmed per order.',
    h1: 'Dried ginger: whole, slices, flakes, granules and powder',
    summary: 'Whole dried ginger, slices, flakes, granules and powder.',
    intro: [
      'India is one of the world’s largest ginger producers, and dried ginger is a staple in spice blends, bakery, beverages and traditional remedies around the world.',
      'ZAPAX ENTERPRISE supplies dried ginger through producing partners in the forms below. We agree parameters such as moisture, volatile oil content and particle size with you before an order is confirmed.',
    ],
    varieties: ['Dried ginger'],
    photos: [['ginger-range', 'Dehydrated ginger range: slices, flakes, granules, whole dried and powder', 'Ginger: slices, flakes, granules, whole dried, powder']],
    forms: [
      ['whole', 'Whole dried'],
      ['slices', 'Slices'],
      ['flakes', 'Flakes'],
      ['granules', 'Granules'],
      ['powder', 'Powder'],
    ],
    applications: ['Spice blends and curry powders', 'Tea and beverage blends', 'Bakery and confectionery', 'Sauces and marinades', 'Health food products'],
    params: [...dehydratedParams.slice(0, 4), ['Volatile oil content', 'Minimum value agreed where your application requires it'], ...dehydratedParams.slice(4)],
    packing: dehydratedPacking,
    storage: dehydratedStorage,
    suitability:
      'Dried ginger is stable at ambient temperature and suited to sea freight in dry containers when packed to protect against moisture.',
    faq: [
      ['Can you supply ginger for tea blends?', 'Yes. Crushed bits are commonly used in tea and infusion blends. Share your preferred piece size and we will confirm availability.'],
    ],
  },
  {
    slug: 'dehydrated-vegetables',
    group: 'Dehydrated',
    name: 'Dehydrated Vegetables',
    art: 'vegetables',
    title: 'Dehydrated Vegetables Exporter | Pieces, Powder',
    description:
      'Dehydrated vegetables from India: tomato, carrot, beetroot, green chilli, spinach, okra, cabbage and more, as flakes, dices and powder for food makers.',
    h1: 'Dehydrated vegetables for soups, snacks and seasoning',
    summary: 'Tomato, carrot, beetroot, chilli, spinach, okra and more as dehydrated pieces or powder.',
    intro: [
      'Dehydrated vegetables add colour, flavour and nutrition to products that need a long shelf life, from instant soups to snack seasonings. Every vegetable we supply is dehydrated, ready to store and ship.',
      'ZAPAX ENTERPRISE currently coordinates the vegetables below in the forms that suit each one. If you need a vegetable that is not listed, ask us. Our range is growing with our partner network.',
    ],
    varieties: ['Tomato', 'Carrot', 'Beetroot', 'Green chilli', 'Spinach', 'Cabbage', 'Bell pepper', 'Bitter gourd', 'Pumpkin', 'Curry leaf', 'Mint', 'Okra', 'Mixed vegetables'],
    photos: [
      ['veg-pieces-range', 'Dehydrated vegetable pieces: tomato, carrot, beetroot, green chilli, spinach, cabbage, bell pepper, bitter gourd and mixed vegetables', 'Vegetable pieces: tomato, carrot, beetroot, green chilli, spinach, cabbage, bell pepper, bitter gourd, mixed'],
      ['veg-powders-range', 'Dehydrated vegetable powders: tomato, beetroot, carrot, spinach, green chilli, pumpkin, curry leaf, mint and cabbage', 'Vegetable powders: tomato, beetroot, carrot, spinach, green chilli, pumpkin, curry leaf, mint, cabbage'],
      ['okra-range', 'Dehydrated okra range: rings, chopped, whole pods and powder', 'Okra: rings, chopped, whole pods, powder'],
    ],
    forms: [
      ['flakes', 'Flakes and pieces'],
      ['cubes', 'Dices'],
      ['slices', 'Rings and slices'],
      ['powder', 'Powder'],
    ],
    applications: ['Instant soups and noodles', 'Snack and chip seasoning', 'Ready-to-cook mixes', 'Sauces and pastes', 'Bakery and pasta colouring'],
    params: dehydratedParams,
    packing: dehydratedPacking,
    storage: dehydratedStorage,
    suitability:
      'Dried vegetables ship in dry containers. Powders such as tomato and spinach attract moisture, so foil or multi-layer liners are often the better choice.',
    faq: [
      ['Can I order several vegetables in one shipment?', 'Mixed loads can be discussed. Tell us the products and quantities and we will check how they can be combined.'],
    ],
  },
  {
    slug: 'dehydrated-fruits',
    group: 'Dehydrated',
    name: 'Dehydrated Fruits',
    art: 'driedfruit',
    title: 'Dehydrated Fruit Pieces and Powders from India',
    description:
      'Dehydrated mango, banana, papaya, pineapple, amla, jackfruit, lemon, strawberry and orange peel from India, as pieces and powders for food makers.',
    h1: 'Dehydrated fruit pieces and fruit powders',
    summary: 'Mango, banana, papaya, pineapple, amla, lemon, strawberry and more as dehydrated pieces or powder.',
    intro: [
      'Fruit powders and dried pieces bring natural fruit flavour and colour to beverages, dairy, bakery and confectionery without the handling challenges of fresh fruit. Every fruit we supply is dehydrated, ready to store and ship.',
      'ZAPAX ENTERPRISE coordinates air-dried, spray-dried and freeze-dried options through producing partners. The drying method, carrier content and particle size are confirmed for each product before you order.',
    ],
    varieties: ['Mango', 'Banana', 'Papaya', 'Pineapple', 'Amla (Indian gooseberry)', 'Jackfruit', 'Lemon', 'Strawberry', 'Orange peel'],
    photos: [
      ['fruit-pieces-range', 'Dehydrated fruit pieces: mango, banana, papaya, pineapple, amla, jackfruit, lemon, strawberry and orange peel', 'Fruit pieces: mango, banana, papaya, pineapple, amla, jackfruit, lemon, strawberry, orange peel'],
      ['fruit-powders-range', 'Dehydrated fruit powders: mango, banana, amla, lemon, strawberry and orange peel', 'Fruit powders: mango, banana, amla, lemon, strawberry, orange peel'],
    ],
    forms: [
      ['slices', 'Slices and rings'],
      ['chunks', 'Dried pieces'],
      ['powder', 'Spray-dried powder'],
      ['powder', 'Freeze-dried powder'],
    ],
    applications: ['Beverage and smoothie mixes', 'Dairy and ice cream', 'Bakery fillings', 'Confectionery', 'Breakfast cereals'],
    params: [...dehydratedParams.slice(0, 2), ['Drying method and carrier', 'Spray-dried or freeze-dried, with any carrier stated on the specification'], ...dehydratedParams.slice(2)],
    packing: dehydratedPacking,
    storage: dehydratedStorage,
    suitability:
      'Fruit powders are sensitive to humidity. They are usually packed in foil or multi-layer bags inside cartons and shipped in dry containers.',
    faq: [
      ['What is the difference between spray-dried and freeze-dried powder?', 'Spray-dried powder is economical and usually includes a carrier such as maltodextrin. Freeze-dried powder keeps more of the original flavour and colour and costs more. We confirm the exact composition before you order.'],
    ],
  },
  {
    slug: 'dehydrated-potato',
    group: 'Dehydrated',
    name: 'Dehydrated Potato',
    art: 'potato',
    title: 'Dehydrated Potato Exporter | Flakes, Dices, Powder',
    description:
      'Dehydrated potato from India as flakes, dices, slices, granules and powder for snacks, ready meals and food manufacturing. Specifications agreed per order.',
    h1: 'Dehydrated potato: flakes, dices, slices, granules and powder',
    summary: 'Potato flakes, dices, slices, granules and powder.',
    intro: [
      'Dehydrated potato gives food manufacturers a consistent, shelf-stable potato base for snacks, instant mash, soups and ready meals, without the storage losses of fresh potatoes.',
      'ZAPAX ENTERPRISE coordinates dehydrated potato through producing partners in India. Cut size, moisture, colour and sulphite requirements are agreed on a written specification before you order.',
    ],
    varieties: ['Potato'],
    photos: [['potato-range', 'Dehydrated potato range: flakes, dices, slices, granules, powder and starch', 'Potato: flakes, dices, slices, granules, powder, starch']],
    forms: [
      ['flakes', 'Flakes'],
      ['cubes', 'Dices'],
      ['slices', 'Slices'],
      ['granules', 'Granules'],
      ['powder', 'Powder'],
    ],
    applications: ['Instant mashed potato', 'Snacks, chips and extruded products', 'Soups and ready meals', 'Bakery and batters', 'Seasoning bases'],
    params: [...dehydratedParams.slice(0, 4), ['Sulphite (SO₂)', 'Treated or untreated, with any limit stated on the specification'], ...dehydratedParams.slice(4)],
    packing: dehydratedPacking,
    storage: dehydratedStorage,
    suitability: 'Dehydrated potato is shelf stable and ships by sea in dry containers. Flakes and powder are packed in lined bags to protect against moisture.',
    faq: [['Which potato form suits instant mash?', 'Flakes and granules are the usual choice for instant mashed potato. Dices and slices suit soups, ready meals and snacks. Tell us your application and we will suggest which to sample.']],
  },
  {
    slug: 'moringa',
    group: 'Other',
    name: 'Moringa',
    art: 'moringa',
    title: 'Moringa Exporter | Leaves, Tea Cut, Powder, Seeds',
    description:
      'Moringa from India: dried leaves, tea cut, leaf powder, seeds and kernels for health food, tea and supplement brands. Specifications agreed per order.',
    h1: 'Moringa: dried leaves, tea cut, powder, seeds and kernels',
    summary: 'Dried whole leaves, tea cut, leaf powder, seeds and kernels.',
    intro: [
      'Moringa (Moringa oleifera) is grown widely across India, and its dried leaves and leaf powder are valued by health food, tea and supplement brands around the world.',
      'ZAPAX ENTERPRISE coordinates moringa through producing partners. Drying method, colour, moisture, particle size and microbiological limits are agreed on a written specification before you order.',
    ],
    varieties: ['Moringa oleifera leaves', 'Moringa seeds and kernels'],
    photos: [['moringa-range', 'Moringa range: whole dried leaves, tea cut, powder, seeds and kernels', 'Moringa: whole leaves, tea cut, powder, seeds, kernels']],
    forms: [
      ['flakes', 'Whole dried leaves'],
      ['crushed', 'Tea cut'],
      ['powder', 'Leaf powder'],
      ['whole', 'Seeds'],
      ['whole', 'Kernels'],
    ],
    applications: ['Health food and supplements', 'Herbal tea blends', 'Smoothie and beverage powders', 'Bakery and snacks', 'Capsule and tablet filling'],
    params: dehydratedParams,
    packing: dehydratedPacking,
    storage: dehydratedStorage,
    suitability: 'Dried moringa leaves, powder and seeds are shelf stable and ship by sea in dry containers. Powder is best packed in foil or multi-layer liners to protect colour.',
    faq: [['Which moringa form suits tea?', 'Tea cut is made for infusions and tea bags. Leaf powder suits capsules, smoothies and food fortification.']],
  },
  {
    slug: 'starch',
    group: 'Other',
    name: 'Starch',
    art: 'starch',
    title: 'Starch Exporter | Potato, Tapioca, Corn, Rice',
    description:
      'Native potato, tapioca, corn, rice and wheat starch from India for food, paper, textile and industrial use. Grades and packing agreed by ZAPAX ENTERPRISE.',
    h1: 'Native starch: potato, tapioca, corn, rice and wheat',
    summary: 'Potato, tapioca, corn, rice and wheat starch.',
    intro: [
      'Starch thickens, binds and stabilises products across food manufacturing, and is also used in paper, textile and other industries.',
      'ZAPAX ENTERPRISE coordinates native starches through producing partners in India. Grade, moisture, whiteness, viscosity and packing are agreed on a written specification before you order.',
    ],
    varieties: ['Potato starch', 'Tapioca starch', 'Corn (maize) starch', 'Rice starch', 'Wheat starch'],
    photos: [['starch-range', 'Native starch range: potato, tapioca, corn, rice and wheat starch', 'Starch: potato, tapioca, corn, rice, wheat']],
    forms: [['powder', 'Fine powder']],
    applications: ['Soups, sauces and gravies', 'Bakery and confectionery', 'Noodles and snacks', 'Paper and textile industries', 'Adhesives and other industrial uses'],
    params: [
      ['Moisture content', 'Maximum % agreed per starch and grade'],
      ['Whiteness', 'Stated against an approved reference sample'],
      ['Viscosity', 'Range agreed where your application requires it'],
      ['pH', 'Range stated on the specification sheet'],
      ['Ash and protein', 'Limits stated on the specification sheet'],
      ['Microbiology', 'Limits as required by your market for food-grade starch'],
      ['Shelf life', 'Stated on the specification sheet for the agreed packing'],
    ],
    packing: [
      ['Multi-wall paper sacks', 'Commonly 25 kg net, with a poly liner.'],
      ['PP woven bags', 'Commonly 25 kg or 50 kg net, with a poly liner.'],
      ['Jumbo bags', 'Around 500 kg to 1,000 kg for bulk industrial buyers, subject to agreement.'],
    ],
    storage: 'Store sealed in a cool, dry place away from strong odours. Starch absorbs moisture, so keep bags closed and off the floor. Shelf life is stated on the specification sheet.',
    suitability: 'Native starch is shelf stable and ships by sea in dry containers, usually palletised.',
    faq: [['Do you supply modified starch?', 'Our listed range is native starch. If you need a modified starch, share the type and specification and we will check what our partners can supply.']],
  },
];

// Product categories, in menu order.
export const productGroups = [
  { key: 'Dehydrated', id: 'dehydrated', label: 'Dehydrated products', blurb: 'Onion, garlic, ginger, potato, vegetables and fruits, dehydrated into flakes, pieces, granules and powders that store and ship with ease.' },
  { key: 'Other', id: 'other-products', label: 'Other products', blurb: 'Speciality and processed products from India: black garlic, moringa and native starches.' },
].map((g) => ({ ...g, items: products.filter((p) => p.group === g.key) }));

// Pages grouped for navigation. `products` group is built from the catalog above.
export const exportPages = [
  ['/export/', 'Export capabilities'],
  ['/packaging/', 'Packaging'],
  ['/documentation/', 'Export documentation'],
  ['/shipping/', 'Shipping and delivery'],
  ['/trade-terms/', 'Trade terms and fraud prevention'],
];

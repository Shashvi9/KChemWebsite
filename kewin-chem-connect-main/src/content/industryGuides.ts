/**
 * Editorial text for industry pages. DRAFT: general dyeing knowledge, to be reviewed and corrected
 * by Kewin's technical team before publishing. Keep claims about Kewin to verified facts only.
 */
export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  points?: { term: string; text: string }[];
  links?: { label: string; to: string }[];
};

export const INDUSTRY_GUIDES: Record<string, GuideSection[]> = {
  'textile-dyes': [
    {
      heading: 'What are textile dyes?',
      paragraphs: [
        'Textile dyes are colourants that bond with fibres during dyeing or printing. The right dye depends first on the fibre: protein and polyamide fibres such as wool, silk and nylon take acid dyes, while cellulose fibres such as cotton and viscose take reactive or direct dyes. Acrylic fibres are dyed with basic (cationic) dyes.',
        'Within each class, dyes differ in brightness, levelling behaviour and fastness to light, washing and rubbing, so the choice also depends on the end use, from fashion knitwear to carpets and workwear.',
      ],
    },
    {
      heading: 'Dyes for wool, silk and nylon',
      points: [
        { term: 'Levelling acid dyes', text: 'Bright shades with good migration, so they dye evenly. Applied from a strongly acidic dyebath. Moderate wet fastness, suited to light and medium shades.' },
        { term: 'Milling acid dyes', text: 'Higher wet fastness than levelling dyes, applied from a weakly acidic to neutral dyebath. Used where articles are washed often.' },
        { term: '1:1 metal-complex dyes', text: 'Good light fastness on wool, applied from a strongly acidic dyebath.' },
        { term: '1:2 metal-complex dyes', text: 'High light and wet fastness on wool and nylon, applied from a weakly acidic to neutral dyebath. Widely used for carpets, upholstery and muted fashion shades.' },
      ],
    },
    {
      heading: 'Dyes for cotton and viscose',
      points: [
        { term: 'Reactive dyes', text: 'Form a covalent bond with cellulose, giving excellent wash fastness. Applied with salt for exhaustion and alkali (usually soda ash) for fixation.' },
        { term: 'Hot-brand reactive dyes', text: 'Fixed at higher temperatures; used in exhaust dyeing and printing.' },
        { term: 'HE (high-exhaust) reactive dyes', text: 'Bifunctional dyes with high exhaustion and fixation, typically dyed at around 80 °C. Good reproducibility in deep shades.' },
        { term: 'ME (medium-exhaust) reactive dyes', text: 'Dyed at medium temperatures, around 60 °C, for a balance of brightness and fastness.' },
        { term: 'Vinyl sulphone reactive dyes', text: 'Warm-dyeing dyes fixed at around 60 °C, used for exhaust, pad-batch and printing.' },
        { term: 'Reactive printing dyes', text: 'Selected for stability in print pastes and sharp, bright prints on cellulose.' },
        { term: 'Direct dyes', text: 'Applied with salt near the boil, with no fixation step. Simple and economical; wet fastness is lower and is often improved with a cationic after-treatment.' },
      ],
    },
    {
      heading: 'How to choose',
      paragraphs: [
        'Start from the fibre or blend, then the fastness the end use demands (light, washing, rubbing, perspiration), the shade depth and the dyeing method: exhaust, continuous or printing. Compatible dyes of similar behaviour should be used together in combination shades.',
        'Kewin Chemicals can send samples with a technical data sheet so you can check shade and fastness on your own substrate before ordering.',
      ],
    },
  ],

  'leather-dyes': [
    {
      heading: 'What are leather dyes?',
      paragraphs: [
        'Leather dyes colour tanned hides and skins, mostly chrome-tanned (wet blue) and vegetable-tanned leather. They must penetrate the leather evenly and hold up to light, rubbing, perspiration and, for shoe uppers, migration into soles and linings.',
      ],
    },
    {
      heading: 'How leather is dyed',
      paragraphs: [
        'Leather is usually drum-dyed after retanning and before or together with fatliquoring. The dyes penetrate and level at a higher pH, then formic acid is added to lower the pH and fix them. Dyes can also be applied by spray or curtain coating in finishing, and as stains on the grain.',
        'Whether a dye penetrates through the cross-section or stays on the surface depends on the dye, the leather type, pH and the use of dyeing auxiliaries.',
      ],
    },
    {
      heading: 'Types of leather dyes',
      points: [
        { term: 'Acid dyes', text: 'The most widely used leather dyes: good penetration, brightness and a wide shade range for shoe, garment and bag leather.' },
        { term: 'Metal-complex dyes', text: 'Higher light fastness and fuller, more muted shades. Preferred for upholstery and other leathers exposed to light.' },
        { term: 'Direct dyes', text: 'Good affinity for chrome leather, giving deep, saturated surface shades.' },
        { term: 'Basic dyes', text: 'Very bright surface colour, used mainly for topping and on vegetable-tanned leather. Light fastness is limited.' },
      ],
    },
    {
      heading: 'How to choose',
      paragraphs: [
        'Consider the tannage, whether you need through-dyeing or surface colour, the light-fastness requirement of the end product and fastness to perspiration and migration. Shades on leather vary with the substrate, so test on your own crust or wet blue.',
        'Kewin Chemicals can send samples with a technical data sheet for trials on your leather.',
      ],
    },
  ],

  'paper-dyes': [
    {
      heading: 'What are paper dyes?',
      paragraphs: [
        'Paper dyes colour paper and board, from tissue and napkins to writing papers, packaging board and kraft. They are added to the pulp at the wet end (mass colouring) or applied to the surface at the size press or in coating.',
      ],
    },
    {
      heading: 'Types of paper dyes',
      points: [
        { term: 'Direct dyes', text: 'Anionic dyes with good affinity for cellulose fibres. The main class for bleached pulp, giving good bleed fastness and clear backwater.' },
        { term: 'Basic dyes', text: 'Cationic dyes with very strong affinity for unbleached and mechanical pulps such as kraft and newsprint. Bright, economical shades; light fastness is lower.' },
        { term: 'Acid dyes', text: 'Low affinity for the fibre on their own, so they are mainly used for surface colouring at the size press and for shading.' },
      ],
    },
    {
      heading: 'Liquid or powder',
      paragraphs: [
        'Liquid dyes are dust-free and easy to meter continuously on the paper machine. Powder dyes are economical to transport and store, and are dissolved before use. Both forms are used across the industry.',
      ],
    },
    {
      heading: 'How to choose',
      paragraphs: [
        'Choose by pulp type (bleached, unbleached or recycled), the colouring method (wet end or surface), the bleed fastness needed for papers that touch water or food, light fastness, and how clear the backwater must be.',
        'Kewin Chemicals can send samples with a technical data sheet for trials on your furnish.',
      ],
    },
  ],

  'ink-dyes': [
    {
      heading: 'What are ink dyes?',
      paragraphs: [
        'Dyes give inks clean, transparent colour with high colour strength. Unlike pigments, they dissolve completely in the ink vehicle, which makes them suited to writing inks, stamp-pad inks, inkjet and many printing inks where brilliance and transparency matter more than opacity.',
      ],
    },
    {
      heading: 'Dyes by ink type',
      points: [
        { term: 'Acid dyes', text: 'Water-soluble dyes for water-based inks: writing and fountain-pen inks, stamp-pad inks and water-based printing inks. Bright shades with good solubility.' },
        { term: 'Direct dyes', text: 'Water-soluble dyes with good affinity for cellulose, used in water-based inks for paper and board, where they resist bleeding on the substrate.' },
        { term: 'Solvent dyes', text: 'Dissolve in alcohols, glycols, ketones and other solvents rather than water, so they are used in solvent-based inks such as marker, ballpoint and flexo or gravure inks.' },
      ],
    },
    {
      heading: 'How to choose',
      paragraphs: [
        'Choose by the ink vehicle (water or solvent), the solubility you need at working strength, the substrate, and the fastness the print must have to light and water. Check compatibility with the resins and additives in your formulation.',
        'The products below are listed for ink manufacturing; for solvent-based inks, see our solvent dyes. Kewin Chemicals can send samples with a technical data sheet for trials in your formulation.',
      ],
      links: [{ label: 'Solvent dyes', to: '/category/dyes-intermediates/solvent-dyes' }],
    },
  ],

  'wood-stain-dyes': [
    {
      heading: 'What are wood stain dyes?',
      paragraphs: [
        'Wood stain dyes colour wood while keeping the grain visible. Because they dissolve rather than sit on the surface as particles, they penetrate the wood and give transparent, even colour on furniture, flooring, doors, plywood and MDF.',
      ],
    },
    {
      heading: 'Dyes by stain type',
      points: [
        { term: 'Acid dyes', text: 'Water-soluble dyes for water-based stains. They penetrate well, give bright and transparent shades, and are easy to blend into wood tones.' },
        { term: 'Solvent dyes', text: 'Soluble in alcohols and other solvents, for solvent-based and spirit stains that dry quickly and raise the grain less.' },
      ],
    },
    {
      heading: 'How to choose',
      paragraphs: [
        'Consider whether your stain is water- or solvent-based, the wood species, the shade and depth you need, and light fastness, which matters for furniture and flooring exposed to daylight. Shades vary between wood species, so trial on the actual wood.',
        'The products below are listed for wood stains; for solvent-based stains, see our solvent dyes. Kewin Chemicals can send samples with a technical data sheet for trials.',
      ],
      links: [{ label: 'Solvent dyes', to: '/category/dyes-intermediates/solvent-dyes' }],
    },
  ],

  'aluminium-anodizing-dyes': [
    {
      heading: 'What are aluminium anodizing dyes?',
      paragraphs: [
        'Anodizing grows a thin, porous oxide layer on aluminium. Dyes absorbed into those pores before the layer is sealed give a durable, metallic-looking colour used on architectural profiles, consumer electronics, cookware, cosmetic packaging and automotive trim.',
      ],
    },
    {
      heading: 'How anodized aluminium is dyed',
      paragraphs: [
        'After anodizing and rinsing, parts are immersed in a warm aqueous dye bath, where the dye is absorbed into the porous oxide. The colour depth depends on dye concentration, time, temperature, pH and the thickness of the oxide layer.',
        'The parts are then sealed, usually in hot water or a sealing solution, which closes the pores and locks the dye in. Good sealing is essential for fastness and corrosion resistance.',
      ],
    },
    {
      heading: 'Types of anodizing dyes',
      points: [
        { term: 'Acid dyes', text: 'Water-soluble dyes taken up by the porous oxide layer, giving bright, clean shades for decorative and indoor parts.' },
        { term: 'Metal-complex dyes', text: 'Higher light fastness, preferred where parts are exposed to sunlight.' },
      ],
    },
    {
      heading: 'How to choose',
      paragraphs: [
        'Choose by the shade, the light fastness the part needs indoors or outdoors, and stability in your dye bath. Test on your own anodized parts, since the oxide layer and sealing process affect the final colour.',
        'Kewin Chemicals can send samples with a technical data sheet for trials on your line.',
      ],
    },
  ],
};

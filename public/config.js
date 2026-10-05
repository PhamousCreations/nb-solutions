/* ---------------------------------------------------------------------------
 * ONE PLACE TO EDIT YOUR BUSINESS DETAILS.
 * Change the values below and every page updates itself.
 * Anything marked PLACEHOLDER should be swapped for your real details.
 * ------------------------------------------------------------------------- */
window.SITE = {
  name: 'FreshFold',                                   // PLACEHOLDER
  fullName: 'FreshFold Laundry & Cleaning',            // PLACEHOLDER
  tagline: 'Laundry & cleaning, collected and delivered.',

  // Phone / WhatsApp — used for click-to-call and click-to-chat buttons
  phoneDisplay: '+233 20 000 0000',                    // PLACEHOLDER
  phoneRaw: '+233200000000',                           // PLACEHOLDER (no spaces)
  whatsapp: '233200000000',                            // PLACEHOLDER (country code, no + or spaces)
  whatsappMessage: "Hi FreshFold! I'd like to book a laundry / cleaning pickup.",

  email: 'hello@freshfold.gh',                         // PLACEHOLDER
  address: '12 Ring Road Central, Accra',              // PLACEHOLDER
  hours: 'Mon–Sat, 7:00am – 8:00pm',
  hoursSunday: 'Sunday: pickups by arrangement',

  currency: 'GH₵',
  areas: [
    'East Legon', 'Airport Residential', 'Labone', 'Cantonments', 'Osu',
    'Dansoman', 'Spintex', 'Madina', 'Achimota', 'Tesano', 'Tema', 'Other / ask us',
  ],
  timeSlots: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'],

  /* Laundry price list — powers BOTH the pricing table and the booking form.
     Change a price here and both update together. */
  laundryPrices: [
    { name: 'Wash & fold (per kg)',       price: 12,  note: 'Minimum 5kg' },
    { name: 'Shirt (wash & iron)',        price: 10,  note: 'Hanger pressed' },
    { name: 'T-shirt / Top',              price: 7,   note: '' },
    { name: 'Trousers / Jeans',           price: 9,   note: '' },
    { name: 'Dress (wash & iron)',        price: 14,  note: '' },
    { name: 'Suit (2-piece, dry clean)',  price: 45,  note: 'Dry clean only' },
    { name: 'Dress (dry clean)',          price: 35,  note: '' },
    { name: 'Bedsheet set',               price: 28,  note: 'Sheet + 2 cases' },
    { name: 'Duvet (large)',              price: 55,  note: '' },
    { name: 'Towel',                      price: 8,   note: '' },
    { name: 'Curtains (per panel)',       price: 30,  note: '' },
  ],
};

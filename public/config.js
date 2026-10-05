/* ---------------------------------------------------------------------------
 * N&B SOLUTIONS — ONE PLACE TO EDIT YOUR CONTACT DETAILS, SERVICES AND PRICES.
 *
 * Change the values below and every page updates itself.
 * Anything marked PLACEHOLDER is placeholder data you should confirm or replace.
 * ------------------------------------------------------------------------- */
window.SITE = {
  /* ------------------------------ identity ------------------------------ */
  name: 'N&B Solutions',
  fullName: 'N&B Solutions',
  tagline: 'Cleaning & laundry services',
  founder: 'Benjamin Ansah',

  /* ------------------------------ contact ------------------------------- */
  // Shown to customers. Use the international format so it also works
  // for clients calling from outside Ghana.
  phoneDisplay: '+233 59 613 4611',       // calls
  phoneRaw: '+233596134611',              // used for click-to-call, no spaces

  whatsapp: '233553965448',               // country code, no + or spaces
  whatsappDisplay: '+233 55 396 5448',
  whatsappMessage: "Hello N&B Solutions, I'd like to enquire about your cleaning and laundry services.",

  // ADD YOUR EMAIL HERE when you have it. While this is empty, the email
  // row is hidden automatically everywhere on the site.
  email: '',

  // PLACEHOLDER — replace with your business / registered address
  address: 'Greater Accra, Ghana',
  // PLACEHOLDER — confirm your real hours
  hours: 'Monday to Saturday',
  hoursSunday: 'Evening &amp; weekend work available for commercial clients',

  /* ------------------------------- prices ------------------------------- */
  currency: 'GH₵',

  /* PLACEHOLDER LIST — trim this to the areas you actually cover.
     It fills the booking form's area dropdown. */
  areas: [
    'Accra Central', 'East Legon', 'Airport Residential', 'Labone', 'Cantonments',
    'Osu', 'Spintex', 'Dansoman', 'Madina', 'Achimota', 'Tema', 'Other / ask us',
  ],
  timeSlots: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'],

  /* ------------------------------ services ------------------------------ */
  /* These fill the booking form. Add, remove or rename freely —
     the value must stay lowercase-with-dashes. */
  services: [
    { value: 'laundry',              label: 'Laundry services',              hint: 'Washing, drying, ironing, folding & stain treatment' },
    { value: 'deep-cleaning',        label: 'Deep cleaning',                 hint: 'Thorough top-to-bottom clean' },
    { value: 'industrial-cleaning',  label: 'Industrial cleaning',           hint: 'Factories, warehouses, large premises' },
    { value: 'commercial-cleaning',  label: 'Commercial cleaning',           hint: 'Offices, shops, banks, schools' },
    { value: 'hotel-cleaning',       label: 'Hotel & guesthouse cleaning',   hint: 'Rooms, linen, turnarounds' },
    { value: 'move-cleaning',        label: 'Move-in / move-out cleaning',   hint: 'Empty-property deep clean' },
    { value: 'post-event-cleaning',  label: 'Post-event cleaning',           hint: 'After parties, weddings, functions' },
    { value: 'mixed',                label: 'More than one of these',        hint: "We'll sort it out with you" },
  ],

  /* Which of the above are quoted per site rather than priced per item.
     The booking form hides the laundry item list for these. */
  cleaningValues: [
    'deep-cleaning', 'industrial-cleaning', 'commercial-cleaning',
    'hotel-cleaning', 'move-cleaning', 'post-event-cleaning',
  ],

  /* ---------------------------- laundry prices ---------------------------- */
  /* PLACEHOLDER PRICES — these are indicative figures, not your confirmed
     rates. Change them to your real prices and both the pricing table and the
     booking form's estimate update together. */
  laundryPrices: [
    { name: 'Washing & folding (per kg)',  price: 12, note: 'Minimum 5kg' },
    { name: 'Ironing only (per item)',     price: 6,  note: 'Already washed at home' },
    { name: 'Shirt (wash & iron)',         price: 10, note: 'Hanger pressed' },
    { name: 'T-shirt / Top',               price: 7,  note: '' },
    { name: 'Trousers / Jeans',            price: 9,  note: '' },
    { name: 'Dress (wash & iron)',         price: 14, note: '' },
    { name: 'Suit (2-piece, dry clean)',   price: 45, note: 'Dry clean only' },
    { name: 'Bedsheet set',                price: 28, note: 'Sheet + 2 cases' },
    { name: 'Duvet (large)',               price: 55, note: '' },
    { name: 'Towel',                       price: 8,  note: '' },
    { name: 'Curtains (per panel)',        price: 30, note: '' },
  ],
};

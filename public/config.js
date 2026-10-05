/* ---------------------------------------------------------------------------
 * N&B SOLUTIONS — ONE PLACE TO EDIT YOUR CONTACT DETAILS AND SERVICES.
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

  /* ------------------------- coverage & scheduling ----------------------- */
  /* PLACEHOLDER — trim this to the areas you actually cover.
     It fills the contact form's area dropdown. */
  areas: [
    'Accra Central', 'East Legon', 'Airport Residential', 'Labone', 'Cantonments',
    'Osu', 'Spintex', 'Dansoman', 'Madina', 'Achimota', 'Tema', 'Other / ask us',
  ],
  timeSlots: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'],

  /* ------------------------------ services ------------------------------ */
  /* These fill the enquiry form. Add, remove or rename freely —
     the value must stay lowercase-with-dashes. */
  services: [
    { value: 'laundry',              label: 'Laundry services',              hint: 'Washing, drying, ironing, folding & stain treatment' },
    { value: 'deep-cleaning',        label: 'Deep cleaning',                 hint: 'Thorough top-to-bottom clean' },
    { value: 'industrial-cleaning',  label: 'Industrial cleaning',           hint: 'Factories, warehouses, large premises' },
    { value: 'commercial-cleaning',  label: 'Commercial cleaning',           hint: 'Offices, shops, banks, schools' },
    { value: 'hotel-cleaning',       label: 'Hotel & guesthouse cleaning',   hint: 'Rooms, linen, turnarounds' },
    { value: 'move-cleaning',        label: 'Move-in / move-out cleaning',   hint: 'Empty-property deep clean' },
    { value: 'post-event-cleaning',  label: 'Post-event cleaning',           hint: 'After parties, weddings, functions' },
    { value: 'mixed',                label: 'More than one of these',        hint: "We'll discuss what you need" },
  ],

  /* ----------------------------- who we serve ---------------------------- */
  /* The client groups the business targets. Shown as a section on the home
     page and in the enquiry form's "type of client" options. */
  sectors: [
    { icon: 'office',   title: 'Offices & corporate',   text: 'Regular cleaning for offices, banks, shops and shared workspaces — scheduled around your working hours.' },
    { icon: 'hotel',    title: 'Hotels & guesthouses',  text: 'Guest rooms, bathrooms, lobbies and corridors, plus fast turnarounds between check-out and check-in.' },
    { icon: 'factory',  title: 'Industrial & commercial', text: 'Factories, warehouses, workshops and large premises, including floors and high-traffic areas.' },
    { icon: 'school',   title: 'Schools & institutions', text: 'Classrooms, clinics, churches and community buildings cleaned on a dependable schedule.' },
    { icon: 'home',     title: 'Homes & residents',     text: 'Deep cleaning, move-in and move-out cleans, and household laundry collected and returned.' },
    { icon: 'event',    title: 'Events & functions',    text: 'Post-event cleaning after parties, weddings, conferences and funerals — we leave the venue ready.' },
  ],
};

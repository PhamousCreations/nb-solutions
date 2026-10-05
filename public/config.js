/* ---------------------------------------------------------------------------
 * N&B SOLUTIONS — ONE PLACE TO EDIT YOUR CONTACT DETAILS AND SERVICES.
 *
 * Change the values below and every page updates itself.
 * Details below are taken from the company flyer and your messages.
 * ------------------------------------------------------------------------- */
window.SITE = {
  /* ------------------------------ identity ------------------------------ */
  name: 'N&B Solutions',
  fullName: 'N&B Solutions',
  tagline: 'Cleaning & laundry services',
  // The company tagline, from the flyer
  slogan: 'Clean spaces · Fresh clothes · Better living',
  founder: 'Benjamin Ansah',

  /* ------------------------------ contact ------------------------------- */
  phoneDisplay: '+233 59 613 4611',       // calls — from the flyer
  phoneRaw: '+233596134611',              // used for click-to-call, no spaces

  // Confirmed by the client as the correct number.
  // IMPORTANT: the printed flyer shows 055 386 5448 — one digit out. The flyer
  // needs correcting before it is reprinted and distributed.
  whatsapp: '233553965448',
  whatsappDisplay: '+233 55 396 5448',
  whatsappMessage: "Hello N&B Solutions, I'd like to enquire about your cleaning and laundry services.",

  // ADD YOUR EMAIL HERE when you have it. While this is empty, the email
  // row is hidden automatically everywhere on the site.
  email: 'nbsolutions571@gmail.com',

  // Located in Apollo, Takoradi — per the flyer
  address: 'Apollo, Takoradi, Western Region, Ghana',
  city: 'Takoradi',
  region: 'Western Region',

  // Confirmed opening hours
  hours: 'Monday to Saturday, 7:00am – 8:00pm',
  hoursSunday: 'Commercial & contract work can be arranged outside these hours',

  /* ------------------------- coverage & scheduling ----------------------- */
  /* PLACEHOLDER — trim this to the areas you actually cover.
     It fills the enquiry form's area dropdown. */
  areas: [
    'Apollo', 'Takoradi', 'Effia-Nkwanta', 'Kwesimintsim', 'Anaji', 'Airport Ridge',
    'Apremdo', 'Beach Road', 'Sekondi', 'Ketan', 'Essikado',
    'Tarkwa (larger jobs)', 'Other / ask us',
  ],
  timeSlots: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'],

  /* ------------------------------ services ------------------------------ */
  /* Taken from the flyer's "Our Services" list, in the same order, followed
     by the larger commercial and industrial work. Add, remove or rename
     freely — the value must stay lowercase-with-dashes. */
  services: [
    { value: 'residential-cleaning', label: 'Residential cleaning',          hint: 'Homes, apartments & flats' },
    { value: 'office-cleaning',      label: 'Office cleaning',               hint: 'Clean workspaces, higher productivity' },
    { value: 'laundry',              label: 'Laundry services',              hint: 'Wash, dry & fold' },
    { value: 'ironing',              label: 'Ironing services',              hint: 'Neat clothes, confident you' },
    { value: 'deep-cleaning',        label: 'Deep cleaning',                 hint: 'For a healthier environment' },
    { value: 'commercial-cleaning',  label: 'Commercial & retail cleaning',  hint: 'Shops, banks, schools, clinics' },
    { value: 'industrial-cleaning',  label: 'Industrial cleaning',           hint: 'Factories, warehouses, large premises' },
    { value: 'hotel-cleaning',       label: 'Hotel & guesthouse cleaning',   hint: 'Rooms, linen, turnarounds' },
    { value: 'move-cleaning',        label: 'Move-in / move-out cleaning',   hint: 'Empty-property deep clean' },
    { value: 'post-event-cleaning',  label: 'Post-event cleaning',           hint: 'After parties, weddings, functions' },
    { value: 'mixed',                label: 'More than one of these',        hint: "We'll discuss what you need" },
  ],

  /* ----------------------------- who we serve ---------------------------- */
  /* The client groups the business targets. Shown as a section on the home
     page. Available icons: office, hotel, factory, school, home, event. */
  sectors: [
    { icon: 'home',     title: 'Homes & residents',     text: 'Deep cleaning for houses, apartments and flats, move-in and move-out cleans, and household laundry collected and returned.' },
    { icon: 'office',   title: 'Offices & corporate',   text: 'Regular cleaning for offices, banks, shops and shared workspaces — scheduled around your working hours.' },
    { icon: 'hotel',    title: 'Hotels & guesthouses',  text: 'Guest rooms, bathrooms, lobbies and corridors, plus fast turnarounds between check-out and check-in.' },
    { icon: 'factory',  title: 'Industrial & commercial', text: 'Factories, warehouses, workshops and large premises, including floors and high-traffic areas.' },
    { icon: 'school',   title: 'Schools & institutions', text: 'Classrooms, clinics, churches and community buildings cleaned on a dependable schedule.' },
    { icon: 'event',    title: 'Events & functions',    text: 'Post-event cleaning after parties, weddings, conferences and funerals — we leave the venue ready.' },
  ],
};

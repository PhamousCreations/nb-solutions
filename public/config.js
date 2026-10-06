/* ---------------------------------------------------------------------------
 * N&B SOLUTIONS — ONE PLACE TO EDIT YOUR CONTACT DETAILS AND SERVICES.
 *
 * Change the values below and every page updates itself.
 * Colours and wording are taken from the official company logo and flyer.
 * ------------------------------------------------------------------------- */
window.SITE = {
  /* ------------------------------ identity ------------------------------ */
  name: 'N&B Solutions',
  fullName: 'N&B Solutions',
  tagline: 'Cleaning & laundry services',
  // Exact wording from the official logo badge
  slogan: 'Clean spaces · Fresh lives',
  founder: 'Benjamin Ansah',

  // The official logo, cropped to a circle with transparent corners
  logo: 'images/logo.png',

  /* ------------------------------ contact ------------------------------- */
  phoneDisplay: '+233 59 613 4611',       // calls — from the flyer
  phoneRaw: '+233596134611',              // used for click-to-call, no spaces

  // Confirmed by the client as the correct number.
  // IMPORTANT: the printed flyer shows 055 386 5448 — one digit out. The flyer
  // needs correcting before it is reprinted and distributed.
  whatsapp: '233553965448',
  whatsappDisplay: '+233 55 396 5448',
  whatsappMessage: "Hello N&B Solutions, I'd like to enquire about your cleaning and laundry services.",

  /* Your business email. Until you add one here, the email row hides itself
     everywhere on the site. Alerts already go to nbsolutions571@gmail.com. */
  email: '',

  address: 'Apollo, Takoradi, Western Region, Ghana',
  city: 'Takoradi',
  region: 'Western Region',

  hours: 'Monday to Saturday, 7:00am – 8:00pm',
  hoursSunday: 'Commercial & contract work can be arranged outside these hours',

  /* ------------------------- coverage & scheduling ----------------------- */
  areas: [
    'Apollo', 'Takoradi', 'Effia-Nkwanta', 'Kwesimintsim', 'Anaji', 'Airport Ridge',
    'Apremdo', 'Beach Road', 'Sekondi', 'Ketan', 'Essikado',
    'Tarkwa (larger jobs)', 'Other / ask us',
  ],
  timeSlots: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'],

  /* ------------------------------ services ------------------------------ */
  /* The first five are the flyer's headline services. Add, remove or rename
     freely — the value must stay lowercase-with-dashes. */
  services: [
    { value: 'residential-cleaning', label: 'Residential cleaning',          hint: 'Homes, apartments & flats' },
    { value: 'office-cleaning',      label: 'Office cleaning',               hint: 'Clean workspaces, higher productivity' },
    { value: 'laundry',              label: 'Laundry services',              hint: 'Wash, dry & fold' },
    { value: 'ironing',              label: 'Ironing services',              hint: 'Neat clothes, confident you' },
    { value: 'deep-cleaning',        label: 'Deep cleaning',                 hint: 'For a healthier environment' },
    { value: 'fumigation',           label: 'Fumigation & pest control',     hint: 'Disinfection and pest treatment' },
    { value: 'commercial-cleaning',  label: 'Commercial & retail cleaning',  hint: 'Shops, banks, schools, clinics' },
    { value: 'industrial-cleaning',  label: 'Industrial cleaning',           hint: 'Factories, warehouses, large premises' },
    { value: 'hotel-cleaning',       label: 'Hotel & guesthouse cleaning',   hint: 'Rooms, linen, turnarounds' },
    { value: 'move-cleaning',        label: 'Move-in / move-out cleaning',   hint: 'Empty-property deep clean' },
    { value: 'post-event-cleaning',  label: 'Post-event cleaning',           hint: 'After parties, weddings, functions' },
    { value: 'mixed',                label: 'More than one of these',        hint: "We'll discuss what you need" },
  ],

  /* ----------------------------- who we serve ---------------------------- */
  sectors: [
    { icon: 'home',     title: 'Homes & residents',     text: 'Deep cleaning for houses, apartments and flats, move-in and move-out cleans, and household laundry collected and returned.' },
    { icon: 'office',   title: 'Offices & corporate',   text: 'Regular cleaning for offices, banks, shops and shared workspaces — scheduled around your working hours.' },
    { icon: 'hotel',    title: 'Hotels & guesthouses',  text: 'Guest rooms, bathrooms, lobbies and corridors, plus fast turnarounds between check-out and check-in.' },
    { icon: 'factory',  title: 'Industrial & commercial', text: 'Factories, warehouses, workshops and large premises, including floors and high-traffic areas.' },
    { icon: 'school',   title: 'Schools & institutions', text: 'Classrooms, clinics, churches and community buildings cleaned on a dependable schedule.' },
    { icon: 'event',    title: 'Events & functions',    text: 'Post-event cleaning after parties, weddings, conferences and funerals — we leave the venue ready.' },
  ],

  /* The founder's full profile — education, career and expertise — is written
     directly into about.html, so that page works even if JavaScript is blocked.
     Edit it there. The name itself lives above as "founder". */
};

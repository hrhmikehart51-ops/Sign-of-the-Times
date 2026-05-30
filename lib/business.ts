export const businessInfo = {
  name: "Sign of the Times",
  phone: "360-891-9477",
  hours: "Tuesday to Friday, 9:30 AM to 4:30 PM",
  address: {
    street: "5809 NE 105th Ave",
    city: "Vancouver",
    state: "WA",
    postalCode: "98662",
    country: "US"
  },
  serviceArea: "Vancouver, WA and the Portland metro area",
  mapsUrl:
    "https://maps.google.com/?q=5809+NE+105th+Ave,+Vancouver,+WA+98662",
  publicEmail: "signswa@yahoo.com",
  consultBookingUrl:
    process.env.NEXT_PUBLIC_CONSULT_BOOKING_URL ||
    "https://calendly.com/your-calendly/sign-print-consult"
} as const;

export const products = [
  "Banners",
  "A-frame signs",
  "Real estate signs",
  "Yard signs",
  "Vehicle lettering",
  "Stickers and decals",
  "Storefront signage",
  "Window graphics",
  "Magnetic signs",
  "Custom signs"
] as const;

export const sizes = ["18x24", "24x36", "36x48", "Custom size"] as const;

export const materials = [
  "Correx 4 mil",
  "Correx 10 mil",
  "Metal",
  "Banner material",
  "Vinyl/sticker material"
] as const;

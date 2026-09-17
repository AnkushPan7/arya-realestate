export type SampleProject = {
  id: number;
  title: string;
  slug: string;
  zone: "east" | "west";
  status: "upcoming" | "ongoing" | "completed";
  propertyType:
    | "apartment"
    | "bungalow"
    | "commercial"
    | "industrial"
    | "plot"
    | "land";
  displayPrice: string;
  bhkOptions: string[];
  location: string;
  primaryImageUrl: string | null;
  plotArea?: string;
  possessionDate?: string;
  reraNumber?: string;
  description?: string[];
  features?: string[];
  floorPlans?: { title: string; imageUrl: string | null }[];
  videoUrl?: string | null;
  gallery?: { url: string | null; altText: string }[];
};

/** Hardcoded sample listings — replace with DB fetches later */
export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 1,
    title: "Aaradhana Sky",
    slug: "aaradhana-sky",
    zone: "east",
    status: "ongoing",
    propertyType: "apartment",
    displayPrice: "₹52L – ₹63L",
    bhkOptions: ["2 BHK", "3 BHK"],
    location: "Nikol, East Ahmedabad",
    primaryImageUrl: null,
    plotArea: "1,250 – 1,680 sq.ft",
    possessionDate: "Dec 2027",
    reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD EAST/RAA12345/120426",
    description: [
      "Aaradhana Sky brings thoughtfully planned 2 & 3 BHK residences to Nikol, one of East Ahmedabad’s most connected growth corridors. Designed for young families and upwardly mobile professionals, the project balances everyday convenience with spaces that feel open and light.",
      "Each home is crafted with practical layouts, ample ventilation, and finishes that hold up in daily life. Shared amenities focus on wellness and community — landscaped courtyards, a kids’ play area, and a multipurpose room for gatherings.",
      "With RERA registration in place and handover targeted for late 2027, Aaradhana Sky is a strong fit if you want proximity to the ring road network without compromising on living quality.",
    ],
    features: [
      "Vastu-compliant layouts",
      "Covered parking",
      "24×7 security",
      "Landscaped garden",
      "Kids play area",
      "Rainwater harvesting",
      "Power backup",
      "Modular kitchen ready",
      "Video door phone",
    ],
    floorPlans: [
      { title: "2 BHK Layout", imageUrl: null },
      { title: "3 BHK Layout", imageUrl: null },
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    gallery: [
      { url: null, altText: "Aaradhana Sky exterior view" },
      { url: null, altText: "Aaradhana Sky lobby" },
      { url: null, altText: "Aaradhana Sky living room" },
      { url: null, altText: "Aaradhana Sky amenities" },
      { url: null, altText: "Aaradhana Sky night view" },
    ],
  },
  {
    id: 2,
    title: "Shivalik Heights",
    slug: "shivalik-heights",
    zone: "west",
    status: "ongoing",
    propertyType: "apartment",
    displayPrice: "₹85L – ₹1.2Cr",
    bhkOptions: ["3 BHK", "4 BHK"],
    location: "SG Highway, West Ahmedabad",
    primaryImageUrl: null,
    plotArea: "1,850 – 2,400 sq.ft",
    possessionDate: "Mar 2028",
    reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD WEST/RAA67890/150526",
    description: [
      "Shivalik Heights sits along SG Highway with elevated 3 & 4 BHK apartments designed for spacious family living. Floor plates prioritise light, storage, and quiet evenings away from the corridor’s pace.",
    ],
    features: [
      "Clubhouse",
      "Infinity pool",
      "Gym",
      "Visitor parking",
      "EV charging",
      "Concierge desk",
    ],
    floorPlans: [
      { title: "3 BHK Layout", imageUrl: null },
      { title: "4 BHK Layout", imageUrl: null },
    ],
    videoUrl: null,
    gallery: [
      { url: null, altText: "Shivalik Heights exterior" },
      { url: null, altText: "Shivalik Heights lobby" },
      { url: null, altText: "Shivalik Heights living space" },
      { url: null, altText: "Shivalik Heights amenities" },
    ],
  },
  {
    id: 3,
    title: "Arya Residency",
    slug: "arya-residency",
    zone: "east",
    status: "upcoming",
    propertyType: "apartment",
    displayPrice: "₹38L – ₹48L",
    bhkOptions: ["2 BHK"],
    location: "Naroda, East Ahmedabad",
    primaryImageUrl: null,
    plotArea: "980 – 1,120 sq.ft",
    possessionDate: "Jun 2028",
    description: [
      "Arya Residency is an upcoming 2 BHK community in Naroda focused on accessible pricing without cutting corners on planning or finish quality.",
    ],
    features: ["Security", "Parking", "Garden", "Lift"],
    floorPlans: [{ title: "2 BHK Layout", imageUrl: null }],
    gallery: [
      { url: null, altText: "Arya Residency site" },
      { url: null, altText: "Arya Residency plan" },
      { url: null, altText: "Arya Residency amenities" },
      { url: null, altText: "Arya Residency entrance" },
    ],
  },
  {
    id: 4,
    title: "Green Valley Villas",
    slug: "green-valley-villas",
    zone: "west",
    status: "upcoming",
    propertyType: "bungalow",
    displayPrice: "₹1.8Cr onwards",
    bhkOptions: ["4 BHK", "5 BHK"],
    location: "Bopal, West Ahmedabad",
    primaryImageUrl: null,
    plotArea: "2,800 – 3,600 sq.ft",
    possessionDate: "2029",
    description: [
      "Green Valley Villas offers low-density bungalow living in Bopal with private gardens and contemporary elevational language.",
    ],
    features: ["Private garden", "Parking for 2 cars", "Community park"],
    floorPlans: [
      { title: "4 BHK Layout", imageUrl: null },
      { title: "5 BHK Layout", imageUrl: null },
    ],
    gallery: [
      { url: null, altText: "Green Valley villa exterior" },
      { url: null, altText: "Green Valley garden" },
      { url: null, altText: "Green Valley living" },
      { url: null, altText: "Green Valley streetscape" },
    ],
  },
  {
    id: 5,
    title: "Sumel Business Hub",
    slug: "sumel-business-hub",
    zone: "east",
    status: "completed",
    propertyType: "commercial",
    displayPrice: "₹45L onwards",
    bhkOptions: [],
    location: "Odhav, East Ahmedabad",
    primaryImageUrl: null,
    plotArea: "450 – 1,200 sq.ft",
    possessionDate: "Ready to move",
    description: [
      "Sumel Business Hub is a completed commercial address in Odhav suited to showrooms, clinics, and boutique offices.",
    ],
    features: ["High footfall frontage", "Lift", "Parking", "Fire safety"],
    floorPlans: [{ title: "Typical Unit", imageUrl: null }],
    gallery: [
      { url: null, altText: "Sumel Business Hub facade" },
      { url: null, altText: "Sumel Business Hub lobby" },
      { url: null, altText: "Sumel Business Hub unit" },
      { url: null, altText: "Sumel Business Hub parking" },
    ],
  },
  {
    id: 6,
    title: "Horizon Plots",
    slug: "horizon-plots",
    zone: "west",
    status: "completed",
    propertyType: "plot",
    displayPrice: "₹28L – ₹55L",
    bhkOptions: [],
    location: "Sanand Road, West Ahmedabad",
    primaryImageUrl: null,
    plotArea: "100 – 200 sq.yards",
    possessionDate: "Immediate",
    description: [
      "Horizon Plots offers titled residential plots on Sanand Road for buyers who want to build at their own pace.",
    ],
    features: ["Clear title", "Internal roads", "Drainage", "Street lighting"],
    floorPlans: [],
    gallery: [
      { url: null, altText: "Horizon Plots overview" },
      { url: null, altText: "Horizon Plots road" },
      { url: null, altText: "Horizon Plots site" },
      { url: null, altText: "Horizon Plots location" },
    ],
  },
];

export function filterProjects(
  projects: SampleProject[],
  filters: {
    zone?: string;
    status?: string;
    type?: string;
  },
): SampleProject[] {
  return projects.filter((project) => {
    if (filters.zone && filters.zone !== "all" && project.zone !== filters.zone) {
      return false;
    }
    if (
      filters.status &&
      filters.status !== "all" &&
      project.status !== filters.status
    ) {
      return false;
    }
    if (
      filters.type &&
      filters.type !== "all" &&
      project.propertyType !== filters.type
    ) {
      return false;
    }
    return true;
  });
}

export function getProjectBySlug(
  slug: string,
  zone: "east" | "west",
): SampleProject | undefined {
  return SAMPLE_PROJECTS.find((p) => p.slug === slug && p.zone === zone);
}

export function getRelatedProjects(
  slug: string,
  zone: "east" | "west",
  limit = 3,
): SampleProject[] {
  return SAMPLE_PROJECTS.filter((p) => p.zone === zone && p.slug !== slug).slice(
    0,
    limit,
  );
}

/** Homepage featured strip — first ongoing/upcoming apartments by priority */
export function getFeaturedProjects(limit = 3): SampleProject[] {
  const preferred = SAMPLE_PROJECTS.filter(
    (p) => p.propertyType === "apartment" && p.status !== "completed",
  );
  const pool = preferred.length >= limit ? preferred : SAMPLE_PROJECTS;
  return pool.slice(0, limit);
}

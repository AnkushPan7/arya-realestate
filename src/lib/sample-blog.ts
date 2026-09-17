export type BlogCategory =
  | "market-updates"
  | "buying-guide"
  | "project-news";

export type SampleBlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  categoryLabel: string;
  coverImageUrl: string | null;
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  tags: string[];
  content: {
    type: "p" | "h2" | "h3" | "blockquote";
    text: string;
  }[];
};

export const BLOG_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "market-updates", label: "Market Updates" },
  { value: "buying-guide", label: "Buying Guide" },
  { value: "project-news", label: "Project News" },
] as const;

/** Hardcoded sample posts — replace with DB fetches later */
export const SAMPLE_BLOG_POSTS: SampleBlogPost[] = [
  {
    title: "East Ahmedabad’s Growth Corridors in 2026: Where Demand Is Heading",
    slug: "east-ahmedabad-growth-corridors-2026",
    excerpt:
      "A practical look at Nikol, Naroda, and Odhav — connectivity, pricing bands, and which buyer profiles are most active right now.",
    category: "market-updates",
    categoryLabel: "Market Updates",
    coverImageUrl: null,
    author: "Harshad Prajapati",
    publishedAt: "2026-03-12",
    readTimeMinutes: 6,
    tags: ["East Ahmedabad", "Market Trends", "Nikol", "Investment"],
    content: [
      {
        type: "p",
        text: "East Ahmedabad continues to attract first-time buyers and upgraders who want strong road connectivity without West-side price premiums. In early 2026, enquiries through our offices have clustered around Nikol, Naroda, and the Odhav commercial belt.",
      },
      {
        type: "h2",
        text: "What’s driving demand",
      },
      {
        type: "p",
        text: "Improved ring-road access, new residential launches with clearer RERA timelines, and steady rental absorption near industrial employment hubs have kept interest healthy. Buyers are comparing possession certainty as carefully as carpet area.",
      },
      {
        type: "blockquote",
        text: "“The smartest decisions we see now pair a realistic commute map with a transparent handover window — not just the lowest listed price.”",
      },
      {
        type: "h3",
        text: "Pricing bands to watch",
      },
      {
        type: "p",
        text: "2 BHK tickets generally stay more competitive than western corridors, while mid-size 3 BHKs with reliable parking and amenities are absorbing well among young families. Always verify title papers, society bylaws, and builder track record before locking an inventory.",
      },
      {
        type: "p",
        text: "If you’re shortlisting East options this quarter, start with corridor access, school proximity, and monthly outgo — then narrow by layout and RERA status. Our East office can walk you through live inventories with side-by-side comparisons.",
      },
    ],
  },
  {
    title: "First Home in Ahmedabad: A Step-by-Step Buying Guide",
    slug: "first-home-ahmedabad-buying-guide",
    excerpt:
      "From budget framing and site visits to RERA checks and loan paperwork — a calm checklist for first-time buyers.",
    category: "buying-guide",
    categoryLabel: "Buying Guide",
    coverImageUrl: null,
    author: "Sudhir Prajapati",
    publishedAt: "2026-02-04",
    readTimeMinutes: 8,
    tags: ["Buying Guide", "First Home", "RERA", "Home Loan"],
    content: [
      {
        type: "p",
        text: "Buying your first home in Ahmedabad should feel exciting — not overwhelming. The process becomes clearer when you break it into budget, shortlist, diligence, and paperwork stages.",
      },
      {
        type: "h2",
        text: "Start with monthly comfort, not max eligibility",
      },
      {
        type: "p",
        text: "Bank eligibility is a ceiling, not a target. Decide what monthly EMI, maintenance, and commute cost feel sustainable for your household. That number guides zone choice more honestly than brochure aspirational pricing.",
      },
      {
        type: "h2",
        text: "Visit before you fall in love with a listing photo",
      },
      {
        type: "p",
        text: "See the unit at different times of day if you can. Check ventilation, noise from nearby roads, parking stress, and water availability. Talk to existing residents when possible — they reveal what marketing decks rarely do.",
      },
      {
        type: "blockquote",
        text: "“A home is a 10–15 year decision. Spend more hours verifying the life around the walls than the wall finishes themselves.”",
      },
      {
        type: "h3",
        text: "RERA and paperwork essentials",
      },
      {
        type: "p",
        text: "Confirm RERA registration, possession commitments, and what is included in the sale consideration. Coordinate home-loan pre-approval early so negotiation and paperwork move together. A trusted consultancy helps you sequence documents without last-minute surprises.",
      },
    ],
  },
  {
    title: "Inside Aaradhana Sky: A Closer Look at Nikol’s New Mid-Rise Address",
    slug: "aaradhana-sky-nikol-project-news",
    excerpt:
      "Project highlights, layout notes, and who this East Ahmedabad launch is best suited for — from our walkthrough with the developer team.",
    category: "project-news",
    categoryLabel: "Project News",
    coverImageUrl: null,
    author: "Arya Real Estate Desk",
    publishedAt: "2026-01-18",
    readTimeMinutes: 5,
    tags: ["Aaradhana Sky", "Nikol", "Project Launch", "2 BHK"],
    content: [
      {
        type: "p",
        text: "Aaradhana Sky is one of the projects we recommend to families seeking practical 2 & 3 BHK living in Nikol with a clear handover window. We recently revisited the site to review planning quality and amenity focus.",
      },
      {
        type: "h2",
        text: "Who it fits best",
      },
      {
        type: "p",
        text: "Young families and professionals who want East-side connectivity, covered parking, and layouts that don’t waste space on unused formal rooms. The community sizing stays approachable — not an intimidating mega-campus.",
      },
      {
        type: "h3",
        text: "What we liked on visit",
      },
      {
        type: "p",
        text: "Natural light in living rooms, clear entry-lobby planning, and amenities geared towards daily use rather than unused spectacle. As always, ask for the latest inventory matrix, payment schedule, and RERA references before booking.",
      },
      {
        type: "blockquote",
        text: "“A launch becomes a recommendation only after we can explain both its strengths and its trade-offs in plain language.”",
      },
      {
        type: "p",
        text: "Want a guided visit? Message our East Ahmedabad office — we’ll share current available stacks and compare Aaradhana Sky with two nearby alternatives on the same budget line.",
      },
    ],
  },
];

export function getBlogPost(slug: string): SampleBlogPost | undefined {
  return SAMPLE_BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(
  slug: string,
  limit = 3,
): SampleBlogPost[] {
  return SAMPLE_BLOG_POSTS.filter((post) => post.slug !== slug).slice(0, limit);
}

export function filterBlogPosts(
  posts: SampleBlogPost[],
  category?: string,
): SampleBlogPost[] {
  if (!category || category === "all") return posts;
  return posts.filter((post) => post.category === category);
}

export function formatBlogDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

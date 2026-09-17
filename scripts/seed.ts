/**
 * Seed script — idempotent inserts for local/prod bootstrap.
 * Run: npm run db:seed
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import {
  blogPosts,
  offices,
  pagesContent,
  projects,
  siteSettings,
  socialLinks,
  users,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";

async function seed() {
  console.log("Seeding Arya Real Estate…\n");

  // 1. Admin user
  const adminEmail = "admin@aryarealestate.com";
  const [existingAdmin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  let authorId: number;
  if (existingAdmin) {
    console.log("✓ Admin user already exists — skipped");
    authorId = existingAdmin.id;
  } else {
    const passwordHash = await hashPassword("admin123");
    const [admin] = await db
      .insert(users)
      .values({
        name: "Admin",
        email: adminEmail,
        passwordHash,
        role: "admin",
      })
      .returning({ id: users.id });
    authorId = admin.id;
    console.log("✓ Inserted admin user (admin@aryarealestate.com / admin123)");
  }

  // 2. Site settings
  const [existingSettings] = await db.select().from(siteSettings).limit(1);
  if (existingSettings) {
    console.log("✓ Site settings already exist — skipped");
  } else {
    await db.insert(siteSettings).values({
      companyName: "Arya Real Estate",
      whatsappNumber: "+919978149329",
      email: "ankushpanchal18@gmail.com",
      tagline: "Trusted property consultancy in Ahmedabad",
      footerText:
        "Helping families across East and West Ahmedabad find the right property.",
      copyrightText: `© ${new Date().getFullYear()} Arya Real Estate. All rights reserved.`,
    });
    console.log("✓ Inserted site settings");
  }

  // 3. Offices — single Bopal address
  const existingOffices = await db.select().from(offices);
  let officeId: number | null = null;

  if (existingOffices.length > 0) {
    console.log("✓ Offices already exist — skipped");
    officeId = existingOffices[0]?.id ?? null;
  } else {
    const [office] = await db
      .insert(offices)
      .values({
        name: "Bopal Office",
        address: "467, Yash Meridian Complex, Bopal, Ahmedabad - 384001",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "384001",
        phoneNumbers: ["+91 99781 49329"],
        email: "ankushpanchal18@gmail.com",
        displayOrder: 0,
      })
      .returning({ id: offices.id });

    officeId = office.id;
    console.log("✓ Inserted Bopal office");
  }

  // 4. Social links
  const socialPlatforms = [
    { platform: "facebook" as const, url: "https://facebook.com" },
    { platform: "youtube" as const, url: "https://youtube.com" },
    { platform: "instagram" as const, url: "https://instagram.com" },
    { platform: "linkedin" as const, url: "https://linkedin.com" },
  ];

  if (officeId) {
    const existing = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.officeId, officeId));
    if (existing.length > 0) {
      console.log(`✓ Social links for office ${officeId} exist — skipped`);
    } else {
      await db.insert(socialLinks).values(
        socialPlatforms.map((s, i) => ({
          officeId,
          platform: s.platform,
          url: s.url,
          displayOrder: i,
        })),
      );
      console.log(`✓ Inserted social links for office ${officeId}`);
    }
  }

  // 5. Pages content
  const pageRows = [
    {
      pageKey: "about",
      title: "Building Trust Since 2012",
      content:
        "In 2012, brothers Harshad Prajapati and Sudhir Prajapati founded Arya Real Estate with a simple belief: every family in Ahmedabad deserves honest guidance when choosing a home. Today we advise buyers across East and West Ahmedabad with the same personal approach.",
      metaTitle: "About Arya Real Estate",
      metaDescription:
        "Learn about Arya Real Estate — Ahmedabad's trusted property consultancy since 2012.",
    },
    {
      pageKey: "mission",
      title: "Our Mission",
      content:
        "To empower every family in Ahmedabad to find their ideal property through honest guidance and deep local expertise — from first visit to final possession.",
    },
    {
      pageKey: "core_values",
      title: "Our Core Values",
      content:
        "Trust — Relationships first.\nTransparency — Clear communication at every step.\nResults — 2,200+ happy families.\nService — Support that lasts beyond closing.",
    },
  ];

  for (const row of pageRows) {
    const [exists] = await db
      .select({ id: pagesContent.id })
      .from(pagesContent)
      .where(eq(pagesContent.pageKey, row.pageKey))
      .limit(1);
    if (exists) {
      console.log(`✓ pages_content "${row.pageKey}" exists — skipped`);
    } else {
      await db.insert(pagesContent).values(row);
      console.log(`✓ Inserted pages_content "${row.pageKey}"`);
    }
  }

  // 6. Sample projects
  const existingProjects = await db.select({ id: projects.id }).from(projects).limit(1);
  if (existingProjects.length > 0) {
    console.log("✓ Projects already exist — skipped");
  } else {
    await db.insert(projects).values([
      {
        title: "Aaradhana Sky",
        slug: "aaradhana-sky",
        zone: "east",
        status: "ongoing",
        propertyType: "apartment",
        bhkOptions: ["2 BHK", "3 BHK"],
        displayPrice: "₹52L – ₹63L",
        location: "Nikol, East Ahmedabad",
        description:
          "Thoughtfully planned 2 & 3 BHK residences in Nikol with practical layouts and community amenities.",
        features: ["Covered parking", "24×7 security", "Landscaped garden"],
        reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD EAST/RAA12345/120426",
        possessionDate: "Dec 2027",
        isFeatured: true,
        displayOrder: 0,
      },
      {
        title: "Green Valley Villas",
        slug: "green-valley-villas",
        zone: "west",
        status: "completed",
        propertyType: "bungalow",
        bhkOptions: ["4 BHK", "5 BHK"],
        displayPrice: "₹1.8Cr onwards",
        location: "Bopal, West Ahmedabad",
        description:
          "Low-density bungalow living in Bopal with private gardens and contemporary elevational language.",
        features: ["Private garden", "Parking for 2 cars"],
        possessionDate: "Ready to Move",
        isFeatured: true,
        displayOrder: 1,
      },
      {
        title: "Sumel Business Hub",
        slug: "sumel-business-hub",
        zone: "east",
        status: "upcoming",
        propertyType: "commercial",
        bhkOptions: [],
        displayPrice: "₹45L onwards",
        location: "Odhav, East Ahmedabad",
        description:
          "Upcoming commercial address in Odhav suited to showrooms, clinics, and boutique offices.",
        features: ["Lift", "Parking", "Fire safety"],
        possessionDate: "2028",
        isFeatured: false,
        displayOrder: 2,
      },
    ]);
    console.log("✓ Inserted 3 sample projects");
  }

  // 7. Sample blog posts
  const existingPosts = await db.select({ id: blogPosts.id }).from(blogPosts).limit(1);
  if (existingPosts.length > 0) {
    console.log("✓ Blog posts already exist — skipped");
  } else {
    await db.insert(blogPosts).values([
      {
        title: "East Ahmedabad Growth Corridors in 2026",
        slug: "east-ahmedabad-growth-corridors-2026",
        excerpt:
          "A practical look at Nikol, Naroda, and Odhav — connectivity, pricing bands, and buyer profiles.",
        content:
          "## What's driving demand\n\nImproved ring-road access and clearer RERA timelines keep East Ahmedabad interest healthy.\n\n### Pricing bands to watch\n\n2 BHK tickets generally stay more competitive than western corridors.",
        category: "market-updates",
        tags: ["East Ahmedabad", "Market Trends"],
        status: "published",
        publishedAt: new Date("2026-03-12"),
        readTimeMinutes: 6,
        authorId,
      },
      {
        title: "First Home Buying Guide (Draft)",
        slug: "first-home-buying-guide-draft",
        excerpt: "A calm checklist for first-time buyers — still in draft.",
        content:
          "Budget framing, site visits, RERA checks, and loan paperwork — coming soon.",
        category: "buying-guide",
        tags: ["Buying Guide"],
        status: "draft",
        authorId,
        readTimeMinutes: 3,
      },
    ]);
    console.log("✓ Inserted 2 sample blog posts");
  }

  console.log("\nSeed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

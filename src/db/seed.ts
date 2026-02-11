import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { hash } from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
  });
  const db = drizzle(client, { schema });

  console.log("Seeding database...");

  // Seed admin user
  const hashedPassword = await hash(
    process.env.ADMIN_PASSWORD ?? "admin123",
    12
  );
  await db
    .insert(schema.users)
    .values({
      email: process.env.ADMIN_EMAIL ?? "admin@meamasque.com",
      hashedPassword,
      name: "Admin",
      role: "admin",
    })
    .onConflictDoNothing();

  console.log("✓ Admin user created");

  // Seed artists
  const artistData = [
    {
      name: "Mom",
      slug: "mom",
      bio: "Artist and storyteller.",
      relationship: "Mother",
    },
    {
      name: "Grandmother",
      slug: "grandmother",
      bio: "A talented artist whose works span decades.",
      relationship: "Grandmother",
    },
    {
      name: "Grandfather",
      slug: "grandfather",
      bio: "An artist with a distinctive style and vision.",
      relationship: "Grandfather",
    },
  ];

  for (const artist of artistData) {
    await db.insert(schema.artists).values(artist).onConflictDoNothing();
  }

  console.log("✓ Artists created");

  // Seed default categories
  const categoryData = [
    {
      name: "Paintings",
      slug: "paintings",
      description: "Oil, watercolor, and acrylic paintings",
    },
    {
      name: "Drawings",
      slug: "drawings",
      description: "Pencil, charcoal, and ink drawings",
    },
    {
      name: "Mixed Media",
      slug: "mixed-media",
      description: "Mixed media and collage works",
    },
  ];

  for (const category of categoryData) {
    await db.insert(schema.categories).values(category).onConflictDoNothing();
  }

  console.log("✓ Categories created");

  // Seed family access code
  const familyCode = await hash("family2024", 12);
  await db
    .insert(schema.familyAccess)
    .values({
      hashedCode: familyCode,
      label: "Default family code",
    })
    .onConflictDoNothing();

  console.log("✓ Family access code created (code: family2024)");

  console.log("\nSeeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

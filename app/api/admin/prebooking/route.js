import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";
import { rowToPrebooking } from "../../../../lib/serialize";
import { getSeedBooksForAdmin, getSeedEditionForAdmin } from "../../../../lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const [booksRes, preRes] = await Promise.all([
    admin.from("books").select("slug, title, cover, type, type_label").order("home_order", { ascending: true }),
    admin.from("prebooking").select("*"),
  ]);

  const preMap = {};
  for (const p of preRes.data || []) preMap[p.book_slug] = rowToPrebooking(p);

  const dbBooks = (booksRes.data || []).map((b) => ({
    slug: b.slug,
    title: b.title,
    cover: b.cover,
    type: b.type,
    type_label: b.type_label || "",
  }));
  // Empty database → show the static editions so nothing is blank here either.
  const books = dbBooks.length ? dbBooks : getSeedBooksForAdmin().map((b) => ({
    slug: b.slug,
    title: b.title,
    cover: b.cover,
    type: b.type,
    type_label: b.typeLabel || "",
  }));

  const items = books.map((b) => {
    const edition = preMap[b.slug] || getSeedEditionForAdmin(b.slug);
    return { book: b, edition };
  });

  return NextResponse.json({ items });
}

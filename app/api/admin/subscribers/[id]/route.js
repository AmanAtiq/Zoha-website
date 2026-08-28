import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { getAdminClient } from "../../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Subscriber ID is required." }, { status: 400 });
  }

  const { error } = await admin.from("subscribers").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

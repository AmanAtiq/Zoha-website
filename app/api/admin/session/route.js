import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";

export async function GET() {
  const token = await requireAdmin();
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

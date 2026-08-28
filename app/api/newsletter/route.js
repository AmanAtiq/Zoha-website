import { NextResponse } from "next/server";
import { getAdminClient, getDataClient } from "../../../lib/supabase-server";
import { addSubscriberToResendAudience, sendNewsletterWelcomeEmail } from "../../../lib/email";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const rawEmail = String(body.email || "").trim().toLowerCase();
  if (!rawEmail || !EMAIL_REGEX.test(rawEmail) || rawEmail.length > 254) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  // 1. Save to Supabase (if configured)
  const db = getAdminClient() || getDataClient();
  if (db) {
    const { error: dbError } = await db
      .from("subscribers")
      .upsert(
        {
          email: rawEmail,
          source: "website",
          status: "active",
        },
        { onConflict: "email" }
      );

    if (dbError) {
      console.warn("Supabase subscriber save notice:", dbError.message);
      // Even if database has a minor issue or table not created yet, we proceed to Resend
    }
  }

  // 2. Sync with Resend Audiences (if configured)
  await addSubscriberToResendAudience({ email: rawEmail });

  // 3. Send a warm welcome email (if Resend is configured)
  await sendNewsletterWelcomeEmail({ email: rawEmail });

  return NextResponse.json({
    ok: true,
    message: "Thank you for joining! You are now subscribed to the newsletter.",
  });
}

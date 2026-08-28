const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function sendCommentNotification({ bookSlug, episodeSlug, name, rating, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.AUTHOR_EMAIL || process.env.COMMENT_NOTIFICATION_EMAIL;
  const from = process.env.COMMENTS_FROM_EMAIL || "Zoha Asif Website <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.warn("Comment email skipped: RESEND_API_KEY and AUTHOR_EMAIL are required.");
    return;
  }

  const location = episodeSlug ? `${bookSlug} / ${episodeSlug}` : bookSlug;
  const subject = `New comment on ${location}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2f2526;">
      <h2 style="margin: 0 0 12px;">New reader comment</h2>
      <p><strong>Book:</strong> ${escapeHtml(bookSlug)}</p>
      ${episodeSlug ? `<p><strong>Episode:</strong> ${escapeHtml(episodeSlug)}</p>` : ""}
      <p><strong>Name:</strong> ${escapeHtml(name || "Reader")}</p>
      <p><strong>Rating:</strong> ${Number(rating || 5)} / 5</p>
      <p><strong>Comment:</strong></p>
      <blockquote style="border-left: 3px solid #8b2635; margin: 0; padding-left: 12px;">
        ${escapeHtml(text)}
      </blockquote>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Resend failed (${res.status})`);
  }
}

export async function addSubscriberToResendAudience({ email }) {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return { skipped: true, reason: "RESEND_API_KEY or RESEND_AUDIENCE_ID not configured" };
  }

  try {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      if (res.status === 400 || res.status === 409) {
        return { ok: true, existed: true };
      }
      console.warn(`Resend audience sync warning (${res.status}): ${errorText}`);
      return { ok: false, error: errorText };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, data };
  } catch (err) {
    console.warn("Resend audience sync network error:", err.message);
    return { ok: false, error: err.message };
  }
}

export async function sendNewsletterWelcomeEmail({ email }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL || process.env.COMMENTS_FROM_EMAIL || "Zoha Asif <onboarding@resend.dev>";

  if (!apiKey) return;

  const subject = "Welcome to Zoha Asif's Reader Circle";
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; color: #231b1c; line-height: 1.8;">
      <h2 style="font-family: Georgia, serif; color: #6b1e2d; font-size: 24px; margin-bottom: 16px; font-weight: normal;">
        Welcome to the Circle
      </h2>
      <p>Thank you for subscribing to my newsletter.</p>
      <p>You will be the first to receive new episodes, novel releases, and personal notes directly in your inbox.</p>
      <p style="font-style: italic; color: #5a4b4d; margin: 24px 0; padding-left: 14px; border-left: 2px solid #6b1e2d;">
        "Stories for the silent souls &mdash; where words find the feeling you never knew how to name."
      </p>
      <p style="margin-top: 32px;">Warmly,<br><strong style="color: #6b1e2d;">Zoha Asif</strong></p>
    </div>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject,
        html,
      }),
    });
  } catch (err) {
    console.warn("Welcome email send failed:", err.message);
  }
}

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

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}
function clean(value, max = 1500) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

export async function onRequestOptions({ request, env }) {
  const origin = request.headers.get("Origin");
  if (env.SITE_ORIGIN && origin && origin !== env.SITE_ORIGIN) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": env.SITE_ORIGIN || origin || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    }
  });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (env.SITE_ORIGIN && origin && origin !== env.SITE_ORIGIN) {
    return json({ ok: false, error: "Origin not allowed" }, 403);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: "Invalid JSON" }, 400); }

  const choices = {
    talk: "دوست دارم صحبت کنیم",
    time: "به زمان نیاز دارم",
    no: "فکر می‌کنم بهتره ادامه ندیم"
  };
  if (!Object.prototype.hasOwnProperty.call(choices, body.choice)) {
    return json({ ok: false, error: "Invalid choice" }, 400);
  }
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL || !env.FROM_EMAIL) {
    return json({ ok: false, error: "Email service is not configured" }, 503);
  }

  const escapeHtml = value => clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const timestamp = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "full", timeStyle: "long", timeZone: "Asia/Tehran"
  }).format(new Date());

  const html = `
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:2;color:#24143a">
      <h2>یک پاسخ جدید از صفحه نامه فاطمه</h2>
      <p><b>انتخاب:</b> ${escapeHtml(choices[body.choice])}</p>
      <p><b>زمان ثبت:</b> ${escapeHtml(timestamp)}</p>
      <hr>
      <p><b>${escapeHtml(body.responseTitle)}</b></p>
      <p>${escapeHtml(body.responseText)}</p>
    </div>`;

  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [env.NOTIFY_EMAIL],
      subject: `پاسخ جدید فاطمه: ${choices[body.choice]}`,
      html
    })
  });

  if (!sent.ok) return json({ ok: false, error: "Email provider rejected the message" }, 502);
  return json({ ok: true });
}

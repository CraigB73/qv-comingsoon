export async function onRequestPost(context) {
  const { request, env } = context;
  const turnstileSecret =
    env.TURNSTILE_SECRET_KEY ||
    (typeof process !== "undefined" && process.env ? process.env.TURNSTILE_SECRET_KEY : "");

  try {
    const formData = await request.formData();
    const honey = String(formData.get("_honey") || "").trim();
    if (honey) {
      return json({ ok: true }, 200);
    }

    const token = String(formData.get("cf-turnstile-response") || "").trim();
    if (!token) {
      return json({ error: "Please complete the verification step." }, 400);
    }

    if (!turnstileSecret) {
      return json({ error: "Turnstile secret is not configured." }, 500);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "";
    const verifyForm = new URLSearchParams();
    verifyForm.set("secret", turnstileSecret);
    verifyForm.set("response", token);
    if (ip) verifyForm.set("remoteip", ip);

    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: verifyForm.toString()
    });

    const verifyData = await verifyResponse.json();
    if (!verifyData.success) {
      return json({ error: "Verification failed. Please try again." }, 400);
    }

    const recipient = env.FORM_RECIPIENT || "info@quotevector.com";
    const forwardData = new FormData();
    for (const [key, value] of formData.entries()) {
      if (key === "cf-turnstile-response" || key === "_honey") continue;
      forwardData.append(key, value);
    }
    forwardData.set("_captcha", "false");

    const forwardResponse = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: forwardData
    });

    if (!forwardResponse.ok) {
      return json({ error: "Email forwarding failed. Please try again." }, 502);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    return json({ error: "Unexpected server error." }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS"
    }
  });
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

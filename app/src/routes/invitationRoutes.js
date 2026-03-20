import { Router } from 'express';

const invitationHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Mata Ki Chowki Invitation</title>
    <style>
      :root {
        color-scheme: light;
        --bg-start: #67080d;
        --bg-end: #3d0206;
        --card-start: rgba(135, 10, 22, 0.95);
        --card-end: rgba(94, 4, 11, 0.98);
        --gold: #f6d57a;
        --gold-soft: #ffe8a8;
        --cream: #fff4df;
        --rose: #ffd6d2;
        --shadow: rgba(20, 2, 6, 0.35);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Georgia", "Times New Roman", serif;
        background:
          radial-gradient(circle at top, rgba(255, 218, 128, 0.12), transparent 30%),
          linear-gradient(180deg, var(--bg-start), var(--bg-end));
        color: var(--cream);
      }

      .page {
        min-height: 100vh;
        display: flex;
        align-items: stretch;
        justify-content: center;
        padding: 18px 12px 28px;
      }

      .invite {
        width: min(100%, 430px);
        border-radius: 32px;
        position: relative;
        overflow: hidden;
        padding: 22px;
        background:
          radial-gradient(circle at top, rgba(255, 229, 156, 0.18), transparent 24%),
          linear-gradient(180deg, var(--card-start), var(--card-end));
        border: 1px solid rgba(246, 213, 122, 0.5);
        box-shadow: 0 18px 60px var(--shadow);
      }

      .invite::before,
      .invite::after {
        content: "";
        position: absolute;
        inset: 10px;
        border: 1.5px solid rgba(246, 213, 122, 0.35);
        border-radius: 24px;
        pointer-events: none;
      }

      .ornament {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: var(--gold);
        font-size: 0.9rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .divider {
        height: 1px;
        flex: 1;
        background: linear-gradient(90deg, transparent, rgba(246, 213, 122, 0.85), transparent);
      }

      .hero {
        text-align: center;
        padding: 18px 10px 10px;
      }

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(255, 244, 223, 0.1);
        color: var(--gold-soft);
        border: 1px solid rgba(255, 232, 168, 0.25);
        font-size: 0.78rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .mandala {
        width: 106px;
        height: 106px;
        margin: 18px auto 14px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: var(--gold-soft);
        border: 2px solid rgba(246, 213, 122, 0.7);
        box-shadow: inset 0 0 0 8px rgba(255, 233, 180, 0.08), 0 0 25px rgba(255, 207, 106, 0.16);
        background:
          radial-gradient(circle, rgba(255, 236, 186, 0.25) 0 30%, transparent 31%),
          radial-gradient(circle, rgba(255, 244, 223, 0.16), transparent 65%);
        font-size: 2.35rem;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.1rem, 10vw, 3rem);
        line-height: 1.02;
        color: var(--gold-soft);
      }

      .subtitle {
        margin: 12px auto 0;
        max-width: 260px;
        color: var(--rose);
        font-size: 1rem;
        line-height: 1.65;
      }

      .hosts,
      .details,
      .footer {
        position: relative;
        z-index: 1;
      }

      .hosts {
        margin-top: 22px;
        text-align: center;
        padding: 18px 16px;
        border-radius: 24px;
        background: rgba(255, 245, 228, 0.06);
        border: 1px solid rgba(246, 213, 122, 0.18);
      }

      .eyebrow {
        margin: 0 0 8px;
        color: var(--gold);
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-size: 0.72rem;
      }

      .hosts p,
      .detail-card p,
      .footer p {
        margin: 0;
      }

      .host-name {
        font-size: 1.45rem;
        color: var(--cream);
        margin-bottom: 8px;
      }

      .supporting {
        color: var(--rose);
        line-height: 1.7;
        font-size: 0.98rem;
      }

      .details {
        display: grid;
        gap: 14px;
        margin-top: 18px;
      }

      .detail-card {
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: 12px;
        align-items: start;
        padding: 16px;
        border-radius: 22px;
        background: rgba(255, 249, 238, 0.07);
        border: 1px solid rgba(246, 213, 122, 0.18);
      }

      .icon {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        border-radius: 16px;
        font-size: 1.3rem;
        background: rgba(246, 213, 122, 0.16);
        color: var(--gold-soft);
      }

      .detail-title {
        color: var(--gold);
        margin-bottom: 4px;
        font-size: 0.82rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .detail-copy {
        color: var(--cream);
        line-height: 1.65;
        font-size: 1rem;
      }

      .footer {
        text-align: center;
        margin-top: 20px;
        padding: 18px 14px 6px;
      }

      .footer p {
        color: var(--rose);
        line-height: 1.7;
        font-size: 0.96rem;
      }

      .blessing {
        margin-top: 14px;
        color: var(--gold-soft);
        font-size: 1.02rem;
      }

      @media (max-width: 360px) {
        .invite {
          padding: 18px;
          border-radius: 26px;
        }

        .detail-card {
          grid-template-columns: 1fr;
        }

        .icon {
          width: 42px;
          height: 42px;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="invite" aria-label="Mata Ki Chowki invitation">
        <div class="ornament" aria-hidden="true">
          <span class="divider"></span>
          <span>ॐ जय माता दी ॐ</span>
          <span class="divider"></span>
        </div>

        <header class="hero">
          <div class="hero-badge">Sacred Evening Invitation</div>
          <div class="mandala" aria-hidden="true">🪔</div>
          <h1>Mata Ki<br />Chowki</h1>
          <p class="subtitle">
            With the divine blessings of Maa Durga, we warmly invite you and your family to join us for an evening of bhajans, prayers, and prasad.
          </p>
        </header>

        <section class="hosts">
          <p class="eyebrow">Hosted by</p>
          <p class="host-name">The Sharma Family</p>
          <p class="supporting">
            Your presence will make this spiritual gathering even more graceful and auspicious.
          </p>
        </section>

        <section class="details">
          <article class="detail-card">
            <div class="icon" aria-hidden="true">📅</div>
            <div>
              <p class="detail-title">Date &amp; Time</p>
              <p class="detail-copy">Saturday, 6 April 2026<br />Chowki begins at 7:00 PM</p>
            </div>
          </article>

          <article class="detail-card">
            <div class="icon" aria-hidden="true">📍</div>
            <div>
              <p class="detail-title">Venue</p>
              <p class="detail-copy">Sharma Residence<br />24 Lotus Avenue, New Delhi</p>
            </div>
          </article>

          <article class="detail-card">
            <div class="icon" aria-hidden="true">🌸</div>
            <div>
              <p class="detail-title">Ceremony Flow</p>
              <p class="detail-copy">Bhajan Sandhya, Mata Aarti, followed by Prasad and Dinner.</p>
            </div>
          </article>
        </section>

        <footer class="footer">
          <p>
            Please arrive a little early to settle in and share the blessings with everyone gathered.
          </p>
          <p class="blessing">जय माता दी</p>
        </footer>
      </section>
    </main>
  </body>
</html>`;

export const createInvitationRoutes = () => {
  const router = Router();

  router.get('/invitations/mata-ki-chowki', (_req, res) => {
    res.type('html').send(invitationHtml);
  });

  return router;
};

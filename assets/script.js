// assets/script.js
(function () {
  // Wait for DOM so all selectors exist
  document.addEventListener("DOMContentLoaded", function () {
    const cfg = window.SITE_CONFIG || {};

    /* =============================
       1) Safe element helpers
    ============================= */
    function el(sel) { return document.querySelector(sel); }
    function setText(sel, value) { const n = el(sel); if (n && value != null) n.textContent = value; }
    function setHref(sel, value) { const n = el(sel); if (n && value) n.setAttribute("href", value); }

    /* =============================
       2) Populate hero & details
    ============================= */
    try {
      setText("[data-couple]", `${cfg?.couple?.a || "Greg"} & ${cfg?.couple?.b || "Drew"}`);
      setText("[data-date-time]", `${cfg?.event?.dateLong || ""} · ${cfg?.event?.time || ""}`);
      setText("[data-venue]", `${cfg?.event?.venueName || ""}, ${cfg?.event?.venueAddress || ""}`);

      setText("[data-dinner-name]", cfg?.event?.dinner?.name || "");
      setText("[data-dinner-address]", cfg?.event?.dinner?.address || "");
      setText("[data-dinner-time]", cfg?.event?.dinner?.time || "");
      setText("[data-notes]", cfg?.details?.notes || "");
      setText("[data-dress]", cfg?.details?.dressCode || "");
      if (cfg?.details?.rsvpBy) {
        setText("[data-rsvpby]", cfg.details.rsvpBy);
      } else {
        const card = el("[data-rsvpby]")?.closest(".info-card");
        if (card) card.style.display = "none";
      }
      const mono = cfg?.branding?.monogram || "G · D";
      const foot = `Crafted with ♥ for ${cfg?.couple?.a || "Greg"} & ${cfg?.couple?.b || "Drew"}`;
      setText("[data-monogram]", mono);
      setText("[data-footer]", foot);
    } catch (err) {
      console.warn("Content population issue:", err);
    }

    /* =============================
       3) Bullet-proof Maps buttons
    ============================= */
    try {
      const ceremonyAnchor = el("[data-venue-map]");
      const dinnerAnchor   = el("[data-dinner-map]");

      function buildMapsHref(address) {
        return "https://www.google.com/maps?q=" + encodeURIComponent(address || "");
      }

      // Ceremony href: prefer cfg.event.mapsUrl, then address, finally keep existing href
      if (ceremonyAnchor) {
        const cfgUrl = cfg?.event?.mapsUrl;
        const addr   = ceremonyAnchor.getAttribute("data-address") || cfg?.event?.venueAddress;
        const fallback = ceremonyAnchor.getAttribute("href") || "#";
        const finalHref = (typeof cfgUrl === "string" && /^https?:\/\//i.test(cfgUrl))
          ? cfgUrl
          : (addr ? buildMapsHref(addr) : fallback);
        ceremonyAnchor.setAttribute("href", finalHref);
        if (finalHref === "#") {
          ceremonyAnchor.classList.add("opacity-50", "pointer-events-none");
          ceremonyAnchor.title = "Map link not available";
        }
      }

      // Dinner href: prefer cfg.event.dinner.mapsUrl, then address, finally keep existing href
      if (dinnerAnchor) {
        const cfgUrl = cfg?.event?.dinner?.mapsUrl;
        const addr   = dinnerAnchor.getAttribute("data-address") || cfg?.event?.dinner?.address;
        const fallback = dinnerAnchor.getAttribute("href") || "#";
        const finalHref = (typeof cfgUrl === "string" && /^https?:\/\//i.test(cfgUrl))
          ? cfgUrl
          : (addr ? buildMapsHref(addr) : fallback);
        dinnerAnchor.setAttribute("href", finalHref);
        if (finalHref === "#") {
          dinnerAnchor.classList.add("opacity-50", "pointer-events-none");
          dinnerAnchor.title = "Map link not available";
        }
      }
    } catch (err) {
      console.warn("Maps wiring issue:", err);
    }

    /* =============================
       4) Attending “pill” toggles
          (supports either .seg style OR data-attend style)
    ============================= */
    try {
      // (A) Modern pattern with #attending-group and data-attend
      const attendingGroup = document.getElementById("attending-group");
      if (attendingGroup) {
        const labels = Array.from(attendingGroup.querySelectorAll("label[data-attend]"));
        function setActive(label) {
          labels.forEach(l => l.classList.remove("bg-slate-900","text-white","border-slate-900","seg-active"));
          label.classList.add("bg-slate-900","text-white","border-slate-900","seg-active");
          const input = label.querySelector("input[type='radio']");
          if (input) input.checked = true;
        }
        labels.forEach(l => {
          l.style.cursor = "pointer";
          l.addEventListener("click", () => setActive(l));
        });
        // ensure initial state reflects any prechecked radio
        const checked = attendingGroup.querySelector("input[type='radio']:checked");
        if (checked) {
          const parent = checked.closest("label[data-attend]");
          if (parent) setActive(parent);
        }
      }

      // (B) Legacy pattern with label.seg + input[name='attending']
      const legacySegLabels = Array.from(document.querySelectorAll("label.seg"));
      const legacyRadios    = Array.from(document.querySelectorAll("input[name='attending']"));
      if (legacySegLabels.length && legacyRadios.length) {
        function legacySetActive(lbl) {
          legacySegLabels.forEach(l => l.classList.remove("seg-active","bg-slate-900","text-white","border-slate-900"));
          lbl.classList.add("seg-active","bg-slate-900","text-white","border-slate-900");
          const input = lbl.querySelector("input[type='radio']");
          if (input) input.checked = true;
        }
        legacySegLabels.forEach(lbl => {
          lbl.style.cursor = "pointer";
          lbl.addEventListener("click", () => legacySetActive(lbl));
        });
        const checked = document.querySelector("input[name='attending']:checked");
        if (checked) {
          const lbl = checked.closest("label.seg");
          if (lbl) legacySetActive(lbl);
        }
        legacyRadios.forEach(r => r.addEventListener("change", () => {
          const lbl = r.closest("label.seg");
          if (lbl) legacySetActive(lbl);
        }));
      }
    } catch (err) {
      console.warn("Attending pill issue:", err);
    }

    /* =============================
       5) Dietary checkbox highlights
    ============================= */
    try {
      const dietInputs = document.querySelectorAll("input[name='dietary']");
      dietInputs.forEach(input => {
        const label = input.closest("label");
        if (!label) return;
        label.classList.add("cursor-pointer");
        function updateLabel() {
          if (input.checked) {
            label.classList.add("bg-slate-900","text-white","border-slate-900");
          } else {
            label.classList.remove("bg-slate-900","text-white","border-slate-900");
          }
        }
        label.addEventListener("click", () => setTimeout(updateLabel, 0));
        input.addEventListener("change", updateLabel);
        updateLabel(); // initial
      });
    } catch (err) {
      console.warn("Dietary highlight issue:", err);
    }

    /* =============================
       6) Toast helper (minimal)
    ============================= */
    const toast = (msg, good=false) => {
      const t = document.getElementById("toast");
      if (!t) return alert(msg);
      t.textContent = msg;
      t.className = "fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow " + (good ? "bg-emerald-600 text-white" : "bg-rose-600 text-white");
      t.style.display = "block";
      setTimeout(()=> t.style.display = "none", 3000);
    };

    /* =============================
       7) Serialise RSVP data
    ============================= */
    function serialiseForm(form) {
      const fd = new FormData(form);
      const obj = {};
      fd.forEach((v, k) => {
        if (obj[k]) {
          if (!Array.isArray(obj[k])) obj[k] = [obj[k]];
          obj[k].push(v);
        } else {
          obj[k] = v;
        }
      });
      // dietary checkboxes -> array
      const diet = Array.from(form.querySelectorAll("input[name='dietary']:checked")).map(i => i.value);
      const other = (form.querySelector("input[name='dietaryOther']")?.value || "").trim();
      if (other) diet.push("Other: " + other);
      obj.dietary = diet;
      // attending (works for both legacy and modern layouts)
      const attendingInput = form.querySelector("input[name='attending']:checked");
      if (attendingInput) obj.attending = attendingInput.value;
      return obj;
    }

    /* =============================
       8) Submission (Formspree + mailto fallback)
    ============================= */
    const form = document.getElementById("rsvp-form");
    const submitBtn = document.getElementById("submit-btn");

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = serialiseForm(form);
        const first = (data.firstName || "").toString().trim();
        const last  = (data.lastName  || "").toString().trim();
        const email = (data.email     || "").toString().trim();
        if (!first || !last || !email) {
          toast("Please enter your name and email.");
          return;
        }

        // Disable button while submitting
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Submitting…";
        }

        const payload = {
          ...data,
          couple: `${cfg?.couple?.a || "Greg"} & ${cfg?.couple?.b || "Drew"}`,
          event: cfg?.event || {},
          timestamp: new Date().toISOString(),
        };

        const endpoint = (cfg?.formspreeEndpoint || "").trim();

        if (endpoint) {
          try {
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Accept": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Formspree error " + res.status);
            toast("Thank you! Your RSVP was submitted.", true);
            form.reset();

            // Re-apply visual states after reset
            // (attending pills)
            const yesLabel = document.querySelector("#attending-group label[data-attend='yes']") ||
                             document.querySelector("label.seg input[value='yes']")?.closest("label.seg");
            document.querySelectorAll("#attending-group label[data-attend], label.seg").forEach(l => {
              l.classList.remove("bg-slate-900","text-white","border-slate-900","seg-active");
            });
            if (yesLabel) yesLabel.classList.add("bg-slate-900","text-white","border-slate-900","seg-active");

            // (dietary)
            document.querySelectorAll("input[name='dietary']").forEach(i => {
              const lbl = i.closest("label");
              if (lbl) lbl.classList.remove("bg-slate-900","text-white","border-slate-900");
            });

          } catch (err) {
            console.error(err);
            toast("We couldn't reach the RSVP service. We'll open an email instead.");
            openMailFallback(payload, cfg);
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Submit RSVP";
            }
          }
          return;
        }

        // No endpoint -> open email
        openMailFallback(payload, cfg);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit RSVP";
        }
      });
    }

    function openMailFallback(payload, cfg) {
      const subject = encodeURIComponent(`RSVP — ${cfg?.couple?.a || "Greg"} & ${cfg?.couple?.b || "Drew"}`);
      const lines = [
        `Name: ${payload.firstName || ""} ${payload.lastName || ""}`,
        `Email: ${payload.email || ""}`,
        payload.phone ? `Phone: ${payload.phone}` : null,
        payload.attending ? `Attending: ${payload.attending}` : null,
        payload.guests ? `Guests (incl. you): ${payload.guests}` : null,
        `Dietary: ${payload.dietary && payload.dietary.length ? payload.dietary.join(", ") : "None"}`,
        payload.song ? `Song request: ${payload.song}` : null,
        payload.note ? `Note: ${payload.note}` : null,
      ].filter(Boolean).join("\n");
      const body = encodeURIComponent(lines);
      const to = cfg?.contactEmail || "drewbrownlee@hotmail.com";
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    }

  });
})();

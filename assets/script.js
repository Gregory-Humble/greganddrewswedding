
(function () {
  const cfg = window.SITE_CONFIG || {};
    // --- Make the attending pills toggle visually ---
  const segLabels = document.querySelectorAll("label.seg");
  const attendingRadios = document.querySelectorAll("input[name='attending']");

  function updateAttendingUI() {
    // remove current active
    segLabels.forEach(l => l.classList.remove("seg-active"));
    // add active to the checked radio's label
    const checked = document.querySelector("input[name='attending']:checked");
    if (checked) {
      const lbl = checked.closest("label.seg");
      if (lbl) lbl.classList.add("seg-active");
    }
  }

  // run once on load
  updateAttendingUI();
  // update on any change/click
  attendingRadios.forEach(r => {
    r.addEventListener("change", updateAttendingUI);
    r.addEventListener("click", updateAttendingUI);
  });

  // Populate hero and details
  function el(sel){ return document.querySelector(sel); }
  el("[data-couple]").textContent = `${cfg.couple.a} & ${cfg.couple.b}`;
  el("[data-date-time]").textContent = `${cfg.event.dateLong} · ${cfg.event.time}`;
  el("[data-venue]").textContent = `${cfg.event.venueName}, ${cfg.event.venueAddress}`;
  el("[data-venue-map]").setAttribute("href", cfg.event.mapsUrl);
  el("[data-dinner-name]").textContent = cfg.event.dinner.name;
  el("[data-dinner-address]").textContent = cfg.event.dinner.address;
  el("[data-dinner-time]").textContent = cfg.event.dinner.time;
  el("[data-dinner-map]").setAttribute("href", cfg.event.dinner.mapsUrl);
  el("[data-notes]").textContent = cfg.details.notes;
  el("[data-dress]").textContent = cfg.details.dressCode;
  if (cfg.details.rsvpBy) {
    el("[data-rsvpby]").textContent = cfg.details.rsvpBy;
  } else {
    el("[data-rsvpby]").closest(".info-card").style.display = "none";
  }
  el("[data-monogram]").textContent = cfg.branding.monogram;
  el("[data-footer]").textContent = `Crafted with ♥ for ${cfg.couple.a} & ${cfg.couple.b}`;

  // RSVP logic
  const form = document.getElementById("rsvp-form");
  const submitBtn = document.getElementById("submit-btn");
  const toast = (msg, good=false) => {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.className = "fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow " + (good ? "bg-emerald-600 text-white" : "bg-rose-600 text-white");
    t.style.display = "block";
    setTimeout(()=> t.style.display = "none", 3000);
  };

  function serialise(form) {
    const fd = new FormData(form);
    const obj = {};
    fd.forEach((v,k)=>{
      if (obj[k]) {
        if (!Array.isArray(obj[k])) obj[k] = [obj[k]];
        obj[k].push(v);
      } else {
        obj[k]=v;
      }
    });
    // dietary checkboxes
    const diet = Array.from(form.querySelectorAll("input[name='dietary']:checked")).map(i=>i.value);
    if (form.querySelector("input[name='dietaryOther']").value.trim()) {
      diet.push("Other: " + form.querySelector("input[name='dietaryOther']").value.trim());
    }
    obj.dietary = diet;
    return obj;
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const data = serialise(form);
    if (!data.firstName || !data.lastName || !data.email) {
      toast("Please enter your name and email.");
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    const payload = {
      ...data,
      couple: `${cfg.couple.a} & ${cfg.couple.b}`,
      event: cfg.event,
      timestamp: new Date().toISOString(),
    };

    const endpoint = (cfg.formspreeEndpoint || "").trim();
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Network");
        toast("Thank you! Your RSVP was submitted.", true);
        form.reset();
      } catch (e) {
        fallbackEmail(payload);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit RSVP";
      }
      return;
    }
    // No endpoint configured → email fallback
    fallbackEmail(payload);
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit RSVP";
  });

  function fallbackEmail(payload){
    toast("Opening your email app…", true);
    const subject = encodeURIComponent(`RSVP — ${cfg.couple.a} & ${cfg.couple.b}`);
    const lines = [
      `Name: ${payload.firstName} ${payload.lastName}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      `Attending: ${payload.attending}`,
      `Guests (incl. you): ${payload.guests}`,
      `Dietary: ${payload.dietary && payload.dietary.length ? payload.dietary.join(", ") : "None"}`,
      payload.song ? `Song request: ${payload.song}` : null,
      payload.note ? `Note: ${payload.note}` : null,
    ].filter(Boolean).join("\n");
    const body = encodeURIComponent(lines);
    window.location.href = `mailto:${cfg.contactEmail}?subject=${subject}&body=${body}`;
  }
})();

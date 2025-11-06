Greg & Drew — Wedding Invitation (Static Site)
=============================================

How to publish this website in 3 minutes (no coding):

1) Create a GitHub account (if you don't have one): https://github.com
2) Create a new repository named: greg-drew-wedding (or anything you like)
3) Upload all files from this folder into that repository (drag and drop in the browser)
4) Turn it into a website:
   - In your repo, go to Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: main
   - Folder: / (root)
   - Save. Wait ~1–3 minutes.
   - Your site will appear at: https://<your-username>.github.io/<repo-name>/

RSVP Options
------------
• Easiest (already works): when someone submits the form, it opens an email to drewbrownlee@hotmail.com with their answers.
• Best (recommended): Formspree — create a free form endpoint and paste it into assets/config.js as formspreeEndpoint.
  Steps:
   - Go to https://formspree.io/forms
   - Create a form (no code)
   - Copy your endpoint URL (looks like https://formspree.io/f/xxxxxx)
   - Open assets/config.js and paste it into formspreeEndpoint: "<your-endpoint>"
   - Save and upload the changed file to GitHub (the form will submit silently to you).

Custom Domain (greganddrewaregettingmarried.com.au)
---------------------------------------------------
1) Buy the domain at an Australian registrar (e.g. VentraIP, CrazyDomains, GoDaddy AU).
   Note: .com.au domains usually require an ABN/ACN or other local eligibility.
2) In your GitHub repo: Settings → Pages → "Custom domain"
   - Enter your domain: greganddrewaregettingmarried.com.au
   - GitHub will tell you which DNS records to add (CNAME).
3) In your domain registrar's DNS panel:
   - Add a CNAME record for the root or 'www' host pointing to: <your-username>.github.io
   - Save. DNS can take a while to update.
4) Back in GitHub Pages, enable HTTPS. You're done.

Updating Details
----------------
Edit assets/config.js to change names, date, venues, email, dress code, notes, and RSVP deadline.
No other files need to be changed for simple text updates.
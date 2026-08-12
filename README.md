# maxboving.com

Personal portfolio for Max Boving, built as a dependency-free static site.

## Local preview

Open `index.html` directly, or serve the directory with any static server:

```sh
python3 -m http.server 8000
```

## GitHub Pages

The included workflow deploys the repository to GitHub Pages on every push to `main`.

1. In the repository settings, open **Pages** and set the source to **GitHub Actions**.
2. Add `maxboving.com` as the custom domain in the Pages settings.
3. At your DNS provider, point the apex domain at GitHub Pages using GitHub’s current A records, and add a CNAME for `www` to your GitHub Pages hostname.

## Personal links

Update the LinkedIn, GitHub, and Cal.com URLs in `index.html` if your handles or scheduling provider differ. The profile image is stored as `portrait.jpg`, and the resume is `MaxBov_Resume_june.pdf`.

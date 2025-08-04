// This file helps Cloudflare Pages understand this is a static site
export default {
  fetch() {
    return new Response('Static site', { status: 404 });
  }
};

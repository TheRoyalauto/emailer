export default {
  providers: [
    {
      // SITE_URL should be your frontend URL (e.g., https://www.e-mailer.io)
      // This controls which origins can make authenticated requests
      domain: process.env.SITE_URL ?? process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};

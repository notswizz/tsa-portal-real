import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicons / tab icon – use brand logo */}
        <link rel="icon" type="image/png" href="/logo.webp" />
        {/* iOS home-screen icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/logo.webp"
        />

        {/* Brand theming */}
        <meta name="theme-color" content="#ff2f92" />

        {/* Open Graph defaults for sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="The Smith Agency" />
        <meta
          property="og:title"
          content="The Smith Agency · Client & Staff Portal"
        />
        <meta
          property="og:description"
          content="Access The Smith Agency client and staff portals to manage bookings, shows, and showroom staffing."
        />
        <meta
          property="og:image"
          content="https://smithagency.app/logo.webp"
        />
        <meta property="og:image:alt" content="The Smith Agency logo" />

        {/* Twitter / X card defaults */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="The Smith Agency · Client & Staff Portal"
        />
        <meta
          name="twitter:description"
          content="Access The Smith Agency client and staff portals to manage bookings, shows, and showroom staffing."
        />
        <meta
          name="twitter:image"
          content="https://smithagency.app/logo.webp"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Google Maps Places API for address autocomplete */}
        <script
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />
      </body>
    </Html>
  );
}

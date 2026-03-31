import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ACA Tizenkét Lépés",
    short_name: "ACA 12",
    description: "Mini ACA gyűlés jellegű alkalmazás a 12 lépés tanulására, gyakorlására és rögzítésére.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6ede3",
    theme_color: "#f6ede3",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/apple-icon.svg",
        type: "image/svg+xml"
      }
    ]
  };
}

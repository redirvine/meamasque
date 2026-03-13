import {
  Playfair_Display,
  Cormorant_Garamond,
  EB_Garamond,
  Libre_Baskerville,
  DM_Serif_Display,
  Crimson_Pro,
  Spectral,
  Antic_Didone,
  Bodoni_Moda,
  Tenor_Sans,
} from "next/font/google";

// Classic museum serifs
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600", "700"] });
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: ["400", "700"] });
const baskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"] });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"] });
const crimson = Crimson_Pro({ subsets: ["latin"], weight: ["400", "700"] });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "700"] });
const anticDidone = Antic_Didone({ subsets: ["latin"], weight: ["400"] });
const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "700"] });
// Elegant sans for a modern museum feel
const tenorSans = Tenor_Sans({ subsets: ["latin"], weight: ["400"] });

const fonts = [
  { name: "1. Playfair Display", note: "High-contrast Didone serif — MoMA / gallery catalog feel", className: playfair.className },
  { name: "2. Cormorant Garamond", note: "Light, airy Garamond — fine art & literary journals", className: cormorant.className },
  { name: "3. EB Garamond", note: "Classic old-style serif — The Met, Smithsonian style", className: ebGaramond.className },
  { name: "4. Libre Baskerville", note: "Refined transitional serif — traditional museum signage", className: baskerville.className },
  { name: "5. DM Serif Display", note: "Bold display serif — exhibition titles & posters", className: dmSerif.className },
  { name: "6. Bodoni Moda", note: "Dramatic Didone — fashion-meets-gallery elegance", className: bodoni.className },
  { name: "7. Crimson Pro", note: "Warm, readable serif — Tate / National Gallery vibe", className: crimson.className },
  { name: "8. Spectral", note: "Modern serif optimized for screen — contemporary museum", className: spectral.className },
  { name: "9. Antic Didone", note: "Understated Didone — minimal gallery aesthetic", className: anticDidone.className },
  { name: "10. Tenor Sans", note: "Elegant sans-serif — modern art museum signage", className: tenorSans.className },
];

export default function FontPreviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Font Preview — Museum Style</h1>
      <p className="mb-10 text-sm text-gray-500">
        Each card shows the font applied to headers, navigation, and body text.
      </p>

      <div className="space-y-10">
        {fonts.map((font) => (
          <div key={font.name} className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              {font.name}
            </p>
            <p className="mb-4 text-xs text-gray-400">{font.note}</p>

            {/* Simulated site header */}
            <div className="mb-6 rounded-md bg-gray-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className={`text-xl font-bold tracking-tight text-white ${font.className}`}>
                  Meamasque
                </span>
                <div className="hidden gap-5 sm:flex">
                  <span className={`text-sm font-medium text-gray-300 ${font.className}`}>Masks</span>
                  <span className={`text-sm font-medium text-white ${font.className}`}>Mixed Media</span>
                  <span className={`text-sm font-medium text-gray-300 ${font.className}`}>Plays</span>
                  <span className={`text-sm font-medium text-gray-300 ${font.className}`}>Ancestors</span>
                </div>
              </div>
            </div>

            {/* Simulated page content */}
            <div className={font.className}>
              <h2 className="text-3xl font-bold">The Enchanted Mask</h2>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>Mixed Media &middot; 2023</p>
              </div>
              <p className="mt-4 leading-relaxed text-gray-700">
                A striking mixed-media piece combining traditional mask-making
                techniques with modern sculptural elements. The interplay of
                texture and color evokes a sense of ancient ritual meeting
                contemporary expression.
              </p>
              <h3 className="mt-6 text-xl font-semibold">Gallery Items</h3>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {["Venetian Dreams", "Forest Spirit", "Golden Hour"].map((title) => (
                  <div key={title} className="rounded-md border p-3">
                    <div className="mb-2 h-20 rounded bg-gray-100" />
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-gray-500">2024</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { BRAND, CONTACT, LOGO, SITE_URL, SOCIAL } from "@/lib/content/site";
import { INSTITUTIONS } from "@/lib/content/universities";
import { FAQS } from "@/lib/content/faq";
import { AMBASSADOR } from "@/lib/content/ambassador";
import { PROGRAMMES } from "@/lib/content/schools";
import { FIGURES } from "@/lib/content/numbers";

/**
 * Structured data.
 *
 * One `@graph` rather than a pile of separate script tags: every node carries
 * an `@id`, so the organisation, its campuses, its programmes, the ambassador,
 * the film, the site and the FAQ reference each other instead of floating as
 * unrelated blobs. That is the difference between a crawler seeing forty facts
 * and a crawler seeing one institution.
 *
 * Answer engines lean on the same graph. Three things are here specifically for
 * them:
 *
 *   - `EducationalOccupationalProgram` per featured degree, each with its
 *     provider and, where one exists, the industry partner as a second
 *     `provider`. "Which universities teach chip design with Truechip" is a
 *     question only this markup can answer.
 *   - `VideoObject` for the announcement, so the film is quotable as a thing
 *     rather than as an opaque iframe.
 *   - FAQ answers carried in full rather than trimmed, because a model lifting
 *     one should come away with a complete sentence.
 *
 * Nothing here is generated from anything but the content the page renders, so
 * the two cannot drift.
 */

const id = (fragment: string) => `${SITE_URL}/#${fragment}`;

const ADDRESSES: Record<string, Record<string, string>> = {
  jaipur: {
    "@type": "PostalAddress",
    streetAddress: "Plot No. IS-2036 to IS-2039, Ramchandrapura, Vidhani, Sitapura Extension",
    addressLocality: "Jaipur",
    addressRegion: "Rajasthan",
    postalCode: "303905",
    addressCountry: "IN",
  },
  ncr: {
    "@type": "PostalAddress",
    streetAddress: "NCR Campus II, North Extension, Matsya Industrial Area",
    addressLocality: "Alwar",
    addressRegion: "Rajasthan",
    postalCode: "301001",
    addressCountry: "IN",
  },
  foundation: {
    "@type": "PostalAddress",
    streetAddress: "Shri Ram Ki Nangal, Via Sitapura RIICO, Tonk Road",
    addressLocality: "Jaipur",
    addressRegion: "Rajasthan",
    postalCode: "302022",
    addressCountry: "IN",
  },
};

const campusNode = (i: (typeof INSTITUTIONS)[number]) => ({
  "@type": "CollegeOrUniversity",
  "@id": id(i.id),
  name: i.name,
  alternateName: i.id === "jaipur" ? "JU Jaipur" : i.short,
  description: i.body,
  url: i.site,
  address: ADDRESSES[i.id],
  parentOrganization: { "@id": id("organisation") },
  ...(i.id === "foundation"
    ? {}
    : {
        potentialAction: {
          "@type": "ApplyAction",
          name: `Apply to ${i.name}`,
          target: i.apply,
        },
      }),
});

/**
 * One node per featured degree. `provider` carries the university; `educational
 * CredentialAwarded` carries the award as the portal words it; the partner goes
 * in as a second provider, which is the only honest way to say "co-designed
 * with" in this vocabulary.
 */
const programmeNode = (p: (typeof PROGRAMMES)[number]) => ({
  "@type": "EducationalOccupationalProgram",
  "@id": id(`programme-${p.slug}`),
  name: p.name,
  description: p.why,
  educationalCredentialAwarded: p.award,
  programType: "Undergraduate",
  educationalProgramMode: "full-time",
  occupationalCategory: p.school,
  provider: [
    { "@id": id("jaipur") },
    ...(p.partner ? [{ "@type": "Organization", name: p.partner }] : []),
  ],
  offers: {
    "@type": "Offer",
    category: "Admission",
    url: "https://jecrcuapplication.jecrcuniversity.edu.in/application-form",
    availability: "https://schema.org/InStock",
  },
});

export function buildGraph() {
  const lead = FIGURES.filter((f) => f.scale === "lead" || f.scale === "mid");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EducationalOrganization", "CollegeOrUniversity"],
        "@id": id("organisation"),
        name: BRAND.group,
        legalName: BRAND.legalName,
        alternateName: ["JECRC Group", "JECRC University"],
        slogan: BRAND.tagline,
        description:
          "JECRC is a group of three institutions in Rajasthan, India: JECRC University in Jaipur, JECRC University's NCR campus in Alwar, and JECRC Foundation, the Jaipur Engineering College and Research Centre.",
        url: SITE_URL,
        logo: {
          // WebP, not the PNG this used to name. The PNG was the last thing
          // keeping the brand marks' working files inside `public/` — it was
          // the one path in the whole site that pointed at an intermediate
          // rather than at the artwork the page itself uses. The .webp beside
          // it is lossless, is what every <img> on the site already loads, and
          // is a format Google's structured-data image guidance accepts.
          "@type": "ImageObject",
          "@id": id("logo"),
          url: `${SITE_URL}${LOGO.lockup}`,
          width: 557,
          height: 258,
          caption: `${BRAND.name} lockup`,
        },
        image: { "@id": id("logo") },
        foundingDate: String(BRAND.foundedYear),
        address: ADDRESSES.jaipur,
        areaServed: { "@type": "Country", name: "India" },
        telephone: CONTACT.admissionsPhone,
        email: CONTACT.email,
        sameAs: SOCIAL.map((s) => s.href),
        subOrganization: INSTITUTIONS.map((i) => ({ "@id": id(i.id) })),
        alumni: { "@type": "QuantitativeValue", value: 34000 },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "admissions",
            telephone: CONTACT.admissionsPhone,
            email: CONTACT.email,
            areaServed: "IN",
            availableLanguage: ["en", "hi"],
          },
          {
            "@type": "ContactPoint",
            contactType: "admissions",
            name: "Alwar NCR campus",
            telephone: CONTACT.ncrPhone,
            email: CONTACT.ncrEmail,
            areaServed: "IN",
            availableLanguage: ["en", "hi"],
          },
        ],
        hasCredential: PROGRAMMES.map((p) => ({ "@id": id(`programme-${p.slug}`) })),
        // The published record, as machine-readable claims rather than as
        // sentences a model has to parse out of the page.
        additionalProperty: lead.map((f) => ({
          "@type": "PropertyValue",
          name: f.label,
          value: `${f.value}${f.unit ?? ""}`,
          description: f.detail,
        })),
      },

      ...INSTITUTIONS.map(campusNode),
      ...PROGRAMMES.map(programmeNode),

      {
        "@type": "Person",
        "@id": id("ambassador"),
        name: AMBASSADOR.name,
        jobTitle: "Brand ambassador",
        description: `${AMBASSADOR.name} became part of the JECRC story in ${AMBASSADOR.announced}.`,
        image: `${SITE_URL}${AMBASSADOR.portrait}`,
        worksFor: { "@id": id("organisation") },
      },
      {
        "@type": "VideoObject",
        "@id": id("announcement"),
        name: AMBASSADOR.watchTitle,
        description: `The announcement film for ${AMBASSADOR.name} joining the JECRC story.`,
        thumbnailUrl: `https://i.ytimg.com/vi/${AMBASSADOR.watchVideoId}/maxresdefault.jpg`,
        uploadDate: "2026-04-01",
        embedUrl: `https://www.youtube-nocookie.com/embed/${AMBASSADOR.watchVideoId}`,
        contentUrl: AMBASSADOR.watchHref,
        publisher: { "@id": id("organisation") },
        about: { "@id": id("ambassador") },
      },

      {
        "@type": "WebSite",
        "@id": id("website"),
        url: SITE_URL,
        name: `${BRAND.group}, ${BRAND.tagline}`,
        inLanguage: "en-IN",
        publisher: { "@id": id("organisation") },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: `${BRAND.group}, ${BRAND.tagline}`,
        description:
          "JECRC University Jaipur, JECRC University Alwar NCR and JECRC Foundation: programmes, placements, admissions and the record.",
        isPartOf: { "@id": id("website") },
        about: { "@id": id("organisation") },
        primaryImageOfPage: `${SITE_URL}/opengraph-image.png`,
        inLanguage: "en-IN",
        breadcrumb: { "@id": id("breadcrumb") },
      },
      {
        "@type": "BreadcrumbList",
        "@id": id("breadcrumb"),
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "JECRC", item: SITE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": id("faq"),
        isPartOf: { "@id": id("webpage") },
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/** Ready to drop into a <script type="application/ld+json"> tag. */
export const jsonLd = () => JSON.stringify(buildGraph());

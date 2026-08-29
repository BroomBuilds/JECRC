import { BRAND, CONTACT, SITE_URL, SOCIAL } from "@/lib/content/site";
import { INSTITUTIONS } from "@/lib/content/universities";
import { FAQS } from "@/lib/content/faq";
import { AMBASSADOR } from "@/lib/content/ambassador";

/**
 * Structured data.
 *
 * One `@graph` rather than a pile of separate script tags: every node carries an
 * `@id`, so the university, its two campuses, the founding college, the site and
 * the FAQ all reference each other instead of floating as unrelated blobs. That
 * is the difference between a crawler seeing four facts and a crawler seeing one
 * organisation.
 *
 * Answer engines lean on the same graph, which is why the FAQ answers are the
 * full prose from the page rather than a trimmed variant.
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

export function buildGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": id("organisation"),
        name: BRAND.group,
        legalName: BRAND.legalName,
        alternateName: "JECRC Group",
        slogan: BRAND.tagline,
        description:
          "JECRC is a group of three institutions in Rajasthan, India: JECRC University in Jaipur, JECRC University's NCR campus in Alwar, and JECRC Foundation, the Jaipur Engineering College and Research Centre.",
        url: SITE_URL,
        logo: `${SITE_URL}/brand/jecrc-lockup.png`,
        foundingDate: String(BRAND.foundedYear),
        address: ADDRESSES.jaipur,
        telephone: CONTACT.admissionsPhone,
        email: CONTACT.email,
        sameAs: SOCIAL.map((s) => s.href),
        subOrganization: INSTITUTIONS.map((i) => ({ "@id": id(i.id) })),
        alumni: { "@type": "QuantitativeValue", value: 34000 },
      },
      ...INSTITUTIONS.map(campusNode),
      {
        "@type": "Person",
        "@id": id("ambassador"),
        name: AMBASSADOR.name,
        jobTitle: "Brand ambassador",
        description: `${AMBASSADOR.name} became the face of JECRC University in ${AMBASSADOR.announced}.`,
        worksFor: { "@id": id("organisation") },
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
        isPartOf: { "@id": id("website") },
        about: { "@id": id("organisation") },
        primaryImageOfPage: `${SITE_URL}/media/tour/poster.jpg`,
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

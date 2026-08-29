/** Placement record, as published for the 2025-26 season. */

export const PLACEMENT_STATS = [
  { value: "₹33", unit: "LPA", label: "Highest package" },
  { value: "2,104", unit: "+", label: "Offers this season" },
  { value: "856", unit: "", label: "Fortune 500 offers" },
  { value: "200", unit: "+", label: "Recruiters on campus" },
] as const;

export const PLACEMENT_DETAIL = [
  { label: "Average package", value: "₹6 LPA" },
  { label: "Top 30 percent average", value: "₹10.7 LPA" },
  { label: "Placement season", value: "230 days" },
  { label: "Placements in five years", value: "12,000+" },
] as const;

/** Named on the university's own placements page. */
export const RECRUITERS = [
  "Amazon", "Microsoft", "Google", "TCS", "Infosys", "Wipro", "IBM", "Cisco",
  "Deloitte", "Capgemini", "Cognizant", "HCL Tech", "L&T Technology Services",
  "ITC Limited", "Paytm", "Zomato", "Flipkart", "Decathlon", "HDFC Life",
  "Bajaj Capital", "Nestlé", "Tata AIG", "IndiaMART", "Blinkit", "Unicharm",
] as const;

export const GROUP_STATS = [
  { value: "34,000+", label: "Alumni worldwide" },
  { value: "35", label: "Countries" },
  { value: "200+", label: "Alumni and incubated startups" },
  { value: "28+ Cr", label: "Research grants secured" },
] as const;

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Landmark, IndianRupee, Sprout, Droplets, Shield } from "lucide-react";

interface Policy {
  id: string;
  title: string;
  ministry: string;
  date: string;
  category: "subsidy" | "insurance" | "scheme" | "irrigation" | "advisory";
  summary: string;
  details: string;
  link: string;
  isNew?: boolean;
}

const policies: Policy[] = [
  {
    id: "p1",
    title: "Namo Shetkari Maha Sanman Nidhi",
    ministry: "Maharashtra Govt.",
    date: "Jun 2025",
    category: "scheme",
    summary: "₹6,000/year additional benefit on top of PM-KISAN for Maharashtra farmers.",
    details: "Under this scheme, eligible farmers registered with PM-KISAN receive an additional ₹6,000 annually from the Maharashtra state government, making the combined benefit ₹12,000 per year. Payments are in three equal installments directly to bank accounts.",
    link: "https://krishi.maharashtra.gov.in",
    isNew: true,
  },
  {
    id: "p2",
    title: "PM-KISAN 20th Installment",
    ministry: "Govt. of India",
    date: "May 2025",
    category: "scheme",
    summary: "Next ₹2,000 installment to be credited to 9.5 crore farmer accounts.",
    details: "The PM Kisan Samman Nidhi 20th installment will credit ₹2,000 directly to farmer bank accounts. Ensure your Aadhaar is linked and e-KYC is complete on the PM-KISAN portal to avoid payment rejection.",
    link: "https://pmkisan.gov.in",
    isNew: true,
  },
  {
    id: "p3",
    title: "Pradhan Mantri Fasal Bima Yojana",
    ministry: "Agri. Ministry",
    date: "Apr 2025",
    category: "insurance",
    summary: "Kharif 2025 crop insurance enrollment open till July 31, 2025.",
    details: "Farmers can enroll in PMFBY for Kharif 2025 season through nearest bank branch or Common Service Centre. Premium rate is 2% for Kharif crops. Coverage includes pest damage, drought, flood, and post-harvest losses.",
    link: "https://pmfby.gov.in",
  },
  {
    id: "p4",
    title: "Maharashtra Drought Relief Package",
    ministry: "Relief & Rehab Dept.",
    date: "Mar 2025",
    category: "subsidy",
    summary: "₹5,700 per hectare compensation for Marathwada drought-affected farmers.",
    details: "Farmers in drought-notified districts of Marathwada and Vidarbha are eligible for input subsidy of ₹5,700/hectare for irrigated land and ₹3,500/hectare for rain-fed land. Applications accepted at Taluka Agriculture Office.",
    link: "https://mahadbt.maharashtra.gov.in",
  },
  {
    id: "p5",
    title: "MahaDBT Farmer Scheme Portal",
    ministry: "MahaDBT",
    date: "Jun 2025",
    category: "subsidy",
    summary: "Apply for 40+ agri-machinery & irrigation subsidies at up to 55% benefit.",
    details: "The MahaDBT portal provides direct benefit transfers for agricultural equipment, drip irrigation, solar pumps, and more. Subsidies range from 40–55% depending on category. Applications available online on a first-come-first-serve basis.",
    link: "https://mahadbt.maharashtra.gov.in",
    isNew: true,
  },
  {
    id: "p6",
    title: "Smart Irrigation Mission — Drip Subsidy",
    ministry: "Water Resources Dept.",
    date: "Feb 2025",
    category: "irrigation",
    summary: "75% subsidy on drip irrigation systems for small & marginal farmers.",
    details: "Small and marginal farmers (up to 5 acres) are eligible for 75% subsidy on drip/sprinkler irrigation systems under the Maharashtra Micro Irrigation Scheme. Apply at the District Agriculture Office with land documents and Aadhaar.",
    link: "https://krishi.maharashtra.gov.in",
  },
];

const categoryConfig = {
  subsidy: { label: "Subsidy", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  insurance: { label: "Insurance", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  scheme: { label: "Scheme", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  irrigation: { label: "Irrigation", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  advisory: { label: "Advisory", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
};

const categoryIcon = {
  subsidy: IndianRupee,
  insurance: Shield,
  scheme: Landmark,
  irrigation: Droplets,
  advisory: Sprout,
};

const PolicyCard = ({ policy }: { policy: Policy }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = categoryIcon[policy.category];
  const catCfg = categoryConfig[policy.category];

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 transition-all hover:shadow-sm">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-agrigreen" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catCfg.color}`}>
              {catCfg.label}
            </span>
            {policy.isNew && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 animate-pulse">
                NEW
              </span>
            )}
            <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">{policy.date}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">{policy.title}</h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{policy.ministry}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5">{policy.summary}</p>

          {expanded && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-2">
              {policy.details}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-[11px] text-agrigreen font-medium hover:underline"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> Details</>}
            </button>
            <a
              href={policy.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-blue-500 font-medium hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> Apply
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const GovernmentPolicies = () => {
  const [filter, setFilter] = useState<string>("all");
  const categories = ["all", "scheme", "subsidy", "insurance", "irrigation"];

  const filtered = filter === "all" ? policies : policies.filter(p => p.category === filter);

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize transition-all ${
              filter === cat
                ? "bg-agrigreen text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {cat === "all" ? "All" : categoryConfig[cat as keyof typeof categoryConfig]?.label}
          </button>
        ))}
      </div>

      {/* Policy list */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        {filtered.map(policy => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3">
        Updated Jun 2025 • Source: Maharashtra Krishi Vibhag
      </p>
    </div>
  );
};

export default GovernmentPolicies;

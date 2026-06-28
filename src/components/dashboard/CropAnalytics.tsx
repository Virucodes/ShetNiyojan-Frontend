import { Sprout, TrendingUp, IndianRupee, Calendar, BarChart3, AlertCircle, Leaf } from "lucide-react";

interface Yield {
  id: string;
  name: string;
  acres: number;
  status: string;
  health: number;
  plantDate: string;
}

interface CropAnalyticsProps {
  crop: Yield | null;
}

// Crop-specific data approximations
const CROP_DATA: Record<string, { duration: number; pricePerQuintal: number; yieldPerAcre: number; costPerAcre: number }> = {
  wheat:     { duration: 120, pricePerQuintal: 2275, yieldPerAcre: 18, costPerAcre: 12000 },
  rice:      { duration: 135, pricePerQuintal: 2183, yieldPerAcre: 22, costPerAcre: 14000 },
  cotton:    { duration: 160, pricePerQuintal: 6620, yieldPerAcre: 8,  costPerAcre: 18000 },
  soybean:   { duration: 100, pricePerQuintal: 4600, yieldPerAcre: 12, costPerAcre: 10000 },
  sugarcane: { duration: 365, pricePerQuintal: 340,  yieldPerAcre: 250, costPerAcre: 22000 },
  onion:     { duration: 110, pricePerQuintal: 1500, yieldPerAcre: 80, costPerAcre: 16000 },
  tomato:    { duration: 90,  pricePerQuintal: 1200, yieldPerAcre: 120, costPerAcre: 20000 },
  maize:     { duration: 100, pricePerQuintal: 2090, yieldPerAcre: 20, costPerAcre: 9000 },
  corn:      { duration: 100, pricePerQuintal: 2090, yieldPerAcre: 20, costPerAcre: 9000 },
  jowar:     { duration: 115, pricePerQuintal: 3180, yieldPerAcre: 10, costPerAcre: 8000 },
  bajra:     { duration: 85,  pricePerQuintal: 2500, yieldPerAcre: 9,  costPerAcre: 7000 },
  tur:       { duration: 180, pricePerQuintal: 7000, yieldPerAcre: 5,  costPerAcre: 8000 },
  gram:      { duration: 110, pricePerQuintal: 5440, yieldPerAcre: 6,  costPerAcre: 9000 },
  groundnut: { duration: 125, pricePerQuintal: 6377, yieldPerAcre: 12, costPerAcre: 13000 },
  default:   { duration: 120, pricePerQuintal: 2000, yieldPerAcre: 15, costPerAcre: 12000 },
};

const GROWTH_STAGES = [
  { label: "Germination", pct: 10, color: "bg-yellow-400" },
  { label: "Vegetative", pct: 35, color: "bg-green-400" },
  { label: "Flowering", pct: 60, color: "bg-blue-400" },
  { label: "Grain Fill",  pct: 80, color: "bg-orange-400" },
  { label: "Maturity",   pct: 100, color: "bg-agrigreen" },
];

function getCropData(name: string) {
  const key = name.toLowerCase().split(" ")[0];
  return CROP_DATA[key] || CROP_DATA.default;
}

function getDaysSincePlanting(plantDate: string): number {
  if (!plantDate) return 0;
  const planted = new Date(plantDate);
  if (isNaN(planted.getTime())) return 0;
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24)));
}

function getGrowthStage(daysPct: number) {
  if (daysPct <= 10)  return GROWTH_STAGES[0];
  if (daysPct <= 35)  return GROWTH_STAGES[1];
  if (daysPct <= 60)  return GROWTH_STAGES[2];
  if (daysPct <= 80)  return GROWTH_STAGES[3];
  return GROWTH_STAGES[4];
}

function getEstimatedHarvest(plantDate: string, duration: number): string {
  if (!plantDate) return "N/A";
  const planted = new Date(plantDate);
  if (isNaN(planted.getTime())) return "N/A";
  const harvest = new Date(planted.getTime() + duration * 24 * 60 * 60 * 1000);
  return harvest.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const CropAnalytics = ({ crop }: CropAnalyticsProps) => {
  if (!crop) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
          <Sprout className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No active crop</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add a yield to see analytics</p>
      </div>
    );
  }

  const cropData = getCropData(crop.name);
  const days = getDaysSincePlanting(crop.plantDate);
  const pctComplete = Math.min(100, Math.round((days / cropData.duration) * 100));
  const stage = getGrowthStage(pctComplete);
  const daysLeft = Math.max(0, cropData.duration - days);
  const estimatedHarvest = getEstimatedHarvest(crop.plantDate, cropData.duration);
  const totalCost = Math.round(cropData.costPerAcre * crop.acres);
  const totalYieldQ = Math.round(cropData.yieldPerAcre * crop.acres);
  const expectedRevenue = Math.round(totalYieldQ * cropData.pricePerQuintal);
  const estimatedProfit = expectedRevenue - totalCost;
  const healthScore = crop.health || Math.max(60, 90 - Math.round(pctComplete * 0.1));

  return (
    <div className="space-y-3">
      {/* Crop header */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40">
        <div className="w-9 h-9 rounded-lg bg-agrigreen/10 dark:bg-agrigreen/20 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-agrigreen" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{crop.name}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{crop.acres} acres • {crop.status}</p>
        </div>
        <div className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
          healthScore >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
          healthScore >= 60 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" :
          "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
        }`}>
          {healthScore}% Health
        </div>
      </div>

      {/* Growth Progress */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Growth Progress
          </span>
          <span className="text-xs font-bold text-agrigreen">{pctComplete}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${stage.color} rounded-full transition-all duration-500`}
            style={{ width: `${pctComplete}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Stage: <span className="font-semibold text-gray-600 dark:text-gray-300">{stage.label}</span></span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{days}d planted</span>
        </div>
      </div>

      {/* Stage markers */}
      <div className="flex gap-1">
        {GROWTH_STAGES.map((s, i) => (
          <div key={i} className="flex-1 text-center">
            <div className={`h-1 rounded-full mb-1 ${pctComplete >= s.pct ? s.color : "bg-gray-200 dark:bg-gray-600"}`} />
            <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-none hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Est. Harvest</span>
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{estimatedHarvest}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{daysLeft} days left</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Input Cost</span>
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-100">₹{totalCost.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">₹{cropData.costPerAcre.toLocaleString("en-IN")}/ac</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-agrigreen" />
            <span className="text-[10px] text-green-700 dark:text-green-400 font-medium">Exp. Revenue</span>
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-100">₹{expectedRevenue.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{totalYieldQ} quintals</p>
        </div>
        <div className={`rounded-xl p-2.5 ${estimatedProfit >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className={`w-3.5 h-3.5 ${estimatedProfit >= 0 ? "text-emerald-600" : "text-red-500"}`} />
            <span className={`text-[10px] font-medium ${estimatedProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              Est. Profit
            </span>
          </div>
          <p className={`text-xs font-bold ${estimatedProfit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
            {estimatedProfit >= 0 ? "+" : ""}₹{Math.abs(estimatedProfit).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">MSP based</p>
        </div>
      </div>

      {/* Tip */}
      {pctComplete < 100 && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/40">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-yellow-700 dark:text-yellow-300">
            {pctComplete < 30
              ? "Early stage: ensure optimal soil moisture and protect from pests."
              : pctComplete < 65
              ? "Growing phase: monitor for nutrient deficiency and disease signs."
              : "Nearing harvest: reduce irrigation and plan market route early."}
          </p>
        </div>
      )}

      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
        Estimates based on MSP & avg. Maharashtra yield data
      </p>
    </div>
  );
};

export default CropAnalytics;

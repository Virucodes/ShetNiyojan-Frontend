import { useState, useEffect } from "react";
import { 
  ArrowUpRight, Leaf, Activity, Droplets, Clock,
  Archive, Home, Truck, MapPin, Plus, Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import YieldModal from "@/components/dashboard/YieldModal";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/common/DashboardHeader";
import { yields as yieldsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import GovernmentPolicies from "@/components/dashboard/GovernmentPolicies";
import CropAnalytics from "@/components/dashboard/CropAnalytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define the Yield type
interface Yield {
  id: string;
  name: string;
  acres: number;
  status: "growing" | "harvested" | "planning" | "Inactive" | "inactive";
  health: number;
  plantDate: string;
  userId: string;
}

const Dashboard = () => {
  const [showAddYieldModal, setShowAddYieldModal] = useState(false);
  const [showPreviousYieldsModal, setShowPreviousYieldsModal] = useState(false);
  const [userYields, setUserYields] = useState<Yield[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeYields, setActiveYields] = useState<Yield[]>([]);
  const [inactiveYields, setInactiveYields] = useState<Yield[]>([]);
  
  useEffect(() => {
    const fetchYields = async () => {
      try {
        setLoading(true);
        const response = await yieldsApi.getAll();
        setUserYields(response);
        const active = response.filter((y: Yield) => y.status !== "Inactive" && y.status !== "inactive");
        const inactive = response.filter((y: Yield) => y.status === "Inactive" || y.status === "inactive");
        setActiveYields(active);
        setInactiveYields(inactive);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load your yields.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchYields();
  }, [user, toast]);
  
  const handleAddYield = async (data: { name: string; acres: number; mobileno: string }) => {
    try {
      const response = await fetch("http://localhost:5000/api/yields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, acres: data.acres, mobileno: data.mobileno }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to add yield");
      if (!result.status) result.status = 'planning';
      setUserYields(prev => [...prev, result]);
      setActiveYields(prev => [...prev, result]);
      toast({ title: "Yield Added", description: `${data.name} (${data.acres} acres) added.` });
      setShowAddYieldModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error ? String((error as Error).message) : "Failed to add yield.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteYield = async (yieldId: string) => {
    try {
      await yieldsApi.delete(yieldId);
      setUserYields(prev => prev.filter(y => y.id !== yieldId));
      setActiveYields(prev => prev.filter(y => y.id !== yieldId));
      setInactiveYields(prev => prev.filter(y => y.id !== yieldId));
      toast({ title: "Yield Deleted", description: "Yield successfully deleted." });
    } catch {
      toast({ title: "Error", description: "Failed to delete yield.", variant: "destructive" });
    }
  };

  const firstActiveCrop = activeYields[0] || null;

  return (
    <div className="bg-agriBg dark:bg-gray-950 min-h-screen w-full transition-colors duration-200">
      <div className="w-full h-full p-2 sm:p-4">
        <DashboardHeader />

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4">
          {/* Sidebar */}
          <div className="hidden md:block md:col-span-1 md:h-[calc(100vh-2rem)]">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-1 md:col-span-11 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            
            {/* ============ LEFT COLUMN (2/3) ============ */}
            <div className="col-span-1 lg:col-span-2 space-y-3 sm:space-y-4">
              
              {/* Current Yields Card */}
              <Card className="p-3 sm:p-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg dark:text-gray-100">Current Yields</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreviousYieldsModal(true)}
                      className="flex items-center gap-1 text-xs dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Archive className="w-3.5 h-3.5" /> Previous
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowAddYieldModal(true)}
                      className="flex items-center gap-1 bg-agrigreen hover:bg-agrigreen-dark text-white"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Yield
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agrigreen" />
                    </div>
                  ) : activeYields.length > 0 ? (
                    activeYields.map(yieldItem => (
                      <div
                        key={yieldItem.id}
                        className="flex items-center p-3 bg-agrigreen/5 dark:bg-agrigreen/10 rounded-xl border border-agrigreen/15 dark:border-agrigreen/20 cursor-pointer hover:bg-agrigreen/10 dark:hover:bg-agrigreen/15 transition-all group"
                        onClick={() => navigate(`/yield/${yieldItem.id}`)}
                      >
                        <div className="bg-agrigreen/10 dark:bg-agrigreen/20 p-2 rounded-full mr-3">
                          <Leaf className="w-5 h-5 text-agrigreen" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{yieldItem.name}</h3>
                          <div className="flex flex-wrap text-xs text-gray-500 dark:text-gray-400">
                            <span>{yieldItem.acres} acres</span>
                            <span className="mx-2 hidden sm:inline">•</span>
                            <span>{yieldItem.plantDate ? new Date(yieldItem.plantDate).toLocaleDateString('en-IN') : 'No date'}</span>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          yieldItem.status === 'growing' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                          yieldItem.status === 'harvested' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}>
                          {yieldItem.status.charAt(0).toUpperCase() + yieldItem.status.slice(1)}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-agrigreen ml-2 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                      <Leaf className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No active yields yet.</p>
                      <p className="text-xs mt-1">Click "New Yield" to get started.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Features Grid */}
              <Card className="p-3 sm:p-4 dark:bg-gray-900 dark:border-gray-800">
                <h2 className="font-bold text-lg mb-4 dark:text-gray-100">Farm Tools</h2>

                {/* Phase 1 */}
                <div className="mb-5">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg mr-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm dark:text-gray-200">Phase 1 — Planning</h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Before planting season</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <FeatureCard
                      icon={<Activity className="w-7 h-7 text-blue-500" />}
                      bg="bg-blue-500/10 dark:bg-blue-900/30"
                      dot="bg-blue-500"
                      title="AI Crop Prediction"
                      desc="Recommendations & yield forecast"
                      onClick={() => navigate('/crop-prediction')}
                    />
                    <FeatureCard
                      icon={<MapPin className="w-7 h-7 text-pink-500" />}
                      bg="bg-pink-500/10 dark:bg-pink-900/30"
                      dot="bg-pink-500"
                      title="Lease Marketplace"
                      desc="Equipment rental & field planning"
                      onClick={() => navigate('/leasemarket')}
                    />
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="mb-5">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg mr-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm dark:text-gray-200">Phase 2 — Growing</h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">During cultivation period</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <FeatureCard
                      icon={<Leaf className="w-7 h-7 text-agrigreen" />}
                      bg="bg-agrigreen/10 dark:bg-agrigreen/20"
                      dot="bg-agrigreen"
                      title="Crop Health"
                      desc="Disease detection & tracking"
                      onClick={() => navigate('/crop-health')}
                    />
                    <FeatureCard
                      icon={<Droplets className="w-7 h-7 text-cyan-500" />}
                      bg="bg-cyan-500/10 dark:bg-cyan-900/30"
                      dot="bg-cyan-500"
                      title="Smart Irrigation"
                      desc="Water optimization & scheduling"
                    />
                  </div>
                </div>

                {/* Phase 3 */}
                <div>
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-lg mr-2">
                      <Archive className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm dark:text-gray-200">Phase 3 — Harvest</h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Post-harvest management</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <FeatureCard
                      icon={<Truck className="w-7 h-7 text-purple-500" />}
                      bg="bg-purple-500/10 dark:bg-purple-900/30"
                      dot="bg-purple-500"
                      title="Supply Chain"
                      desc="Transport & logistics"
                      onClick={() => navigate('/supply-chain')}
                    />
                    <FeatureCard
                      icon={<Archive className="w-7 h-7 text-gray-500" />}
                      bg="bg-gray-500/10 dark:bg-gray-700/40"
                      dot="bg-gray-400"
                      title="Previous Yields"
                      desc="Historical data & performance"
                      onClick={() => setShowPreviousYieldsModal(true)}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* ============ RIGHT COLUMN ============ */}
            <div className="col-span-1 space-y-3 sm:space-y-4">
              
              {/* Season Summary */}
              <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm dark:text-gray-100">Current Season</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                    Kharif 2025
                  </span>
                </div>
                <div className="text-center mb-3">
                  <div className="text-5xl font-black text-agrigreen">{activeYields.length}</div>
                  <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">Active Yield{activeYields.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {activeYields.reduce((s, y) => s + y.acres, 0).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Total Acres</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{inactiveYields.length}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Previous Yields</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAddYieldModal(true)}
                  className="w-full bg-agrigreen hover:bg-agrigreen-dark text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add New Yield
                </Button>
              </Card>

              {/* Crop Analytics */}
              <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm dark:text-gray-100">Crop Analytics</h3>
                  {firstActiveCrop && (
                    <button
                      onClick={() => navigate(`/yield/${firstActiveCrop.id}`)}
                      className="text-[11px] text-agrigreen font-medium flex items-center gap-0.5 hover:underline"
                    >
                      Full view <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <CropAnalytics crop={firstActiveCrop} />
              </Card>

              {/* Government Policies */}
              <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm dark:text-gray-100 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-agrigreen" />
                    Govt. Policies
                  </h3>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Maharashtra</span>
                </div>
                <GovernmentPolicies />
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center z-10 py-1.5">
          <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-0.5 px-3 py-1 text-agrigreen">
            <Home className="h-5 w-5" />
            <span className="text-[10px]">Home</span>
          </button>
          <button onClick={() => navigate('/supply-chain')} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 dark:text-gray-400">
            <Truck className="h-5 w-5" />
            <span className="text-[10px]">Supply</span>
          </button>
          <button onClick={() => navigate('/crop-health')} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 dark:text-gray-400">
            <Leaf className="h-5 w-5" />
            <span className="text-[10px]">Health</span>
          </button>
          <button onClick={() => navigate('/leasemarket')} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 dark:text-gray-400">
            <MapPin className="h-5 w-5" />
            <span className="text-[10px]">Market</span>
          </button>
        </div>

        {/* Add Yield Modal */}
        {showAddYieldModal && (
          <YieldModal
            onClose={() => setShowAddYieldModal(false)}
            onSubmit={handleAddYield}
          />
        )}

        {/* Previous Yields Modal */}
        {showPreviousYieldsModal && (
          <Dialog open={showPreviousYieldsModal} onOpenChange={setShowPreviousYieldsModal}>
            <DialogContent className="sm:max-w-md max-w-[90%] dark:bg-gray-900 dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Archive className="h-5 w-5 text-gray-500" /> Previous Yields
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Yields marked as inactive.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                {inactiveYields.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                    <Archive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No previous yields found.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 mt-2">
                    {inactiveYields.map(yieldItem => (
                      <div
                        key={yieldItem.id}
                        className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                        onClick={() => { navigate(`/yield/${yieldItem.id}`); setShowPreviousYieldsModal(false); }}
                      >
                        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full mr-3">
                          <Leaf className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm dark:text-gray-200 truncate">{yieldItem.name}</h3>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{yieldItem.acres} acres • Inactive</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

// Feature Card Sub-component
interface FeatureCardProps {
  icon: React.ReactNode;
  bg: string;
  dot: string;
  title: string;
  desc: string;
  onClick?: () => void;
}

const FeatureCard = ({ icon, bg, dot, title, desc, onClick }: FeatureCardProps) => (
  <Card
    className={`p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 ${!onClick ? "opacity-70 cursor-default" : ""}`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center text-center">
      <div className={`${bg} p-3 rounded-xl mb-2.5 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold text-sm dark:text-gray-100 leading-tight">{title}</h3>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
    </div>
    <div className={`absolute top-2 right-2 h-2 w-2 ${dot} rounded-full`} />
    {!onClick && (
      <span className="absolute bottom-1.5 right-2 text-[9px] text-gray-300 dark:text-gray-600">Soon</span>
    )}
  </Card>
);

export default Dashboard;
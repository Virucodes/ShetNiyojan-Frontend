import { useState, useEffect, useRef } from "react";
import { X, User, Phone, Mail, MapPin, Tractor, Sprout, Save, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { profile as profileApi, UserProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_CROPS = [
  "Wheat", "Rice", "Cotton", "Soybean", "Sugarcane", "Onion", "Tomato",
  "Maize", "Jowar", "Bajra", "Tur (Arhar)", "Gram", "Groundnut", "Potato",
  "Brinjal", "Chilli", "Turmeric", "Garlic", "Moong", "Urad"
];

const ProfilePanel = ({ isOpen, onClose }: ProfilePanelProps) => {
  const { user } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullname: "",
    email: "",
    address: "",
    total_acres: 0,
    preferred_crops: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropPicker, setShowCropPicker] = useState(false);

  // Load profile on open
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      profileApi.get()
        .then(data => {
          setFormData({
            fullname: data.fullname || "",
            email: data.email || "",
            address: data.address || "",
            total_acres: data.total_acres || 0,
            preferred_crops: data.preferred_crops || [],
          });
        })
        .catch(() => {
          // fallback to auth context data
          setFormData(prev => ({ ...prev, fullname: user?.fullname || "" }));
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, user]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      setTimeout(() => document.addEventListener("mousedown", handleClick), 100);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  const toggleCrop = (crop: string) => {
    setFormData(prev => {
      const crops = prev.preferred_crops || [];
      if (crops.includes(crop)) {
        return { ...prev, preferred_crops: crops.filter(c => c !== crop) };
      } else {
        return { ...prev, preferred_crops: [...crops, crop] };
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await profileApi.update(formData);
      setIsSaved(true);
      toast.success("Profile saved successfully!");
      setTimeout(() => setIsSaved(false), 2500);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save profile.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
          bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-agrigreen/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-agrigreen flex items-center justify-center text-white font-bold text-lg shadow">
              {(formData.fullname || user?.fullname || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base">My Profile</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">+91 {user?.mobileno}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-agrigreen animate-spin" />
            </div>
          ) : (
            <>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <User size={12} /> Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullname || ""}
                  onChange={e => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-agrigreen/40 focus:border-agrigreen transition"
                />
              </div>

              {/* Mobile (read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Phone size={12} /> Mobile Number
                </label>
                <div className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span className="text-gray-400">🇮🇳 +91</span>
                  <span>{user?.mobileno}</span>
                  <span className="ml-auto text-[10px] text-gray-400">Verified</span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-agrigreen/40 focus:border-agrigreen transition"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <MapPin size={12} /> Village / Address
                </label>
                <textarea
                  value={formData.address || ""}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Village, Taluka, District, Maharashtra"
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-agrigreen/40 focus:border-agrigreen transition resize-none"
                />
              </div>

              {/* Total Farm Acres */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Tractor size={12} /> Total Farm Area (Acres)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={formData.total_acres || ""}
                  onChange={e => setFormData(prev => ({ ...prev, total_acres: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g. 5.5"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-agrigreen/40 focus:border-agrigreen transition"
                />
              </div>

              {/* Preferred Crops */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Sprout size={12} /> Preferred Crops
                </label>

                {/* Selected chips */}
                {(formData.preferred_crops || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.preferred_crops || []).map(crop => (
                      <button
                        key={crop}
                        onClick={() => toggleCrop(crop)}
                        className="flex items-center gap-1 text-xs bg-agrigreen/10 text-agrigreen dark:bg-agrigreen/20 border border-agrigreen/30 px-2.5 py-1 rounded-full font-medium hover:bg-agrigreen/20 transition"
                      >
                        {crop}
                        <X size={10} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Picker toggle */}
                <button
                  onClick={() => setShowCropPicker(p => !p)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-agrigreen transition"
                >
                  <ChevronDown size={13} className={`transition-transform ${showCropPicker ? "rotate-180" : ""}`} />
                  {showCropPicker ? "Hide crop list" : "Select crops"}
                </button>

                {showCropPicker && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {COMMON_CROPS.map(crop => {
                      const selected = (formData.preferred_crops || []).includes(crop);
                      return (
                        <button
                          key={crop}
                          onClick={() => toggleCrop(crop)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                            selected
                              ? "bg-agrigreen text-white border-agrigreen shadow-sm"
                              : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-agrigreen hover:text-agrigreen"
                          }`}
                        >
                          {crop}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recommendations hint */}
              {(formData.preferred_crops || []).length > 0 && (formData.total_acres || 0) > 0 && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">💡 Recommendations enabled</p>
                  <p className="text-[11px] text-green-600 dark:text-green-500">
                    Based on your {formData.total_acres} acres and {(formData.preferred_crops || []).length} crop preference{(formData.preferred_crops || []).length > 1 ? "s" : ""},
                    you'll receive tailored government scheme alerts and AI crop suggestions.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white bg-agrigreen hover:bg-agrigreen-dark disabled:opacity-60 transition-all shadow-sm"
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving…</>
            ) : isSaved ? (
              <><CheckCircle2 size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Profile</>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePanel;

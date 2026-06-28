import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Truck, TrendingUp, Send, Globe, Map as MapIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHeader from './common/DashboardHeader';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

const statesAndDistricts: Record<string, string[]> = {
  "Maharashtra": ["Pune", "Mumbai", "Nashik", "Nagpur", "Kolhapur", "Solapur", "Aurangabad", "Ahmednagar", "Satara", "Jalgaon"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Anand", "Mehsana"],
  "Karnataka": ["Bangalore", "Belgaum", "Dharwad", "Mysore", "Kolar", "Tumkur"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Ujjain", "Jabalpur", "Dhar", "Dewas"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Hapur"]
};

// Local data for fallback commodities
const commoditiesData = [
  "Rice", "Wheat", "Maize", "Potato", "Onion", "Tomato", 
  "Soybean", "Sugarcane", "Cotton", "Jowar", "Bajra"
];

interface OptimizationResult {
  current_city: string;
  best_city: string;
  best_net_profit: number;
  recommend_transport: boolean;
  city_details: {
    [city: string]: {
      price_per_kg: number;
      transport_cost: number;
      net_profit: number;
      distance: number;
      coordinates: [number, number];
    };
  };
}

const SupplyChain: React.FC = () => {
  const [currentState, setCurrentState] = useState<string>('Maharashtra');
  const [currentDistrict, setCurrentDistrict] = useState<string>('Pune');
  const [crop, setCrop] = useState<string>('Rice');
  const [cropWeight, setCropWeight] = useState<string>('100');
  const [loading, setLoading] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [commoditiesList, setCommoditiesList] = useState<string[]>([]);
  const [loadingCommodities, setLoadingCommodities] = useState<boolean>(false);

  // Fetch commodities list dynamically when state or district changes
  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        setLoadingCommodities(true);
        const response = await axios.get(`${API_BASE_URL}/mandi/commodities`, {
          params: { state: currentState, district: currentDistrict }
        });
        if (response.data && response.data.commodities) {
          setCommoditiesList(response.data.commodities);
          // Auto-select first commodity if current one is not in the list
          if (response.data.commodities.length > 0 && !response.data.commodities.includes(crop)) {
            setCrop(response.data.commodities[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching commodities:", err);
        setCommoditiesList(commoditiesData); // Fallback to local defaults
      } finally {
        setLoadingCommodities(false);
      }
    };
    fetchCommodities();
  }, [currentState, currentDistrict]);

  const handleOptimize = async () => {
    if (!currentState || !currentDistrict || !crop || !cropWeight || parseFloat(cropWeight) <= 0) {
      toast.error('Please fill all fields with valid values');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/mandi/optimize-transport`, {
        state: currentState,
        district: currentDistrict,
        crop,
        crop_weight_kg: parseFloat(cropWeight)
      });
      
      if (response.data && response.data.status === "success") {
        setOptimizationResult(response.data);
        setShowMap(true);
        toast.success('Transport optimization completed');
      } else {
        throw new Error("Failed to optimize");
      }
    } catch (error) {
      console.error('Error during optimization:', error);
      toast.error('Failed to optimize transport route');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMap = () => {
    setShowMap(true);
  };

  const getCityCoordinates = (cityName: string) => {
    const details = optimizationResult?.city_details[cityName];
    return details ? details.coordinates : [0, 0];
  };

  // Function to normalize coordinates for the SVG viewport dynamically
  const normalizeCoordinates = (lat: number, lng: number) => {
    let minLat = 16.0;
    let maxLat = 20.5;
    let minLng = 72.5;
    let maxLng = 76.0;

    // Calculate bounds dynamically from returned markets
    if (optimizationResult && Object.keys(optimizationResult.city_details).length > 0) {
      const coordinatesList = Object.values(optimizationResult.city_details)
        .map(details => details.coordinates)
        .filter(coords => coords && coords[0] !== 0 && coords[1] !== 0);
      
      if (coordinatesList.length > 0) {
        const lats = coordinatesList.map(c => c[0]);
        const lngs = coordinatesList.map(c => c[1]);
        
        minLat = Math.min(...lats) - 0.25;
        maxLat = Math.max(...lats) + 0.25;
        minLng = Math.min(...lngs) - 0.25;
        maxLng = Math.max(...lngs) + 0.25;
      }
    }
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Invert Y axis
    
    return [x, y];
  };

  return (
    <div className="bg-agriBg dark:bg-gray-950 min-h-screen w-full transition-colors">
      <div className="w-full h-full p-4">
        <DashboardHeader />

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <div className="col-span-1 h-[calc(100vh-2rem)]">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-11">
            <h1 className="text-2xl font-bold text-agrigreen mb-6">Supply Chain Optimization</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Input Section */}
              <Card className="p-6 col-span-1">
                <h2 className="text-lg font-semibold mb-4">Optimize Your Crop Transport</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <Select value={currentState} onValueChange={(val) => {
                      setCurrentState(val);
                      setCurrentDistrict(statesAndDistricts[val][0]);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statesAndDistricts).map(st => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">District</label>
                    <Select value={currentDistrict} onValueChange={setCurrentDistrict}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a district" />
                      </SelectTrigger>
                      <SelectContent>
                        {statesAndDistricts[currentState].map(dist => (
                          <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Crop</label>
                    <Select value={crop} onValueChange={setCrop} disabled={loadingCommodities}>
                      <SelectTrigger>
                        {loadingCommodities ? (
                          <span className="flex items-center text-gray-500 text-xs">
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Loading crops...
                          </span>
                        ) : (
                          <SelectValue placeholder="Select a crop" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {commoditiesList.map(commodity => (
                          <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Crop Weight (kg)</label>
                    <Input
                      type="number"
                      value={cropWeight}
                      onChange={(e) => setCropWeight(e.target.value)}
                      min="1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleOptimize} 
                    className="w-full bg-agrigreen hover:bg-agrigreen-dark"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Optimize Transport
                      </>
                    )}
                  </Button>
                </div>
              </Card>
              
              {/* Results Section */}
              <Card className="p-6 col-span-1 md:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Optimization Results</h2>
                
                {optimizationResult ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-500 text-sm">Current Location</div>
                        <div className="font-medium text-lg flex items-center">
                          <Globe className="h-4 w-4 text-blue-500 mr-1" />
                          {optimizationResult.current_city}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-500 text-sm">Best Destination</div>
                        <div className="font-medium text-lg flex items-center">
                          <Globe className="h-4 w-4 text-green-500 mr-1" />
                          {optimizationResult.best_city}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-500 text-sm">Best Net Profit</div>
                        <div className="font-medium text-lg text-green-600 flex items-center">
                           <span className="mr-1 text-green-600 font-bold">₹</span>
                           {optimizationResult.best_net_profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6 p-4 rounded-lg border border-l-4 border-l-blue-500 bg-blue-50">
                      <h3 className="font-medium mb-1">Recommendation</h3>
                      <p className="text-gray-700">
                        {optimizationResult.recommend_transport 
                          ? `Transport your ${crop} (${cropWeight} kg) to ${optimizationResult.best_city} for maximum profit.`
                          : `Sell your ${crop} (${cropWeight} kg) locally in ${optimizationResult.current_city} for maximum profit.`
                        }
                      </p>
                      <div className="mt-3 flex gap-2">
                        {optimizationResult.recommend_transport && (
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                            <Truck className="mr-2 h-4 w-4" />
                            Plan Route
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-blue-500 text-blue-500 hover:bg-blue-50"
                          onClick={handleViewMap}
                        >
                          <MapIcon className="mr-2 h-4 w-4" />
                          View on Map
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="font-medium mb-2">Price Details by City</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-3 text-left">City</th>
                            <th className="py-2 px-3 text-right">Price per kg</th>
                            <th className="py-2 px-3 text-right">Transport Cost</th>
                            <th className="py-2 px-3 text-right">Net Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(optimizationResult.city_details).map(([city, details]) => (
                            <tr key={city} className={city === optimizationResult.best_city ? "bg-green-50" : ""}>
                              <td className="py-2 px-3 border-t">{city}</td>
                              <td className="py-2 px-3 border-t text-right">₹{details.price_per_kg.toFixed(2)}</td>
                              <td className="py-2 px-3 border-t text-right">₹{details.transport_cost.toFixed(2)}</td>
                              <td className={`py-2 px-3 border-t text-right font-medium ${
                                city === optimizationResult.best_city ? "text-green-600" : ""
                              }`}>
                                ₹{details.net_profit.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-2.5 rounded border border-blue-100 dark:border-blue-900/50">
                      * Price data sourced from the live data.gov.in Mandi API for {currentState} ({currentDistrict} District).
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <TrendingUp className="mb-3 h-12 w-12 opacity-20" />
                    <p>Enter your information and click "Optimize Transport" to see results.</p>
                  </div>
                )}
              </Card>
            </div>
            
            {/* Map View Section */}
            {showMap && optimizationResult && (
              <Card className="p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Transport Route Map</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowMap(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close Map
                  </Button>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 relative h-[600px]">
                  {/* Maharashtra map visualization */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-50 rounded-lg overflow-hidden">
                    {/* Map container */}
                    <div className="relative w-full h-full">
                      {/* Map background - Maharashtra outline */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <svg width="80%" height="80%" viewBox="0 0 100 100">
                          {/* Simplified Maharashtra outline */}
                          <path 
                            d="M20,20 L80,15 L85,40 L70,80 L30,85 L15,60 Z" 
                            fill="#e5e7eb" 
                            stroke="#9ca3af" 
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                      
                      {/* Cities */}
                      <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
                        {/* Markets (cities) markers */}
                        {Object.keys(optimizationResult.city_details).map(cityName => {
                          const details = optimizationResult.city_details[cityName];
                          const [lat, lng] = details.coordinates;
                          const [x, y] = normalizeCoordinates(lat, lng);
                          
                          return (
                            <g key={cityName}>
                              {/* Glow pulse for best market */}
                              {cityName === optimizationResult.best_city && (
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r="4.5"
                                  fill="#10b981"
                                  className="animate-ping opacity-25"
                                />
                              )}
                              
                              {/* Market marker */}
                              <circle 
                                cx={x} 
                                cy={y} 
                                r={cityName === optimizationResult.current_city ? 2 : 
                                   cityName === optimizationResult.best_city ? 2.2 : 1.5}
                                fill={cityName === optimizationResult.current_city ? "#3b82f6" : 
                                      cityName === optimizationResult.best_city ? "#10b981" : "#6b7280"}
                                stroke="#fff"
                                strokeWidth="0.5"
                              />
                              
                              {/* Market name label */}
                              <text 
                                x={x} 
                                y={y - 2.8} 
                                fontSize="2.2"
                                textAnchor="middle" 
                                fill={cityName === optimizationResult.current_city ? "#3b82f6" : 
                                      cityName === optimizationResult.best_city ? "#10b981" : "#6b7280"}
                                fontWeight={cityName === optimizationResult.current_city || 
                                            cityName === optimizationResult.best_city ? "bold" : "normal"}
                              >
                                {cityName}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Route line & animation between current and best market */}
                        {optimizationResult.recommend_transport && (
                          (() => {
                            const [startLat, startLng] = getCityCoordinates(optimizationResult.current_city);
                            const [endLat, endLng] = getCityCoordinates(optimizationResult.best_city);
                            const [startX, startY] = normalizeCoordinates(startLat, startLng);
                            const [endX, endY] = normalizeCoordinates(endLat, endLng);
                            
                            return (
                              <g>
                                {/* Route path connection */}
                                <line 
                                  x1={startX} 
                                  y1={startY} 
                                  x2={endX} 
                                  y2={endY} 
                                  stroke="#3b82f6" 
                                  strokeWidth="0.6" 
                                  strokeDasharray="2,2"
                                />
                                
                                {/* Transport flow animation: dot moves along route line */}
                                <circle r="1" fill="#f59e0b">
                                  <animate
                                    attributeName="cx"
                                    from={startX}
                                    to={endX}
                                    dur="2.5s"
                                    repeatCount="indefinite"
                                  />
                                  <animate
                                    attributeName="cy"
                                    from={startY}
                                    to={endY}
                                    dur="2.5s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                                
                                {/* Start and End markers again to keep them layered on top */}
                                <circle cx={startX} cy={startY} r="1.5" fill="#3b82f6" stroke="#fff" strokeWidth="0.4" />
                                <circle cx={endX} cy={endY} r="1.5" fill="#10b981" stroke="#fff" strokeWidth="0.4" />
                              </g>
                            );
                          })()
                        )}
                      </svg>
                      
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Map Legend</div>
                        <div className="flex items-center text-xs mb-1.5">
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2 shadow-sm"></div>
                          <span className="text-gray-600 dark:text-gray-400">Current Location ({optimizationResult.current_city})</span>
                        </div>
                        <div className="flex items-center text-xs mb-1.5">
                          <div className="h-3 w-3 rounded-full bg-green-500 mr-2 shadow-sm"></div>
                          <span className="text-gray-600 dark:text-gray-400">Best Profit Market ({optimizationResult.best_city})</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="h-3 w-3 rounded-full bg-gray-500 mr-2 shadow-sm"></div>
                          <span className="text-gray-600 dark:text-gray-400">Other Mandi Markets</span>
                        </div>
                      </div>
                      
                      {/* Map information */}
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">Optimized Transport Flow</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                          <div>Distance: {optimizationResult.city_details[optimizationResult.best_city].distance.toFixed(1)} km</div>
                          <div>Crop: {crop} ({cropWeight} kg)</div>
                          <div>Transport Cost: ₹{optimizationResult.city_details[optimizationResult.best_city].transport_cost.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChain; 
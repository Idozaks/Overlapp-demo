
import { useState, useEffect } from 'react';
import { 
  Users, Sparkles, Globe, QrCode, Fingerprint, 
  Building, ShoppingBag, Wallet, Calendar, Layers,
  ChevronRight, ChevronLeft, Phone, Code, CheckCircle, Clock, XCircle
} from 'lucide-react';
import featureData from '../../data/featureShowcase.json';

// Map icon names to actual components
const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  QrCode: <QrCode className="w-6 h-6" />,
  Fingerprint: <Fingerprint className="w-6 h-6" />
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors = {
    implemented: 'bg-green-100 text-green-800',
    'partially implemented': 'bg-yellow-100 text-yellow-800',
    planned: 'bg-blue-100 text-blue-800'
  } as Record<string, string>;
  
  const statusIcons = {
    implemented: <CheckCircle className="w-4 h-4 mr-1" />,
    'partially implemented': <Clock className="w-4 h-4 mr-1" />,
    planned: <XCircle className="w-4 h-4 mr-1" />
  } as Record<string, React.ReactNode>;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusIcons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Phone mockup component
const PhoneMockup = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
      <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
      <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
};

// Feature details component
const FeatureDetails = ({ feature }: { feature: any }) => {
  const icon = feature.icon && iconMap[feature.icon] ? iconMap[feature.icon] : 
               <Code className="w-6 h-6" />;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${feature.color}20` }}>
          <div style={{ color: feature.color }}>{icon}</div>
        </div>
        <h3 className="ml-3 text-xl font-bold">{feature.title}</h3>
      </div>
      
      <StatusBadge status={feature.status} />
      
      <p className="text-gray-600">{feature.description}</p>
      
      <div>
        <h4 className="font-medium mb-2">Key Features:</h4>
        <ul className="list-disc list-inside space-y-1">
          {feature.keyPoints?.map((point: string, index: number) => (
            <li key={index} className="text-gray-600">{point}</li>
          ))}
        </ul>
      </div>
      
      {feature.components && (
        <div>
          <h4 className="font-medium mb-2">Implementation:</h4>
          <div className="flex flex-wrap gap-2">
            {feature.components.map((component: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                {component}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {feature.userBenefit && (
        <div>
          <h4 className="font-medium mb-2">User Benefit:</h4>
          <p className="text-gray-600">{feature.userBenefit}</p>
        </div>
      )}
    </div>
  );
};

// Mock phone screen content based on feature
const FeatureScreen = ({ feature }: { feature: any }) => {
  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {feature.icon && iconMap[feature.icon] ? iconMap[feature.icon] : <Code className="w-4 h-4" />}
            </div>
            <span className="ml-2 font-medium">{feature.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-gray-200"></div>
            <div className="h-4 w-4 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
      
      {/* Feature content - simplified visualization */}
      <div className="flex-1 p-4 space-y-4">
        <div className="h-24 bg-white rounded-lg shadow-sm p-3 flex items-center">
          <div className="h-16 w-16 rounded bg-blue-100 flex items-center justify-center" style={{ color: feature.color }}>
            {feature.icon && iconMap[feature.icon] ? iconMap[feature.icon] : <Code className="w-6 h-6" />}
          </div>
          <div className="ml-3">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-100 rounded"></div>
          </div>
        </div>
        
        {feature.keyPoints?.slice(0, 3).map((point: string, index: number) => (
          <div key={index} className="h-12 bg-white rounded-lg shadow-sm flex items-center p-3">
            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <span>{index + 1}</span>
            </div>
            <div className="ml-3 h-3 w-48 bg-gray-200 rounded"></div>
          </div>
        ))}
        
        {/* Feature specific visualization - just a placehoder */}
        <div className="h-40 bg-white rounded-lg shadow-sm p-3">
          {feature.id === 'user-overlap' && (
            <div className="h-full flex flex-col justify-center items-center">
              <div className="relative h-24 w-full">
                <div className="absolute left-4 top-0 h-20 w-20 rounded-full bg-blue-100"></div>
                <div className="absolute right-4 top-0 h-20 w-20 rounded-full bg-purple-100"></div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-20 rounded-full bg-indigo-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-indigo-800">75% Match</span>
                </div>
              </div>
              <div className="h-3 w-40 bg-gray-200 rounded mt-2"></div>
            </div>
          )}
          
          {feature.id === 'interest-matching' && (
            <div className="h-full flex flex-col space-y-3 pt-2">
              <div className="flex space-x-2">
                <div className="h-6 w-20 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-[10px]">Art</span>
                </div>
                <div className="h-6 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-[10px]">Technology</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="h-6 w-24 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-[10px]">Photography</span>
                </div>
                <div className="h-6 w-20 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-[10px]">Design</span>
                </div>
              </div>
              <div className="h-6 w-36 bg-gray-200 rounded mt-2"></div>
            </div>
          )}
          
          {feature.id === 'digital-identity' && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="h-24 w-24 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
          )}
          
          {(feature.id !== 'user-overlap' && feature.id !== 'interest-matching' && feature.id !== 'digital-identity') && (
            <div className="h-full flex flex-col space-y-3 pt-2">
              <div className="h-6 w-full bg-gray-200 rounded"></div>
              <div className="h-6 w-2/3 bg-gray-200 rounded"></div>
              <div className="h-16 w-full bg-gray-100 rounded"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation bar */}
      <div className="bg-white p-3 shadow-inner flex justify-around">
        <div className="h-6 w-6 rounded-full bg-gray-200"></div>
        <div className="h-6 w-6 rounded-full bg-gray-200"></div>
        <div className="h-6 w-10 rounded-full bg-blue-500"></div>
        <div className="h-6 w-6 rounded-full bg-gray-200"></div>
      </div>
    </div>
  );
};

interface FeatureShowcaseProps {
  initialTab?: 'current' | 'mvp';
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ initialTab = 'current' }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'mvp'>(initialTab);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Get features based on active tab
  const features = activeTab === 'current' 
    ? featureData.currentFeatures 
    : featureData.mvpFeatures;

  // Set initial selected feature
  useEffect(() => {
    if (features.length > 0 && !selectedFeature) {
      setSelectedFeature(features[0]);
    } else if (features.length > 0) {
      // When switching tabs, select the first feature of the new tab
      const featureExists = features.find(f => f.id === selectedFeature?.id);
      if (!featureExists) {
        setSelectedFeature(features[0]);
      }
    }
  }, [features, selectedFeature]);

  // Check for mobile screen
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Next/Previous feature navigation
  const navigateFeature = (direction: 'next' | 'prev') => {
    if (!selectedFeature) return;
    
    const currentIndex = features.findIndex(f => f.id === selectedFeature.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % features.length;
    } else {
      newIndex = (currentIndex - 1 + features.length) % features.length;
    }
    
    setSelectedFeature(features[newIndex]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-6 py-3 font-medium text-sm ${activeTab === 'current' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('current')}
        >
          Current Features
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${activeTab === 'mvp' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('mvp')}
        >
          MVP Features
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Feature navigation sidebar */}
        {!isMobile && (
          <div className="w-64 border-r bg-gray-50">
            <nav className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {activeTab === 'current' ? 'Implemented Features' : 'MVP Features'}
              </h3>
              <ul className="space-y-1">
                {features.map((feature) => (
                  <li key={feature.id}>
                    <button
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${selectedFeature?.id === feature.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <span className="truncate">{feature.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
        
        {/* Mobile feature selection */}
        {isMobile && (
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={() => navigateFeature('prev')}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <select 
                className="flex-1 mx-2 p-2 bg-white border rounded-md text-sm"
                value={selectedFeature?.id || ''}
                onChange={(e) => {
                  const feature = features.find(f => f.id === e.target.value);
                  if (feature) setSelectedFeature(feature);
                }}
              >
                {features.map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.title}
                  </option>
                ))}
              </select>
              
              <button 
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={() => navigateFeature('next')}
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
        
        {/* Feature content */}
        {selectedFeature && (
          <div className="flex-1 p-6">
            <div className="md:flex md:gap-8">
              {/* Mockup */}
              <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                <PhoneMockup>
                  <FeatureScreen feature={selectedFeature} />
                </PhoneMockup>
              </div>
              
              {/* Details */}
              <div className="md:w-2/3">
                <FeatureDetails feature={selectedFeature} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureShowcase;

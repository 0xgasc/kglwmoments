import { guatemalaStatistics } from '@/data/guatemalaStats';
import StatSection from '@/components/StatSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Guatemala in Real Time
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Live statistics that matter to Guatemala's development
            </p>
            <div className="text-sm text-blue-200">
              Data updated every second from official sources
            </div>
          </div>
        </div>
      </div>

      {/* Featured Stats */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 font-mono">
                18.4M
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Population</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 font-mono">
                $109B
              </div>
              <div className="text-sm text-gray-600 mt-1">GDP 2024</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 font-mono">
                57.3%
              </div>
              <div className="text-sm text-gray-600 mt-1">Poverty Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 font-mono">
                25/100
              </div>
              <div className="text-sm text-gray-600 mt-1">Corruption Index</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <StatSection 
            category={guatemalaStatistics.population} 
            defaultExpanded={true}
          />
          <StatSection 
            category={guatemalaStatistics.economy}
            defaultExpanded={true}
          />
          <StatSection 
            category={guatemalaStatistics.society}
          />
          <StatSection 
            category={guatemalaStatistics.corruption}
          />
          <StatSection 
            category={guatemalaStatistics.health}
          />
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Understanding Guatemala Through Data
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Guatemeters provides real-time insights into Guatemala's development, 
              challenges, and progress. Our data comes from official sources including 
              INE Guatemala, Banco de Guatemala, World Bank, and Transparency International.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

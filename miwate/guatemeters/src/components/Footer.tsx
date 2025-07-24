import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Guatemeters</h3>
            <p className="text-gray-300 text-sm">
              Real-time statistics and data about Guatemala, providing insights into population, 
              economy, society, and governance.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium">Statistics</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/population" className="hover:text-white">Population</Link></li>
              <li><Link href="/economy" className="hover:text-white">Economy</Link></li>
              <li><Link href="/society" className="hover:text-white">Society</Link></li>
              <li><Link href="/corruption" className="hover:text-white">Corruption Index</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium">Information</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/methodology" className="hover:text-white">Methodology</Link></li>
              <li><Link href="/sources" className="hover:text-white">Data Sources</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium">Data Sources</h4>
            <p className="text-gray-300 text-sm">
              INE Guatemala, Banco de Guatemala, Transparency International, 
              World Bank, and other official sources.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2024 Guatemeters. Data updated in real-time from official sources.</p>
        </div>
      </div>
    </footer>
  );
}
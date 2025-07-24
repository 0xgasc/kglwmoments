export default function About() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">About Guatemeters</h1>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-lg leading-relaxed">
                Guatemeters is dedicated to making Guatemala's vital statistics accessible, 
                understandable, and actionable. Inspired by global platforms like Worldometer, 
                we focus specifically on Guatemala's unique challenges and opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Guatemala Needs This</h2>
              <p className="leading-relaxed mb-4">
                Guatemala faces significant challenges in transparency, governance, and development. 
                By presenting real-time data about population, economy, corruption, and social indicators, 
                we aim to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Increase awareness about Guatemala's development challenges</li>
                <li>Promote data-driven discussions about policy and governance</li>
                <li>Highlight both progress and areas needing attention</li>
                <li>Make complex statistics accessible to all Guatemalans</li>
                <li>Support transparency and accountability in governance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Approach</h2>
              <p className="leading-relaxed mb-4">
                We believe that live, dynamic presentation of statistics creates greater impact 
                than static numbers. Our real-time counters help visualize the constant change 
                happening in Guatemala, making abstract statistics feel immediate and relevant.
              </p>
              <p className="leading-relaxed">
                All our data comes from official and reputable sources, including INE Guatemala, 
                Banco de Guatemala, World Bank, Transparency International, and other recognized institutions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Focus Areas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Population & Demographics</h3>
                  <p className="text-sm">Real-time population growth, births, deaths, and urbanization trends.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Economic Development</h3>
                  <p className="text-sm">GDP growth, remittances, poverty rates, and economic indicators.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Social Progress</h3>
                  <p className="text-sm">Education, health, digital adoption, and social development metrics.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Governance & Transparency</h3>
                  <p className="text-sm">Corruption indices, government spending, and accountability measures.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Sources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium">National Sources</h4>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• INE Guatemala (Population, Demographics)</li>
                    <li>• Banco de Guatemala (Economic Data)</li>
                    <li>• Ministry of Health (Health Statistics)</li>
                    <li>• MINEDUC (Education Data)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium">International Sources</h4>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• World Bank (Development Indicators)</li>
                    <li>• Transparency International (Corruption Index)</li>
                    <li>• UNESCO (Education Statistics)</li>
                    <li>• WHO (Health Data)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Methodology</h2>
              <p className="leading-relaxed">
                Our real-time calculations are based on annual growth rates and official statistics. 
                Daily figures (births, deaths, government spending) are extrapolated from annual data 
                and updated every second to show the dynamic nature of these statistics. While these 
                are estimates, they are grounded in official data and provide a meaningful visualization 
                of Guatemala's ongoing development.
              </p>
            </section>

            <section className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact & Contributions</h2>
              <p className="leading-relaxed">
                Guatemeters is an independent initiative focused on transparency and data accessibility. 
                If you have suggestions for additional statistics, corrections to our data, or want to 
                contribute to this project, we welcome your input. Together, we can build a more 
                transparent and informed Guatemala.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
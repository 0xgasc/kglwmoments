export interface StatisticItem {
  id: string;
  title: string;
  value: number;
  increment: number; // per second
  unit?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color?: string;
  source?: string;
}

export interface StatisticCategory {
  title: string;
  items: StatisticItem[];
}

// Base statistics for Guatemala 2024
export const guatemalaStatistics: Record<string, StatisticCategory> = {
  population: {
    title: "Population",
    items: [
      {
        id: "current-population",
        title: "Current Population",
        value: 18406359,
        increment: 0.65, // ~1.29% annual growth = ~1 person every 1.5 seconds
        color: "text-blue-600",
        source: "World Bank, INE Guatemala"
      },
      {
        id: "births-today",
        title: "Births Today",
        value: 0,
        increment: 0.016, // ~580 births per day
        color: "text-green-600",
        source: "INE Guatemala estimates"
      },
      {
        id: "deaths-today",
        title: "Deaths Today",
        value: 0,
        increment: 0.008, // ~300 deaths per day
        color: "text-red-600",
        source: "INE Guatemala estimates"
      },
      {
        id: "urban-population",
        title: "Urban Population",
        value: 9570000,
        increment: 0.8, // Growing faster than rural
        suffix: " (52%)",
        color: "text-purple-600",
        source: "World Bank"
      }
    ]
  },
  economy: {
    title: "Economy & Finance",
    items: [
      {
        id: "gdp",
        title: "GDP",
        value: 108900000000,
        increment: 3458, // ~3.5% annual growth
        prefix: "$",
        color: "text-emerald-600",
        source: "Banco de Guatemala"
      },
      {
        id: "remittances",
        title: "Remittances This Year",
        value: 21000000000,
        increment: 665, // ~$21B annually
        prefix: "$",
        color: "text-blue-600",
        source: "Banco de Guatemala"
      },
      {
        id: "poverty-rate",
        title: "People Living in Poverty",
        value: 10541853,
        increment: 0.1, // Slight increase
        suffix: " (57.3%)",
        color: "text-red-600",
        source: "World Bank"
      },
      {
        id: "informal-workers",
        title: "Informal Workers",
        value: 5800000,
        increment: 0.5, // ~80% of employed
        suffix: " (80%)",
        color: "text-orange-600",
        source: "ILO"
      }
    ]
  },
  society: {
    title: "Society & Education",
    items: [
      {
        id: "literacy-rate",
        title: "Literate Population",
        value: 14725887,
        increment: 2, // Improving education
        suffix: " (80.1%)",
        color: "text-blue-600",
        source: "UNESCO"
      },
      {
        id: "internet-users",
        title: "Internet Users",
        value: 11000000,
        increment: 5, // Rapid digital growth
        suffix: " (59.8%)",
        color: "text-cyan-600",
        source: "ITU"
      },
      {
        id: "mobile-users",
        title: "Mobile Phone Users",
        value: 20500000,
        increment: 3, // Multiple SIMs per person
        suffix: " (111%)",
        color: "text-purple-600",
        source: "GSMA"
      },
      {
        id: "school-age",
        title: "School Age Children",
        value: 4600000,
        increment: 0.5,
        color: "text-green-600",
        source: "MINEDUC"
      }
    ]
  },
  corruption: {
    title: "Governance & Corruption",
    items: [
      {
        id: "corruption-index",
        title: "Corruption Index Score",
        value: 25,
        increment: 0.001, // Slowly improving
        suffix: "/100",
        color: "text-red-600",
        source: "Transparency International"
      },
      {
        id: "global-rank",
        title: "Global Corruption Rank",
        value: 146,
        increment: -0.01, // Improving rank (lower number is better)
        suffix: "/180",
        color: "text-orange-600",
        source: "Transparency International"
      },
      {
        id: "public-debt",
        title: "Public Debt",
        value: 29700000000,
        increment: 950, // Growing moderately
        prefix: "$",
        suffix: " (27.3% GDP)",
        color: "text-yellow-600",
        source: "Banco de Guatemala"
      },
      {
        id: "government-spending",
        title: "Gov't Spending Today",
        value: 0,
        increment: 685, // Daily government expenditure
        prefix: "$",
        suffix: "M",
        color: "text-gray-600",
        source: "Ministry of Finance"
      }
    ]
  },
  health: {
    title: "Health & Social Indicators",
    items: [
      {
        id: "life-expectancy",
        title: "Life Expectancy",
        value: 74.2,
        increment: 0.0001, // Slowly improving
        suffix: " years",
        decimals: 1,
        color: "text-green-600",
        source: "WHO"
      },
      {
        id: "malnutrition",
        title: "Malnourished Children",
        value: 730000,
        increment: -0.5, // Slowly decreasing
        suffix: " (46.5%)",
        color: "text-red-600",
        source: "UNICEF"
      },
      {
        id: "healthcare-spending",
        title: "Healthcare Spending",
        value: 3267000000,
        increment: 103, // ~3% of GDP
        prefix: "$",
        suffix: " (3% GDP)",
        color: "text-blue-600",
        source: "Ministry of Health"
      }
    ]
  }
};

// Function to get current timestamp for daily resets
export function getDaysSinceEpoch(): number {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}

// Function to calculate current value based on time elapsed
export function getCurrentValue(stat: StatisticItem): number {
  const now = Date.now();
  const startOfYear = new Date(2024, 0, 1).getTime();
  const secondsElapsed = (now - startOfYear) / 1000;
  
  // For daily counters (births, deaths, government spending), reset daily
  if (stat.id.includes('today')) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const secondsToday = (now - startOfDay.getTime()) / 1000;
    return Math.floor(stat.increment * secondsToday);
  }
  
  return Math.floor(stat.value + (stat.increment * secondsElapsed));
}
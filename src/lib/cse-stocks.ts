export interface CseStock {
  symbol: string;
  name: string;
  sector: string;
}

export const CSE_STOCKS: CseStock[] = [
  { symbol: "JKH", name: "John Keells Holdings PLC", sector: "Diversified" },
  { symbol: "COMB", name: "Commercial Bank of Ceylon PLC", sector: "Banking" },
  { symbol: "HNB", name: "Hatton National Bank PLC", sector: "Banking" },
  { symbol: "DIAL", name: "Dialog Axiata PLC", sector: "Telecommunications" },
  { symbol: "EXPO", name: "Expolanka Holdings PLC", sector: "Logistics" },
  { symbol: "SAMP", name: "Sampath Bank PLC", sector: "Banking" },
  { symbol: "LOLC", name: "LOLC Holdings PLC", sector: "Diversified Finance" },
  { symbol: "CTC", name: "Ceylon Tobacco Company PLC", sector: "Consumer Goods" },
  { symbol: "RICH", name: "Richard Pieris & Company PLC", sector: "Diversified" },
  { symbol: "DIPD", name: "Dipped Products PLC", sector: "Manufacturing" },
  { symbol: "NTB", name: "Nations Trust Bank PLC", sector: "Banking" },
  { symbol: "NDB", name: "National Development Bank PLC", sector: "Banking" },
  { symbol: "DFCC", name: "DFCC Bank PLC", sector: "Banking" },
  { symbol: "CARS", name: "Carsons Cumberbatch PLC", sector: "Diversified" },
  { symbol: "LION", name: "Lion Brewery (Ceylon) PLC", sector: "Beverages" },
  { symbol: "BUKI", name: "Bukit Darah PLC", sector: "Plantation" },
  { symbol: "LLUB", name: "Lanka Lubricants PLC", sector: "Petroleum" },
  { symbol: "HPWR", name: "Hydro Power Free Lanka PLC", sector: "Energy" },
  { symbol: "LOFC", name: "LOLC Finance PLC", sector: "Finance" },
  { symbol: "HAYL", name: "Hayleys PLC", sector: "Diversified" },
];

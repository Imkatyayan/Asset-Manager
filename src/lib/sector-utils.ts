export function resolveSector(name: string, symbol: string, rawYahooSector?: string): string {
  const cleanName = (name || "").toUpperCase();
  const cleanSymbol = (symbol || "").toUpperCase();
  const cleanYahooSector = (rawYahooSector || "").trim().toUpperCase();

  const canonicalMap: Record<string, string> = {
    BANKING: "Banking & Finance",
    FINANCE: "Banking & Finance",
    "FINANCIAL SERVICES": "Banking & Finance",
    FINANCIALS: "Banking & Finance",
    IT: "IT",
    PHARMA: "Pharma",
    ENERGY: "Energy",
    AUTO: "Auto",
    FMCG: "FMCG",
    INFRASTRUCTURE: "Infrastructure",
    MATERIALS: "Materials",
    TELECOM: "Telecom",
    "CONSUMER SERVICES": "Consumer Services",
    "AEROSPACE & DEFENCE": "Aerospace & Defence",
  };
  if (canonicalMap[cleanYahooSector]) {
    return canonicalMap[cleanYahooSector];
  }

  // 1. Aerospace & Defence
  if (
    cleanName.includes("DEFENCE") ||
    cleanName.includes("DEFENSE") ||
    cleanName.includes("AEROSPACE") ||
    cleanName.includes("SHIPYARD") ||
    cleanName.includes("SHIPBUILD") ||
    cleanName.includes("MAZAGON") ||
    cleanName.includes("COCHIN SHIP") ||
    cleanSymbol.includes("HAL") ||
    cleanSymbol.includes("BEL") ||
    cleanSymbol.includes("BDL") ||
    cleanSymbol.includes("MAZDOCK") ||
    cleanSymbol.includes("COCHINSHIP") ||
    cleanSymbol.includes("BEML")
  ) {
    return "Aerospace & Defence";
  }

  // 2. Consumer Services (Hotels, Tourism, Retail, Aviation)
  if (
    cleanName.includes("HOTEL") ||
    cleanName.includes("RESORT") ||
    cleanName.includes("RETAIL") ||
    cleanName.includes("FASHION") ||
    cleanName.includes("MALL") ||
    cleanName.includes("RESTAURANT") ||
    cleanName.includes("AVIATION") ||
    cleanName.includes("AIRLINE") ||
    cleanName.includes("AIRWAYS") ||
    cleanName.includes("TRAVEL") ||
    (cleanName.includes("FOODS") && (cleanName.includes("JUBILANT") || cleanName.includes("WESTLIFE"))) ||
    cleanSymbol.includes("INDHOTEL") ||
    cleanSymbol.includes("LEMONTREE") ||
    cleanSymbol.includes("TRENT") ||
    cleanSymbol.includes("ABFRL") ||
    cleanSymbol.includes("TATAPLAY") ||
    cleanSymbol.includes("PVR") ||
    cleanSymbol.includes("INOX")
  ) {
    return "Consumer Services";
  }

  // 3. IT & Tech
  if (
    cleanName.includes("SOFTWARE") ||
    cleanName.includes("TECHNOLOGIES") ||
    cleanName.includes("TECH") ||
    cleanName.includes("INFOSYS") ||
    cleanName.includes("DIGITAL") ||
    cleanName.includes("CONSULTANCY") ||
    cleanName.includes("SYSTEMS") ||
    cleanName.includes("MINDTREE") ||
    cleanName.includes("COMPUTERS") ||
    cleanYahooSector === "TECHNOLOGY" ||
    cleanSymbol.includes("TCS") ||
    cleanSymbol.includes("INFY") ||
    cleanSymbol.includes("WIPRO") ||
    cleanSymbol.includes("HCLTECH") ||
    cleanSymbol.includes("LTIM") ||
    cleanSymbol.includes("COFORGE") ||
    cleanSymbol.includes("KPITTECH")
  ) {
    return "IT";
  }

  // 4. Banking / Finance
  if (
    cleanName.includes("BANK") ||
    cleanName.includes("FINANCE") ||
    cleanName.includes("FINANCIAL") ||
    cleanName.includes("CAPITAL") ||
    cleanName.includes("INVESTMENT") ||
    cleanName.includes("MUTHOOT") ||
    cleanName.includes("CHOLA") ||
    cleanName.includes("SECURITIES") ||
    cleanName.includes("INSURANCE") ||
    cleanName.includes("REINSURANCE") ||
    cleanName.includes("HOUSING") ||
    cleanName.includes("ASSET") ||
    cleanName.includes("HOLDINGS") ||
    cleanName.includes("BROKING") ||
    cleanName.includes("BROKER") ||
    cleanName.includes("EXCHANGE") ||
    cleanName.includes("DEPOSITORY") ||
    cleanName.includes("WEALTH") ||
    cleanName.includes("VENTURES") ||
    cleanName.includes("MUTUAL") ||
    cleanName.includes("CREDIT") ||
    cleanName.includes("CARD") ||
    cleanName.includes("PAYMENTS") ||
    cleanYahooSector === "FINANCIAL SERVICES" ||
    cleanYahooSector === "FINANCIALS" ||
    cleanSymbol.includes("HDFC") ||
    cleanSymbol.includes("ICICI") ||
    cleanSymbol.includes("SBIN") ||
    cleanSymbol.includes("KOTAK") ||
    cleanSymbol.includes("AXIS") ||
    cleanSymbol.includes("LIC") ||
    cleanSymbol.includes("HUDCO") ||
    cleanSymbol.includes("IRFC") ||
    cleanSymbol.includes("PFC") ||
    cleanSymbol.includes("RECLTD") ||
    cleanSymbol.includes("IEX") ||
    cleanSymbol.includes("ANGELONE") ||
    cleanSymbol.includes("GROWW") ||
    cleanSymbol.includes("MOTILAL") ||
    cleanSymbol.includes("OSWAL") ||
    cleanSymbol.includes("BSE") ||
    cleanSymbol.includes("CDSL") ||
    cleanSymbol.includes("MCX") ||
    cleanSymbol.includes("JIOFIN") ||
    cleanSymbol.includes("IREDA")
  ) {
    return "Banking & Finance";
  }

  // 5. Pharma / Healthcare
  if (
    cleanName.includes("PHARMA") ||
    cleanName.includes("LABORATORIES") ||
    cleanName.includes("LABS") ||
    cleanName.includes("HEALTHCARE") ||
    cleanName.includes("BIOTECH") ||
    cleanName.includes("MEDICINE") ||
    cleanName.includes("DR.") ||
    cleanName.includes("DR ") ||
    cleanName.includes("HOSPITAL") ||
    cleanName.includes("CLINIC") ||
    cleanName.includes("LIFE SCIENCES") ||
    cleanYahooSector === "HEALTHCARE" ||
    cleanSymbol.includes("CIPLA") ||
    cleanSymbol.includes("SUNPHARMA") ||
    cleanSymbol.includes("REDDY") ||
    cleanSymbol.includes("DIVISLAB") ||
    cleanSymbol.includes("LUPIN")
  ) {
    return "Pharma";
  }

  // 6. Energy / Utilities / Power
  if (
    cleanName.includes("POWER") ||
    cleanName.includes("ENERGY") ||
    cleanName.includes("ELECTRIC") ||
    cleanName.includes("SOLAR") ||
    cleanName.includes("WIND") ||
    cleanName.includes("HYDRO") ||
    cleanName.includes("RENEWABLE") ||
    cleanName.includes("OIL") ||
    cleanName.includes("GAS") ||
    cleanName.includes("PETRO") ||
    cleanName.includes("REFINERY") ||
    cleanYahooSector === "ENERGY" ||
    cleanYahooSector === "UTILITIES" ||
    cleanSymbol.includes("NTPC") ||
    cleanSymbol.includes("ONGC") ||
    cleanSymbol.includes("IOC") ||
    cleanSymbol.includes("BPCL") ||
    cleanSymbol.includes("HPCL") ||
    cleanSymbol.includes("GAIL") ||
    cleanSymbol.includes("POWERGRID") ||
    cleanSymbol.includes("NHPC") ||
    cleanSymbol.includes("SJVN") ||
    cleanSymbol.includes("WAAREE")
  ) {
    return "Energy";
  }

  // 7. Auto
  if (
    cleanName.includes("MOTOR") ||
    cleanName.includes("AUTOMOTIVE") ||
    cleanName.includes("AUTO") ||
    cleanName.includes("TYRE") ||
    cleanName.includes("VEHICLE") ||
    (cleanYahooSector === "CONSUMER CYCLICAL" && (cleanName.includes("BATTERY") || cleanName.includes("AMARA") || cleanName.includes("EXIDE"))) ||
    cleanSymbol.includes("TATAMOTORS") ||
    cleanSymbol.includes("MARUTI") ||
    cleanSymbol.includes("M&M") ||
    cleanSymbol.includes("HEROMOTOCO") ||
    cleanSymbol.includes("BAJAJ-AUTO") ||
    cleanSymbol.includes("EICHERMOT") ||
    cleanSymbol.includes("MRF") ||
    cleanSymbol.includes("APOLLOTYRE") ||
    cleanSymbol.includes("AMARAJABAT") ||
    cleanSymbol.includes("AMARAJAEQ")
  ) {
    return "Auto";
  }

  // 8. Materials / Metals / Mining / Chemicals
  if (
    cleanName.includes("STEEL") ||
    cleanName.includes("METAL") ||
    cleanName.includes("IRON") ||
    cleanName.includes("MINE") ||
    cleanName.includes("MINING") ||
    cleanName.includes("ALUMINIUM") ||
    cleanName.includes("COPPER") ||
    cleanName.includes("ZINC") ||
    cleanName.includes("COAL") ||
    cleanName.includes("CARBON") ||
    cleanName.includes("CHEMICAL") ||
    cleanName.includes("CHEM") ||
    cleanName.includes("ORGANIC") ||
    cleanName.includes("FERTILIZER") ||
    cleanName.includes("PAINT") ||
    cleanYahooSector === "BASIC MATERIALS" ||
    cleanSymbol.includes("TATASTEEL") ||
    cleanSymbol.includes("JINDALSTEL") ||
    cleanSymbol.includes("SAIL") ||
    cleanSymbol.includes("HINDALCO") ||
    cleanSymbol.includes("VEDL") ||
    cleanSymbol.includes("COALINDIA") ||
    cleanSymbol.includes("NMDC") ||
    cleanSymbol.includes("ASIANPAINT") ||
    cleanSymbol.includes("BERGERPAINT") ||
    cleanSymbol.includes("PIDILITIND") ||
    cleanSymbol.includes("SRF")
  ) {
    return "Materials";
  }

  // 9. Infrastructure / Real Estate / Construction
  if (
    cleanName.includes("INFRASTRUCTURE") ||
    cleanName.includes("INFRA") ||
    cleanName.includes("CONSTRUCTION") ||
    cleanName.includes("PROJECTS") ||
    cleanName.includes("DEVELOPERS") ||
    cleanName.includes("BUILDERS") ||
    cleanName.includes("CEMENT") ||
    cleanName.includes("REAL ESTATE") ||
    cleanName.includes("REALTY") ||
    cleanName.includes("PROPERTIES") ||
    cleanName.includes("ESTATE") ||
    cleanYahooSector === "REAL ESTATE" ||
    cleanSymbol.includes("LT") ||
    cleanSymbol.includes("ULTRACEMCO") ||
    cleanSymbol.includes("GRASIM") ||
    cleanSymbol.includes("DLF") ||
    cleanSymbol.includes("GODREJPROP") ||
    cleanSymbol.includes("IRB") ||
    cleanSymbol.includes("ANANTRAJ")
  ) {
    return "Infrastructure";
  }

  // 10. FMCG / Consumer Staples
  if (
    cleanName.includes("CONSUMER") ||
    cleanName.includes("FOOD") ||
    cleanName.includes("BEVERAGE") ||
    cleanName.includes("DAIRY") ||
    cleanName.includes("AGRO") ||
    cleanName.includes("SUGAR") ||
    cleanName.includes("FLOUR") ||
    cleanName.includes("BREWERIES") ||
    cleanName.includes("DETERGENTS") ||
    cleanName.includes("SOAP") ||
    cleanName.includes("TOBACCO") ||
    cleanName.includes("SPICE") ||
    cleanYahooSector === "CONSUMER DEFENSIVE" ||
    cleanSymbol.includes("HINDUNILVR") ||
    cleanSymbol.includes("ITC") ||
    cleanSymbol.includes("NESTLEIND") ||
    cleanSymbol.includes("BRITANNIA") ||
    cleanSymbol.includes("TATACONSUM") ||
    cleanSymbol.includes("DABUR") ||
    cleanSymbol.includes("MARICO") ||
    cleanSymbol.includes("COLPAL") ||
    cleanSymbol.includes("VBL") ||
    cleanSymbol.includes("SULA")
  ) {
    return "FMCG";
  }

  // 11. Telecom
  if (
    cleanName.includes("TELECOM") ||
    cleanName.includes("TELECOMMUNICATION") ||
    cleanName.includes("COMMUNICATION") ||
    cleanYahooSector === "TELECOMMUNICATION SERVICES" ||
    cleanSymbol.includes("BHARTIARTL") ||
    cleanSymbol.includes("IDEA") ||
    cleanSymbol.includes("TTML")
  ) {
    return "Telecom";
  }

  // Fallbacks using Yahoo Sector directly if matched:
  if (cleanYahooSector === "FINANCIAL SERVICES" || cleanYahooSector === "FINANCIALS") {
    return "Banking & Finance";
  }
  if (cleanYahooSector === "TECHNOLOGY") {
    return "IT";
  }
  if (cleanYahooSector === "HEALTHCARE") {
    return "Pharma";
  }
  if (cleanYahooSector === "ENERGY" || cleanYahooSector === "UTILITIES") {
    return "Energy";
  }
  if (cleanYahooSector === "CONSUMER DEFENSIVE") {
    return "FMCG";
  }
  if (cleanYahooSector === "REAL ESTATE") {
    return "Infrastructure";
  }
  if (cleanYahooSector === "BASIC MATERIALS") {
    return "Materials";
  }

  // Double check if Yahoo's Consumer Cyclical is hotels or auto or retail
  if (cleanYahooSector === "CONSUMER CYCLICAL") {
    if (cleanName.includes("MOTOR") || cleanName.includes("AUTO") || cleanName.includes("TYRE")) {
      return "Auto";
    }
    return "Consumer Services"; // Hospitality, hotels, retail
  }

  // Double check if Industrials is aerospace, shipping, or infrastructure
  if (cleanYahooSector === "INDUSTRIALS") {
    if (
      cleanName.includes("SHIP") ||
      cleanName.includes("DEFENCE") ||
      cleanName.includes("DEFENSE") ||
      cleanName.includes("AEROSPACE")
    ) {
      return "Aerospace & Defence";
    }
    return "Infrastructure";
  }

  return "Others";
}

export function guessSector(name: string, symbol: string): string {
  return resolveSector(name, symbol);
}

export function normalizeSector(sector: string): string {
  return resolveSector("", "", sector);
}

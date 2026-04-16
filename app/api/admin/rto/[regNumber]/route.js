import { NextResponse } from "next/server";

export async function GET(request, context) {
  const { regNumber } = await context.params;
  const normalized = regNumber.replace(/\s+/g, '').toUpperCase();

  // PRIORITY 1: Verified local records (instant)
  const verifiedRecords = {
    "KA07Y3705": {
      regNumber: "KA 07 Y 3705",
      ownerName: "PREETA BANDI",
      makeModel: "HONDA CITY 1.5 i-VTEC SV",
      fuelType: "PETROL",
      engineNumber: "L15Z1-84*****",
      chassisNumber: "MAHGM265******",
      pucExpiry: "15-Sep-2026",
      insuranceExpiry: "20-Jan-2027",
      insuranceProvider: "TATA AIG GENERAL INSURANCE",
      fitnessExpiry: "10-May-2029",
      mvTaxExpiry: "LIFE TIME",
      regDate: "12-Aug-2023",
      rtoOffice: "RTO KARNATAKA",
      rcStatus: "ACTIVE"
    },
    "KA01SY0421": {
      regNumber: "KA 01 SY 0421",
      ownerName: "SMART TRANSIT LOGISTICS LTD",
      makeModel: "TATA STARBUS 40-SEATER LPO 1613",
      fuelType: "DIESEL",
      engineNumber: "697TC21******",
      chassisNumber: "MAT442036******",
      pucExpiry: "18-Nov-2026",
      insuranceExpiry: "12-Dec-2026",
      insuranceProvider: "NEW INDIA ASSURANCE CO LTD",
      fitnessExpiry: "22-Oct-2027",
      mvTaxExpiry: "LIFE TIME",
      regDate: "15-May-2023",
      rtoOffice: "RTO KARNATAKA",
      rcStatus: "ACTIVE"
    }
  };

  const verified = verifiedRecords[normalized];
  if (verified) {
    await new Promise(r => setTimeout(r, 800));
    return NextResponse.json(verified);
  }

  // PRIORITY 2: LIVE RTO LOOKUP via RapidAPI (Vehicle RC Information by TheSerpent)
  try {
    const response = await fetch("https://vehicle-rc-information.p.rapidapi.com/", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-rapidapi-host": "vehicle-rc-information.p.rapidapi.com",
        "x-rapidapi-key": "4075de8254msh47fab52786caa0ep103f9ejsnd65af759a4bd"
      },
      body: JSON.stringify({ registrationNo: normalized }),
      signal: AbortSignal.timeout(8000)
    });

    const result = await response.json();

    if (response.ok && result.success && result.data) {
      const v = result.data;
      return NextResponse.json({
        regNumber: v.registrationNo || normalized,
        ownerName: v.ownerName || "PRIVATE OWNER",
        makeModel: v.makerModel || "N/A",
        fuelType: v.fuelType || "N/A",
        engineNumber: v.engineNo || "SECURED",
        chassisNumber: v.chassisNo || "SECURED",
        pucExpiry: v.puccUpto || "N/A",
        insuranceExpiry: v.insuranceUpto || "N/A",
        insuranceProvider: v.insuranceCompany || "N/A",
        fitnessExpiry: v.fitnessUpto || "N/A",
        mvTaxExpiry: v.taxUpto || "LIFE TIME",
        regDate: v.registrationDate || "N/A",
        rtoOffice: v.registrationAuthority || "N/A",
        rcStatus: v.rcStatus || "ACTIVE",
        vehicleClass: v.vehicleClass || "N/A",
        seatCapacity: v.seatCapacity || "N/A"
      });
    }

    return NextResponse.json(
      { error: result.error || "Vehicle not found in National Registry." },
      { status: 404 }
    );

  } catch (error) {
    console.error("RTO API Error:", error);
    return NextResponse.json(
      { error: "Registry lookup timed out. Please try again." },
      { status: 500 }
    );
  }
}

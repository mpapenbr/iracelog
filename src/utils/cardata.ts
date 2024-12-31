export interface IrCarInfo {
  carId: number;
  name: string;
  abbrev: string;
  hasRainCapableTireTypes: boolean;
  hasMultipleDryTireTypes: boolean;
}

// source data: https://members-ng.iracing.com/data/car/get
// convert to IrCarInfo: cat cardata.json | jq '[.[] | {carId: .car_id, abbrev: .car_name_abbreviated, name: .car_name, hasRainCapableTireTypes: .has_rain_capable_tire_types, hasMultipleDryTireTypes: .has_multiple_dry_tire_types }]' > mycardata.json
export const iRacingCarData: IrCarInfo[] = [
  {
    carId: 1,
    abbrev: "SBRS",
    name: "Skip Barber Formula 2000",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 2,
    abbrev: "SK",
    name: "Modified - SK",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 3,
    abbrev: "SOL",
    name: "Pontiac Solstice",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 4,
    abbrev: "PM",
    name: "[Legacy] Pro Mazda",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 5,
    abbrev: "LEG",
    name: "Legends Ford '34 Coupe",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 10,
    abbrev: "SOL-R",
    name: "Pontiac Solstice - Rookie",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 11,
    abbrev: "LEG-R",
    name: "Legends Ford '34 Coupe - Rookie",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 12,
    abbrev: "LM",
    name: "[Retired] - Chevrolet Monte Carlo SS",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 13,
    abbrev: "SR8",
    name: "Radical SR8",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 18,
    abbrev: "SC",
    name: "Silver Crown",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 20,
    abbrev: "TRUCK",
    name: "[Legacy] NASCAR Truck Chevrolet Silverado - 2008",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 21,
    abbrev: "DP",
    name: "[Legacy] Riley MkXX Daytona Prototype - 2008",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 22,
    abbrev: "CUP",
    name: "[Legacy] NASCAR Cup Chevrolet Impala COT - 2009",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 23,
    abbrev: "SRF",
    name: "SCCA Spec Racer Ford",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 24,
    abbrev: "NW09",
    name: "ARCA Menards Chevrolet Impala",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 25,
    abbrev: "L79",
    name: "Lotus 79",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 26,
    abbrev: "C6R GT1",
    name: "Chevrolet Corvette C6.R GT1",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 27,
    abbrev: "VWTDI",
    name: "VW Jetta TDI Cup",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 28,
    abbrev: "V8SC",
    name: "[Legacy] V8 Supercar Ford Falcon - 2009",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 29,
    abbrev: "INDY",
    name: "[Legacy] Dallara IR-05",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 30,
    abbrev: "FR500",
    name: "Ford Mustang FR500S",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 31,
    abbrev: "TMOD",
    name: "Modified - NASCAR Whelen Tour",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 33,
    abbrev: "FW31",
    name: "Williams-Toyota FW31",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 34,
    abbrev: "MX5-C",
    name: "[Legacy] Mazda MX-5 Cup - 2010",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 35,
    abbrev: "MX5-R",
    name: "[Legacy] Mazda MX-5 Roadster - 2010",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 36,
    abbrev: "SS",
    name: "Street Stock - Panther C1",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 37,
    abbrev: "SPRT",
    name: "Sprint Car",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 38,
    abbrev: "IMPB",
    name: "[Legacy] NASCAR Nationwide Chevrolet Impala - 2012",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 39,
    abbrev: "ARX",
    name: "HPD ARX-01c",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 40,
    abbrev: "FGT",
    name: "Ford GT GT2",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 41,
    abbrev: "CTSVR",
    name: "Cadillac CTS-V Racecar",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 42,
    abbrev: "L49",
    name: "Lotus 49",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 43,
    abbrev: "MP4",
    name: "[Legacy] McLaren MP4-12C GT3",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 44,
    abbrev: "KIAOPT",
    name: "Kia Optima",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 45,
    abbrev: "CSS",
    name: "[Legacy] NASCAR Cup Chevrolet SS - 2013",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 46,
    abbrev: "FF",
    name: "[Legacy] NASCAR Cup Ford Fusion - 2016",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 48,
    abbrev: "R12A",
    name: "Ruf RT 12R AWD",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 49,
    abbrev: "R12R",
    name: "Ruf RT 12R RWD",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 50,
    abbrev: "R12T",
    name: "Ruf RT 12R Track",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 51,
    abbrev: "FM",
    name: "[Legacy] NASCAR Xfinity Ford Mustang - 2016",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 52,
    abbrev: "R12C",
    name: "Ruf RT 12R C-Spec",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 54,
    abbrev: "SLM",
    name: "Super Late Model",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 55,
    abbrev: "BMWZ",
    name: "[Legacy] BMW Z4 GT3",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 56,
    abbrev: "TC",
    name: "NASCAR Cup Series Toyota Camry",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 57,
    abbrev: "DW12",
    name: "[Legacy] Dallara DW12",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 58,
    abbrev: "CCB",
    name: "[Legacy] NASCAR Xfinity Chevrolet Camaro - 2014",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 59,
    abbrev: "FGT3",
    name: "Ford GT GT3",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 60,
    abbrev: "HCV8",
    name: "[Legacy] V8 Supercar Holden VF Commodore - 2014",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 61,
    abbrev: "FFV8",
    name: "[Legacy] V8 Supercar Ford FG Falcon - 2014",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 62,
    abbrev: "TT",
    name: "[Retired] NASCAR Gander Outdoors Toyota Tundra",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 63,
    abbrev: "CS",
    name: "[Retired] NASCAR Trucks Series Chevrolet Silverado - 2018",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 64,
    abbrev: "AM1",
    name: "Aston Martin DBR9 GT1",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 67,
    abbrev: "MX16",
    name: "Global Mazda MX-5 Cup",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 69,
    abbrev: "NXTC",
    name: "[Legacy] NASCAR Xfinity Toyota Camry - 2015",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 70,
    abbrev: "C7DP",
    name: "Chevrolet Corvette C7 Daytona Prototype",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 71,
    abbrev: "MP430",
    name: "McLaren MP4-30",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: true,
  },
  {
    carId: 72,
    abbrev: "MGT3",
    name: "[Legacy] Mercedes-AMG GT3",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 73,
    abbrev: "AR8",
    name: "[Legacy] Audi R8 LMS GT3",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 74,
    abbrev: "F20",
    name: "Formula Renault 2.0",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 76,
    abbrev: "A90",
    name: "Audi 90 GTO",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 77,
    abbrev: "ZXT",
    name: "Nissan GTP ZX-T",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 78,
    abbrev: "DLM350",
    name: "Dirt Late Model - Limited",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 79,
    abbrev: "SSD",
    name: "Dirt Street Stock",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 80,
    abbrev: "DSC305",
    name: "Dirt Sprint Car - 305",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 81,
    abbrev: "FF-WSC",
    name: "Ford Fiesta RS WRC",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 82,
    abbrev: "LEG-D",
    name: "Dirt Legends Ford '34 Coupe",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 83,
    abbrev: "DLM358",
    name: "Dirt Late Model - Pro",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 84,
    abbrev: "DLM438",
    name: "Dirt Late Model - Super",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 85,
    abbrev: "DSC360",
    name: "Dirt Sprint Car - 360",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 86,
    abbrev: "DSC410",
    name: "Dirt Sprint Car - 410",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 87,
    abbrev: "DS360NW",
    name: "Dirt Sprint Car - 360 Non-Winged",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 88,
    abbrev: "P911",
    name: "[Legacy] Porsche 911 GT3 Cup (991)",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 89,
    abbrev: "DS410NW",
    name: "Dirt Sprint Car - 410 Non-Winged",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 91,
    abbrev: "VWB",
    name: "VW Beetle",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 92,
    abbrev: "FGT7",
    name: "Ford GTE",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 93,
    abbrev: "488E",
    name: "Ferrari 488 GTE",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 94,
    abbrev: "488T3",
    name: "[Legacy] Ferrari 488 GT3",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 95,
    abbrev: "UMP",
    name: "Dirt UMP Modified",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 96,
    abbrev: "DM",
    name: "Dirt Midget",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 98,
    abbrev: "AR18",
    name: "Audi R18",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 99,
    abbrev: "IR18",
    name: "Dallara IR18",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: true,
  },
  {
    carId: 100,
    abbrev: "919",
    name: "Porsche 919",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 101,
    abbrev: "WRX",
    name: "Subaru WRX STI",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 102,
    abbrev: "RSR",
    name: "Porsche 911 RSR",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 103,
    abbrev: "ZL1",
    name: "NASCAR Cup Series Chevrolet Camaro ZL1",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 104,
    abbrev: "PRO2",
    name: "Lucas Oil Off Road Pro 2 Truck",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 105,
    abbrev: "F35",
    name: "Formula Renault 3.5",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 106,
    abbrev: "F317",
    name: "Dallara F3",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 107,
    abbrev: "PRO4",
    name: "Lucas Oil Off Road Pro 4 Truck",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 109,
    abbrev: "BMWM8",
    name: "BMW M8 GTE",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 110,
    abbrev: "FM2019",
    name: "NASCAR Cup Series Ford Mustang",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 111,
    abbrev: "CS2019",
    name: "NASCAR Truck Chevrolet Silverado",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 112,
    abbrev: "RS3",
    name: "Audi RS 3 LMS TCR",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 113,
    abbrev: "PRO2L",
    name: "Lucas Oil Off Road Pro 2 Lite",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 114,
    abbrev: "XCC",
    name: "NASCAR XFINITY Chevrolet Camaro",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 115,
    abbrev: "XFM",
    name: "NASCAR XFINITY Ford Mustang",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 116,
    abbrev: "XTS",
    name: "NASCAR XFINITY Toyota Supra",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 117,
    abbrev: "HZBC",
    name: "[Legacy] Supercars Holden ZB Commodore",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 118,
    abbrev: "FMGT",
    name: "[Legacy] Supercars Ford Mustang GT",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 119,
    abbrev: "P718",
    name: "Porsche 718 Cayman GT4 Clubsport MR",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 120,
    abbrev: "PM18",
    name: "Indy Pro 2000 PM-18",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 121,
    abbrev: "PM17",
    name: "USF 2000",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 122,
    abbrev: "BMWM4",
    name: "BMW M4 F82 GT4 - 2018",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 123,
    abbrev: "F150",
    name: "NASCAR Truck Ford F150",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 124,
    abbrev: "C87",
    name: "NASCAR Legends Chevrolet Monte Carlo - 1987",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 125,
    abbrev: "F87",
    name: "NASCAR Legends Ford Thunderbird - 1987",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 127,
    abbrev: "C8R",
    name: "Chevrolet Corvette C8.R GTE",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 128,
    abbrev: "P217",
    name: "Dallara P217",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 129,
    abbrev: "IR01",
    name: "Dallara iR-01",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: true,
  },
  {
    carId: 131,
    abbrev: "BBM",
    name: "Dirt Big Block Modified",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 132,
    abbrev: "M4GT3",
    name: "BMW M4 GT3",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 133,
    abbrev: "LGT3",
    name: "Lamborghini Huracán GT3 EVO",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 134,
    abbrev: "358MOD",
    name: "Dirt 358 Modified",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 135,
    abbrev: "M570S",
    name: "McLaren 570S GT4",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 137,
    abbrev: "PGTR",
    name: "[Legacy] Porsche 911 GT3 R",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 138,
    abbrev: "VWBL",
    name: "VW Beetle - Lite",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 139,
    abbrev: "NGC",
    name: "NASCAR Cup Series Next Gen Chevrolet Camaro ZL1",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 140,
    abbrev: "NGF",
    name: "NASCAR Cup Series Next Gen Ford Mustang",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 141,
    abbrev: "NGT",
    name: "NASCAR Cup Series Next Gen Toyota Camry",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 142,
    abbrev: "FVEE",
    name: "Formula Vee",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 143,
    abbrev: "P992",
    name: "Porsche 911 GT3 Cup (992)",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 144,
    abbrev: "FEVO",
    name: "Ferrari 488 GT3 Evo 2020",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 145,
    abbrev: "MW12",
    name: "Mercedes-AMG W12 E Performance",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: true,
  },
  {
    carId: 146,
    abbrev: "HECN7",
    name: "Hyundai Elantra N TCR",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 147,
    abbrev: "HCTR",
    name: "Honda Civic Type R TCR",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 148,
    abbrev: "F4",
    name: "FIA F4",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 149,
    abbrev: "SR10",
    name: "Radical SR10",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 150,
    abbrev: "AMV4",
    name: "Aston Martin Vantage GT4",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 151,
    abbrev: "SCCC",
    name: "Stock Car Brasil Chevrolet Cruze",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 152,
    abbrev: "SCTC",
    name: "Stock Car Brasil Toyota Corolla",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 153,
    abbrev: "HVTC",
    name: "Hyundai Veloster N TCR",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 154,
    abbrev: "B87",
    name: "NASCAR Legends Buick LeSabre - 1987",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 155,
    abbrev: "TTP",
    name: "NASCAR Truck Toyota Tundra TRD Pro",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 156,
    abbrev: "MGT3E",
    name: "Mercedes-AMG GT3 2020",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 157,
    abbrev: "MGT4",
    name: "Mercedes-AMG GT4",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 158,
    abbrev: "PMR",
    name: "Porsche Mission R",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 159,
    abbrev: "BMWGTP",
    name: "BMW M Hybrid V8",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 160,
    abbrev: "GR86",
    name: "Toyota GR86",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 161,
    abbrev: "MW13",
    name: "Mercedes-AMG W13 E Performance",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: true,
  },
  {
    carId: 162,
    abbrev: "RENC",
    name: "Renault Clio",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 163,
    abbrev: "GR22",
    name: "Ray FF1600",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 164,
    abbrev: "LM23",
    name: "Late Model Stock",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 165,
    abbrev: "LJSP",
    name: "Ligier JS P320",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 167,
    abbrev: "G4CUP",
    name: "Gen 4 Cup",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 168,
    abbrev: "CGTP",
    name: "Cadillac V-Series.R GTP",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 169,
    abbrev: "992R",
    name: "Porsche 911 GT3 R (992)",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 170,
    abbrev: "AGTP",
    name: "Acura ARX-06 GTP",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 171,
    abbrev: "SF23T",
    name: "Super Formula SF23 - Toyota",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 172,
    abbrev: "SF23H",
    name: "Super Formula SF23 - Honda",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 173,
    abbrev: "F296",
    name: "Ferrari 296 GT3",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 174,
    abbrev: "PGTP",
    name: "Porsche 963 GTP",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 175,
    abbrev: "P87",
    name: "NASCAR Legends Pontiac Grand Prix - 1987",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 176,
    abbrev: "AEVO2",
    name: "Audi R8 LMS EVO II GT3",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 178,
    abbrev: "SFL324",
    name: "Super Formula Lights",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 179,
    abbrev: "SRX",
    name: "SRX",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 180,
    abbrev: "MSCW",
    name: "Dirt Micro Sprint Car - Winged",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 181,
    abbrev: "MSCNW",
    name: "Dirt Micro Sprint Car - Non-Winged",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 182,
    abbrev: "MSCOW",
    name: "Dirt Outlaw Micro Sprint Car - Winged",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 183,
    abbrev: "MSCONW",
    name: "Dirt Outlaw Micro Sprint Car - Non-Winged",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 184,
    abbrev: "CZ06",
    name: "Chevrolet Corvette Z06 GT3.R",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 185,
    abbrev: "FMGT3",
    name: "Ford Mustang GT3",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: true,
  },
  {
    carId: 186,
    abbrev: "SSC",
    name: "Street Stock - Casino M2",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 187,
    abbrev: "SSE",
    name: "Street Stock - Eagle T3",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 188,
    abbrev: "720GT3",
    name: "McLaren 720S GT3 EVO",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 189,
    abbrev: "BMWGT4",
    name: "BMW M4 G82 GT4",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 190,
    abbrev: "SFMG3",
    name: "Supercars Ford Mustang Gen 3",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 191,
    abbrev: "MNSTK",
    name: "Mini Stock",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 192,
    abbrev: "SCCG3",
    name: "Supercars Chevrolet Camaro Gen 3",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 193,
    abbrev: "DMNST",
    name: "Dirt Mini Stock",
    hasRainCapableTireTypes: false,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 194,
    abbrev: "NSXE22",
    name: "Acura NSX GT3 EVO 22",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 195,
    abbrev: "BMWM2",
    name: "BMW M2 CS Racing",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
  {
    carId: 196,
    abbrev: "F499P",
    name: "Ferrari 499P",
    hasRainCapableTireTypes: true,
    hasMultipleDryTireTypes: false,
  },
];

export const iRacingCarDataLookup: Map<number, IrCarInfo> = new Map<number, IrCarInfo>(
  iRacingCarData.map((item) => [item.carId, item]),
);

export interface ClientMock {
  id: string;
  nom: string;
  type: "SA" | "SPRL" | "NV" | "SCS" | "Indépendant";
  email: string;
  tel: string;
  rue: string;
  numero: string;
  codePostal: string;
  ville: string;
  pays: string;
  since: string;
  expeditions: number;
  ca: number;
  actif: boolean;
  tva?: string;
  contactPerson?: string;
  recentShipments?: Array<{ id: string; date: string; destination: string; status: string; total: number }>;
}

export const MOCK_CLIENTS: ClientMock[] = [
  {
    id: "CLT-001",
    nom: "Dupont SA",
    type: "SA",
    email: "contact@dupont.be",
    tel: "+32 2 123 45 67",
    rue: "Rue de la Loi",
    numero: "16",
    codePostal: "1000",
    ville: "Bruxelles",
    pays: "Belgique",
    since: "2021-03",
    expeditions: 48,
    ca: 28400,
    actif: true,
    tva: "BE 0123.456.789",
    contactPerson: "Jean Dupont",
    recentShipments: [
      { id: "EXP-8901", date: "2026-08-15", destination: "Paris, France", status: "En transit", total: 145.50 },
      { id: "EXP-8890", date: "2026-08-10", destination: "Lyon, France", status: "Livré", total: 98.00 },
      { id: "EXP-8722", date: "2026-07-28", destination: "Berlin, Allemagne", status: "Livré", total: 210.00 },
    ],
  },
  {
    id: "CLT-002",
    nom: "Leroy SPRL",
    type: "SPRL",
    email: "info@leroy.be",
    tel: "+32 9 234 56 78",
    rue: "Veldstraat",
    numero: "42",
    codePostal: "9000",
    ville: "Gand",
    pays: "Belgique",
    since: "2022-01",
    expeditions: 23,
    ca: 14200,
    actif: true,
    tva: "BE 0987.654.321",
    contactPerson: "Sophie Leroy",
    recentShipments: [
      { id: "EXP-8902", date: "2026-08-14", destination: "Madrid, Espagne", status: "En transit", total: 320.00 },
      { id: "EXP-8850", date: "2026-08-02", destination: "Anvers, Belgique", status: "Livré", total: 45.00 },
    ],
  },
  {
    id: "CLT-003",
    nom: "Martin & Co",
    type: "Indépendant",
    email: "martin@martinco.be",
    tel: "+32 4 345 67 89",
    rue: "Rue Cathédrale",
    numero: "8",
    codePostal: "4000",
    ville: "Liège",
    pays: "Belgique",
    since: "2023-06",
    expeditions: 12,
    ca: 6800,
    actif: true,
    tva: "BE 0555.444.333",
    contactPerson: "Marc Martin",
    recentShipments: [
      { id: "EXP-8899", date: "2026-08-11", destination: "Lille, France", status: "Livré", total: 78.20 },
    ],
  },
  {
    id: "CLT-004",
    nom: "Verbeke NV",
    type: "NV",
    email: "logistics@verbeke.be",
    tel: "+32 3 456 78 90",
    rue: "Meir",
    numero: "105",
    codePostal: "2000",
    ville: "Anvers",
    pays: "Belgique",
    since: "2020-11",
    expeditions: 87,
    ca: 52100,
    actif: true,
    tva: "BE 0444.333.222",
    contactPerson: "Karel Verbeke",
    recentShipments: [
      { id: "EXP-8910", date: "2026-08-16", destination: "Rotterdam, Pays-Bas", status: "En transit", total: 180.00 },
      { id: "EXP-8877", date: "2026-08-08", destination: "Amsterdam, Pays-Bas", status: "Livré", total: 240.00 },
    ],
  },
  {
    id: "CLT-005",
    nom: "Duchêne SCS",
    type: "SCS",
    email: "admin@duchene.be",
    tel: "+32 81 567 89 01",
    rue: "Rue de Fer",
    numero: "23",
    codePostal: "5000",
    ville: "Namur",
    pays: "Belgique",
    since: "2022-08",
    expeditions: 9,
    ca: 3200,
    actif: false,
    tva: "BE 0777.888.999",
    contactPerson: "Claire Duchêne",
    recentShipments: [],
  },
  {
    id: "CLT-006",
    nom: "Claes Import",
    type: "SA",
    email: "import@claes.be",
    tel: "+32 2 678 90 12",
    rue: "Avenue Louise",
    numero: "250",
    codePostal: "1050",
    ville: "Bruxelles",
    pays: "Belgique",
    since: "2021-05",
    expeditions: 34,
    ca: 31600,
    actif: true,
    tva: "BE 0222.111.999",
    contactPerson: "Luc Claes",
    recentShipments: [
      { id: "EXP-8895", date: "2026-08-12", destination: "Milan, Italie", status: "Livré", total: 410.00 },
    ],
  },
  {
    id: "CLT-007",
    nom: "Peeters Logics",
    type: "NV",
    email: "ops@peeters.be",
    tel: "+32 50 789 01 23",
    rue: "Steenstraat",
    numero: "14",
    codePostal: "8000",
    ville: "Bruges",
    pays: "Belgique",
    since: "2023-01",
    expeditions: 18,
    ca: 11400,
    actif: true,
    tva: "BE 0333.666.999",
    contactPerson: "Jan Peeters",
    recentShipments: [],
  },
];

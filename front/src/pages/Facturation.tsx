import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api.service";

type PayStatus = "payee" | "en_attente" | "en_retard";

interface Facture {
  id: string;
  invoiceNumber: string;
  ref: string;
  client: string;
  date: string;
  echeance: string;
  montantHT: number;
  tva: number;
  status: PayStatus;
}

const STATUS_STYLE: Record<PayStatus, { label: string; bg: string; color: string }> = {
  payee:      { label: "Payée",      bg: "#EAF3DE", color: "#27500A" },
  en_attente: { label: "En attente", bg: "#FAEEDA", color: "#633806" },
  en_retard:  { label: "En retard",  bg: "#FCEBEB", color: "#791F1F" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(n);

export default function Facturation() {
  const { user } = useAuth();
  const [facturesList, setFacturesList] = useState<Facture[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<PayStatus | "">("");
  const [selectedInvoice, setSelectedInvoice] = useState<Facture | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<{ type: "success" | "cancel"; message: string } | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  const loadInvoices = () => {
    apiService.getInvoices()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          const mapped: Facture[] = res.map((inv: any, idx: number) => {
            let st: PayStatus = "en_attente";
            if (inv.paymentStatus === "PAID" || inv.paymentStatus === "payee") st = "payee";
            else if (inv.paymentStatus === "OVERDUE" || inv.paymentStatus === "en_retard") st = "en_retard";

            const clientName = inv.user?.firstName
              ? `${inv.user.firstName} ${inv.user.lastName}`
              : (inv.user?.email ? inv.user.email : "");

            const dateStr = inv.issuedAt ? new Date(inv.issuedAt).toISOString().slice(0, 10) : "";
            const dueStr = inv.issuedAt
              ? new Date(new Date(inv.issuedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
              : "";

            return {
              id: inv.id,
              invoiceNumber: inv.invoiceNumber ? inv.invoiceNumber : `FAC-2026-${String(idx + 1).padStart(3, "0")}`,
              ref: inv.request?.fedexTrackingNumber ? inv.request.fedexTrackingNumber : (inv.request?.id ? `EXP-${inv.request.id.slice(0, 6)}` : ""),
              client: clientName,
              date: dateStr,
              echeance: dueStr,
              montantHT: Number(inv.amountExclVat) || 0,
              tva: Number(inv.vatRate) || 21,
              status: st,
            };
          });
          setFacturesList(mapped);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadInvoices();

    const query = new URLSearchParams(window.location.search);
    const payment = query.get("payment");
    const sessionId = query.get("session_id");

    if (payment === "success" && sessionId) {
      apiService.verifyStripePayment(sessionId)
        .then(() => {
          loadInvoices();
          setPaymentFeedback({
            type: "success",
            message: "Paiement validé avec succès par Stripe ! Votre facture est désormais enregistrée comme Payée.",
          });
        })
        .catch(() => {
          loadInvoices();
        });
    } else if (payment === "cancel") {
      setPaymentFeedback({
        type: "cancel",
        message: "Paiement annulé. Vous pouvez réessayer le règlement de votre facture à tout moment.",
      });
    }
  }, []);

  const handlePayStripe = async (f: Facture) => {
    setPayingInvoiceId(f.id);
    try {
      const ttc = f.montantHT * (1 + f.tva / 100);
      const res = await apiService.createStripeCheckoutSession(f.id, ttc);
      if (res?.url) {
        window.open(res.url, "_blank");
      }
    } catch (err) {
      setPaymentFeedback({
        type: "cancel",
        message: "Impossible d'initialiser la session de paiement Stripe. Veuillez réessayer.",
      });
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const data = facturesList
    .filter((f) => {
      if (!user || user.role === "admin" || user.role === "superadmin") return true;
      return (
        f.client.toLowerCase().includes(user.name.toLowerCase()) ||
        f.client.toLowerCase().includes(user.email.toLowerCase())
      );
    })
    .filter((f) => filterStatus ? f.status === filterStatus : true)
    .filter((f) =>
      [f.id, f.invoiceNumber, f.ref, f.client].join(" ").toLowerCase().includes(search.toLowerCase())
    );

  const totalHT  = data.reduce((s, f) => s + f.montantHT, 0);
  const totalTTC = data.reduce((s, f) => s + f.montantHT * (1 + f.tva / 100), 0);

  return (
    <div className="space-y-5">
      {paymentFeedback && (
        <div
          className="p-4 rounded-xl flex items-center justify-between text-xs font-medium"
          style={{
            background: paymentFeedback.type === "success" ? "#E1F5EE" : "#FCEBEB",
            color: paymentFeedback.type === "success" ? "#085041" : "#791F1F",
            border: `1px solid ${paymentFeedback.type === "success" ? "#9FE1CB" : "#F7C1C1"}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span>{paymentFeedback.type === "success" ? "✓" : "⚠️"}</span>
            <span>{paymentFeedback.message}</span>
          </div>
          <button onClick={() => setPaymentFeedback(null)} className="font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Facturation & Paiements
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {data.length} facture{data.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total HT",      value: fmt(totalHT)  },
          { label: "Total TTC",     value: fmt(totalTTC) },
          { label: "En attente",    value: fmt(data.filter(f => f.status === "en_attente").reduce((s, f) => s + f.montantHT * 1.21, 0)) },
          { label: "En retard",     value: fmt(data.filter(f => f.status === "en_retard").reduce((s, f) => s + f.montantHT * 1.21, 0)) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-4 rounded-xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher par N°, réf, client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs outline-none"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            width: "240px",
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PayStatus | "")}
          className="px-3 py-2 rounded-xl text-xs outline-none"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="payee">Payée</option>
          <option value="en_attente">En attente</option>
          <option value="en_retard">En retard</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
              {["N° Facture", "Réf.", "Client", "Date", "Échéance", "HT", "TVA", "TTC", "Statut", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                  Aucune facture trouvée
                </td>
              </tr>
            ) : data.map((f, i) => {
              const s = STATUS_STYLE[f.status];
              const ttc = f.montantHT * (1 + f.tva / 100);
              return (
                <tr
                  key={f.id}
                  style={{
                    background: i % 2 === 0 ? "var(--bg-app)" : "var(--bg-surface)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{f.invoiceNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{f.ref}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{f.client}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{f.date}</td>
                  <td
                    className="px-4 py-3"
                    style={{ color: f.status === "en_retard" ? "#A32D2D" : "var(--text-muted)" }}
                  >
                    {f.echeance}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{fmt(f.montantHT)}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{f.tva}%</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(ttc)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {f.status !== "payee" && (
                        <button
                          onClick={() => handlePayStripe(f)}
                          disabled={payingInvoiceId === f.id}
                          className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1 text-white"
                          style={{
                            background: "#059669",
                          }}
                        >
                          {payingInvoiceId === f.id ? "Connexion..." : "💳 Payer"}
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedInvoice(f)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
                        style={{
                          background: "#4338CA",
                          color: "#FFFFFF",
                        }}
                      >
                        📄 PDF
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <style>{`
            @page {
              size: A4 portrait;
              margin: 0;
            }
            @media print {
              body * {
                visibility: hidden !important;
              }
              #invoice-a4-sheet, #invoice-a4-sheet * {
                visibility: visible !important;
              }
              #invoice-a4-sheet {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 210mm !important;
                min-height: 297mm !important;
                margin: 0 !important;
                padding: 20mm !important;
                box-shadow: none !important;
                border: none !important;
                background: #FFFFFF !important;
                color: #000000 !important;
              }
            }
          `}</style>

          <div className="flex flex-col items-center max-h-screen my-4">
            <div className="w-full max-w-[210mm] flex items-center justify-between pb-3 text-white">
              <h3 className="font-bold text-base">
                📄 Facture Format A4 : {selectedInvoice.invoiceNumber}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-xs px-4 py-2 rounded-xl text-white font-medium flex items-center gap-1.5 shadow-lg"
                  style={{ background: "#4338CA" }}
                >
                  🖨️ Imprimer / Enregistrer en PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white/20 hover:bg-white/30 text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              id="invoice-a4-sheet"
              className="w-[210mm] min-h-[297mm] p-[20mm] bg-white text-slate-900 shadow-2xl flex flex-col justify-between text-xs"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <div>
                <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-6">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-indigo-950">UNISHIP LOGISTICS SA</h1>
                    <p className="text-slate-600 text-xs mt-1">Rue de la Loi 16, 1000 Bruxelles, Belgique</p>
                    <p className="text-slate-600 text-xs">TVA : BE 0123.456.789 • RPM Bruxelles</p>
                    <p className="text-slate-600 text-xs">Email : billing@uniship.be • Tél : +32 2 555 0199</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-indigo-900 tracking-wider">FACTURE</span>
                    <p className="font-mono text-sm font-bold text-slate-800 mt-1">{selectedInvoice.invoiceNumber}</p>
                    <p className="text-slate-600 text-xs mt-1">Date d'émission : <strong>{selectedInvoice.date}</strong></p>
                    <p className="text-slate-600 text-xs">Date d'échéance : <strong>{selectedInvoice.echeance}</strong></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 my-8">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Facturé à (Client)</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedInvoice.client}</p>
                    <p className="text-xs text-slate-600">Compte Professionnel Uniship</p>
                    <p className="text-xs text-slate-600">Numéro de compte : ACC-84920</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Détails de l'Expédition</span>
                    <p className="text-sm font-bold text-slate-900 mt-1 font-mono">{selectedInvoice.ref}</p>
                    <p className="text-xs text-slate-600">Transporteur : FedEx Express</p>
                    <p className="text-xs text-slate-600">Mode : Livraison Express Internationale</p>
                  </div>
                </div>

                <table className="w-full text-left border-collapse my-6">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-xs font-bold text-slate-700 uppercase">
                      <th className="py-3">Description de la prestation</th>
                      <th className="py-3 text-right">Montant HT</th>
                      <th className="py-3 text-right">Taux TVA</th>
                      <th className="py-3 text-right">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    <tr>
                      <td className="py-4">
                        <p className="font-bold text-slate-900 text-sm">Fret & Transport Express de marchandises</p>
                        <p className="text-xs text-slate-500 mt-0.5">Dossier d'expédition {selectedInvoice.ref} • Acheminement garanti</p>
                      </td>
                      <td className="py-4 text-right font-mono font-medium text-slate-800">{fmt(selectedInvoice.montantHT)}</td>
                      <td className="py-4 text-right font-mono font-medium text-slate-800">{selectedInvoice.tva}%</td>
                      <td className="py-4 text-right font-mono font-bold text-slate-950">
                        {fmt(selectedInvoice.montantHT * (1 + selectedInvoice.tva / 100))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <div className="border-t-2 border-slate-300 pt-6 flex justify-between items-start">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="font-bold text-slate-800">Conditions de règlement :</p>
                    <p>Règlement par virement bancaire sous 30 jours.</p>
                    <p>IBAN : <strong>BE71 0012 3456 7890</strong></p>
                    <p>BIC : <strong>GEBABEBB</strong></p>
                    <p>Communication obligatoire : <strong>{selectedInvoice.invoiceNumber}</strong></p>
                  </div>

                  <div className="w-64 space-y-2 text-right">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Total HT :</span>
                      <span className="font-mono font-medium">{fmt(selectedInvoice.montantHT)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>TVA (21.00%) :</span>
                      <span className="font-mono font-medium">{fmt(selectedInvoice.montantHT * (selectedInvoice.tva / 100))}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-indigo-950 border-t-2 border-indigo-900 pt-2">
                      <span>TOTAL TTC :</span>
                      <span className="font-mono">{fmt(selectedInvoice.montantHT * (1 + selectedInvoice.tva / 100))}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 mt-10 pt-4 text-center text-[10px] text-slate-400">
                  UNISHIP LOGISTICS SA • RPM Bruxelles • Numéro d'entreprise : 0123.456.789 • Document généré automatiquement et certifié conforme.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
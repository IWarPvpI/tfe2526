import { useNavigate } from "react-router-dom";

export default function Legal() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Informations Légales & Conformité
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Mentions Légales, Politique de Confidentialité (RGPD) et Conditions Générales d'Utilisation (CGU)
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border cursor-pointer transition-colors"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          ← Retour
        </button>
      </div>

      <section
        className="p-6 rounded-2xl space-y-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="text-xl">🏢</span>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            1. Mentions Légales (Obligatoire en Belgique)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <p className="font-semibold" style={{ color: "var(--text-muted)" }}>Dénomination & Forme juridique</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Uniship SRL</p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold" style={{ color: "var(--text-muted)" }}>Numéro d'entreprise & TVA</p>
            <p className="text-sm font-mono font-medium" style={{ color: "var(--text-primary)" }}>BCE / TVA BE 0123.456.789</p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold" style={{ color: "var(--text-muted)" }}>Siège social</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Avenue Louise 500, 1050 Bruxelles, Belgique
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold" style={{ color: "var(--text-muted)" }}>Coordonnées de contact</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              ✉ contact@uniship.be &nbsp;|&nbsp; ☎ +32 (0)2 555 01 23
            </p>
          </div>
        </div>

        <div className="pt-3 border-t text-xs space-y-1" style={{ borderColor: "var(--border)" }}>
          <p className="font-semibold" style={{ color: "var(--text-muted)" }}>Hébergeur de la plateforme</p>
          <p style={{ color: "var(--text-primary)" }}>
            Amazon Web Services EMEA SARL (AWS Europe) — 38 Avenue John F. Kennedy, L-1855 Luxembourg
          </p>
        </div>
      </section>

      <section
        className="p-6 rounded-2xl space-y-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="text-xl">🔒</span>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            2. Politique de Confidentialité (RGPD)
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Données collectées</p>
            <p style={{ color: "var(--text-muted)" }}>
              Nom, prénom, adresse e-mail professionnelle, numéro de téléphone, adresses de départ et de destination des expéditions, adresses IP, journaux de connexion et documents logistiques/factures.
            </p>
          </div>

          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Finalités du traitement</p>
            <p style={{ color: "var(--text-muted)" }}>
              Gestion des accès à la plateforme SaaS, cotation et exécution des commandes d'expéditions via les transporteurs partenaires (ex: FedEx), génération et suivi de la facturation, sécurité et traçabilité des opérations.
            </p>
          </div>

          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Bases légales</p>
            <p style={{ color: "var(--text-muted)" }}>
              Exécution des obligations contractuelles B2B, respect des obligations légales comptables et fiscales belges, et intérêt légitime lié à la sécurité des systèmes d'information.
            </p>
          </div>

          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Durée de conservation</p>
            <p style={{ color: "var(--text-muted)" }}>
              Durée de la relation commerciale active, puis archivage sécurisé pendant une durée légale de 10 ans pour les données comptables et contractuelles conformément au droit belge.
            </p>
          </div>

          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Exercice de vos droits & Délégué à la Protection des Données</p>
            <p style={{ color: "var(--text-muted)" }}>
              Pour toute demande d'accès, de rectification ou d'effacement de vos données, vous pouvez contacter notre référent par e-mail à :{" "}
              <a href="mailto:privacy@uniship.be" className="underline font-semibold" style={{ color: "var(--accent)" }}>
                privacy@uniship.be
              </a>
              . En cas de litige non résolu, vous disposez du droit d'introduire une réclamation auprès de l'Autorité de Protection des Données (APD) : Rue de la Presse 35, 1000 Bruxelles (contact@apd-gba.be).
            </p>
          </div>
        </div>
      </section>

      <section
        className="p-6 rounded-2xl space-y-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="text-xl">📜</span>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            3. Conditions Générales d'Utilisation (CGU - B2B)
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Usage strictement réservé</p>
            <p style={{ color: "var(--text-muted)" }}>
              L'accès à la plateforme Uniship est réservé à un usage strictement professionnel (B2B). Chaque compte utilisateur est nominatif et individuel. Le partage des identifiants ou leur divulgation à des tiers non habilités est strictement interdit.
            </p>
          </div>

          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Propriété et validité des données</p>
            <p style={{ color: "var(--text-muted)" }}>
              L'entreprise cliente et ses utilisateurs certifient détenir l'ensemble des autorisations et droits requis sur les fichiers téléversés, adresses saisies et données transmises pour l'exécution des ordres logistiques.
            </p>
          </div>

          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Limitation de responsabilité</p>
            <p style={{ color: "var(--text-muted)" }}>
              Uniship déploie tous les moyens techniques pour assurer la disponibilité du service. Toutefois, sa responsabilité ne saurait être engagée en cas d'interruption temporaire pour maintenance, d'incident imputable aux réseaux de transporteurs tiers, ou d'usage frauduleux consécutif à une compromission des identifiants par l'utilisateur.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

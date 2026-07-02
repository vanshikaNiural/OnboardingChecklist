'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const PARTIES = [
  {
    id: 'client',
    label: 'Client',
    description: 'What the client provides and approves to enable payroll and payments for their entity.',
    color: 'from-purple-500 to-pink-500',
    icon: '🏢'
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'What each worker completes to receive salary payments through Niural.',
    color: 'from-pink-500 to-red-500',
    icon: '👤'
  },
  {
    id: 'icp',
    label: 'ICP',
    description: 'In-country payroll partner. What we need from them and what we hand over to run payroll.',
    color: 'from-teal-500 to-green-500',
    icon: '🌍'
  },
  {
    id: 'navro',
    label: 'Navro',
    description: 'Payment gateway. KYB validation, beneficiary setup, and per-cycle disbursement.',
    color: 'from-blue-500 to-cyan-500',
    icon: '💳'
  },
  {
    id: 'internal',
    label: 'Internal',
    description: 'Niural ops. Country config, entity admin, G2N processing, approval chain, and treasury handoff.',
    color: 'from-slate-500 to-gray-500',
    icon: '⚙️'
  }
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const supabase = createClient();

        // Check if tables exist and have data
        const { data: items } = await supabase
          .from('onboarding_items')
          .select('*')
          .limit(1);

        // If no data, seed the database with initial data
        if (!items || items.length === 0) {
          await seedDatabase(supabase);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    };

    initializeData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Initializing Niural onboarding...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error initializing dashboard</p>
          <p className="text-sm mt-2">{error}</p>
          <p className="text-xs mt-4 text-gray-600">
            Make sure your Supabase credentials are configured in .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              n
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Niural Onboarding</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Global payroll onboarding & payment readiness. Every item below is a prerequisite to paying a worker. Track ownership, status, and the gates that block downstream work.
          </p>
        </div>

        {/* Party selector grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {PARTIES.map((party) => (
            <Link
              key={party.id}
              href={`/${party.id}`}
              className="group"
            >
              <div className="h-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition hover:border-gray-300 cursor-pointer">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${party.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition`}>
                  {party.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {party.label}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {party.description}
                </p>
                <div className="text-xs font-medium text-purple-600 group-hover:text-purple-700">
                  View dashboard →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-600">
          <p>Select a party above to view and edit their onboarding checklist</p>
        </div>
      </div>
    </div>
  );
}

async function seedDatabase(supabase: any) {
  // Full original data from validation with Liz
  const DATA = {
    client: [
      { stage: 2, items: [
        { t: "Account activation completed", d: "Client activates the global payroll product for their account.", rv: { tag: "renamed", type: "changed", note: "Was \"Product activation completed.\" Liz: \"I'd say account activation completed.\"" } },
        { sub: "Verification (KYC / AML)" },
        { t: "Entity details submitted", d: "Legal entity name, DBA, country of incorporation, entity type, date of incorporation, local registration number, company website, phone, employee count, nature of business, registered address, mailing address.", rv: { tag: "restructured", type: "changed", note: "Renamed to Verification (KYC/AML). Tax IDs and formation docs now grouped under this section." } },
        { t: "Business formation documents uploaded", d: "Formation documents (not only incorporation). Includes Ultimate Beneficial Owner (UBO) details: anyone with ≥15% ownership (UK/EU) or ≥25% (US). Complex structures (hedge funds, layered ownership) need manual review and can delay go-live if missed.", rv: { tag: "renamed", type: "changed", note: "Was \"Incorporation docs uploaded.\" Liz: \"It's not just incorporation docs — call it business formation.\" UBO requirement added." } },
        { t: "Tax IDs provided", d: "All applicable tax identification numbers for the entity (EIN, VAT, local tax ID per country)." },
        { t: "Bank details submitted", gate: true, d: "Entity bank account details — capture bank country and funding currency (USD vs local). Required for bank verification and funding capability.", rv: { tag: "expanded", type: "changed", note: "Liz: \"What country is the bank account in? Are we funding in USD or local currency?\"" } },
        { t: "Signatories designated", d: "Authorized signatories identified and confirmed.", rv: { tag: "removed", type: "removed", note: "Liz: \"I don't think we need that — it's only asked when I send an MSA or similar.\"" } },
        { t: "Billing info configured", d: "Billing setup type and payment method for Niural platform fees." },
        { t: "KYB verified", gate: true, d: "Three-party gate: client provides ownership docs, address proof, identity and bank verification → validated → Internal approves global payroll. Once verified, ops switches the account to verified in-platform. Unlocks bank payments, funding, and payout readiness.", rv: { tag: "updated", type: "changed", note: "Liz: \"Once verified, we switch it to verified in-platform and the account is active.\" Partner-agnostic language." } }
      ]},
      { stage: 3, items: [
        { t: "Employee details entered", d: "Per employee: personal details (include personal email, not only work email), employment details, compensation type and amount, and org position." },
        { t: "Employee agreements and documents submitted", d: "Client provides pre-signed employment agreements and related documents. Niural does not generate contracts — they come from the client.", rv: { tag: "renamed", type: "changed", note: "Was \"Employment agreements + documents configured.\" Liz: \"We're not creating contracts — the client issues agreements to their workers.\"" } }
      ]},
      { stage: 5, recurring: true, items: [
        { t: "Payroll files reviewed and approved each cycle", gate: true, recurring: true, d: "Payroll files submitted for client review. The client reviews and approves the run each cycle before the funding instruction is sent.", rv: { tag: "reworded", type: "changed", note: "Liz: \"I'd put payroll files submitted for client review and approval.\" Partner references removed." } }
      ]}
    ],
    employee: [
      { stage: 3, items: [
        { t: "Invite received and accepted", d: "Employee receives the Niural invite and creates their account." },
        { t: "Employment agreement signed", d: "Employee electronically signs their employment agreement.", rv: { tag: "removed", type: "removed", note: "Liz: \"Take that out — this is global payroll. There's no agreement for them to sign; it comes from the client.\"" } },
        { t: "Personal info validated", d: "Full legal name, residential address, employment start date, personal email, reliable contact number, emergency contact and relationship, and beneficiaries.", rv: { tag: "expanded", type: "changed", note: "Liz: \"Capture emergency contact and relationship, any beneficiaries, and a good contact number.\" Good practice even where not legally required." } },
        { t: "Bank details submitted for payouts", gate: true, d: "Personal bank account for salary disbursement. Format varies by country (IBAN for EU, account + routing for US, BSB for AU, and so on)." },
        { t: "Tax information submitted", d: "Country-specific tax info (SSN for US, NI number for UK, TFN for AU, PAN for IN, and so on)." }
      ]}
    ],
    icp: [
      { stage: 2, items: [
        { t: "ICP assigned to entity", gate: true, d: "In-country payroll partner confirmed and linked to this entity in admin. Blocks payroll setup." },
        { t: "ICP onboarding agreement signed", d: "Formal engagement agreement between Niural and the ICP for this entity and country." },
        { t: "Employer registered with ICP", gate: true, d: "Entity legally registered in the ICP's payroll system — required before employees can be registered." }
      ]},
      { stage: 3, items: [
        { t: "All employees registered with ICP", gate: true, d: "Each employee enrolled in the ICP's system with their local payroll ID — required for G2N file accuracy." }
      ]},
      { stage: 4, items: [
        { t: "Outbound file format agreed", gate: true, d: "File structure, column headers, encoding, and delivery method (email) confirmed with the ICP." },
        { t: "G2N return template received", gate: true, d: "Gross-to-net return format documented and loaded into the G2N Preprocessor. Confirm whether the ICP includes worker IDs in the standard format — if yes, the manual ID-mapping step is eliminated.", rv: { tag: "inferred", type: "infer", note: "From Liz: \"Every time we get G2Ns we have to reconfig and add worker IDs.\" Asking ICPs to include them from July. Risk: Germany/Sweden software limits." } },
        { t: "ICP statutory deadlines confirmed", d: "All filing deadlines, tax payment dates, and country-specific statutory dates documented." },
        { t: "ICP contact and escalation path documented", d: "Primary contact, backup, SLA, and escalation path for payroll issues documented." },
        { t: "Test payroll cycle completed (if required)", d: "Dry-run payroll validated end-to-end with the ICP before the first live cycle." }
      ]},
      { stage: 5, recurring: true, items: [
        { t: "Outbound file received and acknowledged", recurring: true, d: "ICP confirms receipt of Niural's payroll input file, sent over email each cycle." },
        { t: "G2N return file sent to Niural", gate: true, recurring: true, d: "ICP sends the processed gross-to-net file back within the agreed turnaround." }
      ]}
    ],
    navro: [
      { stage: 2, items: [
        { t: "Bank verification reviewed by Navro", gate: true, d: "Navro validates the employer's bank account details — required for funding capability." },
        { t: "Identity checks cleared", gate: true, d: "Beneficial owners and signatories verified against Navro's AML/KYC requirements." },
        { t: "KYB fully approved by Navro", gate: true, d: "Full KYB package reviewed and approved — triggers bank payment capability for the entity." }
      ]},
      { stage: 2, sub: "Payment configuration", items: [
        { t: "Organisation created in Navro portal", gate: true, d: "Entity registered as an organisation in Navro." },
        { t: "Beneficiaries created per payout destination", gate: true, d: "Each destination: organisation, destination country, beneficiary type (company / individual), payout currency, and payment method (INSTANT / SEPA / WIRE)." },
        { t: "Payment method confirmed per corridor", gate: true, d: "INSTANT, SEPA, or WIRE selected and validated per currency/country corridor." },
        { t: "FX corridor enabled (if applicable)", d: "FX conversion pathway activated when the employer funds in a different currency than the payout currency." },
        { t: "Funding source configured", gate: true, d: "Employer's funding bank account linked and validated in Navro." },
        { t: "Bank payment capability enabled", gate: true, d: "Post-KYB: live bank payment capability switched on for this entity's corridors." },
        { t: "Payout readiness confirmed", gate: true, d: "Test payment or written confirmation that all corridors are live and ready for disbursement." }
      ]},
      { stage: 6, recurring: true, items: [
        { t: "Funding received from employer", gate: true, recurring: true, d: "Funds received into Navro per the funding instruction sent by Niural ops." },
        { t: "FX conversion executed", recurring: true, d: "Currency converted at the agreed/market rate, if applicable, before disbursement." },
        { t: "Employee payouts disbursed", recurring: true, d: "Individual salary payments sent to each beneficiary via the configured payment method." },
        { t: "Payment confirmations available", recurring: true, d: "Payout receipts and status available for reconciliation." }
      ]}
    ],
    internal: [
      { stage: 1, items: [
        { t: "Country config created", gate: true, d: "Country, ICP, payroll schedule, pay day, payroll start day, bonus month, and payment gateway defaults set in admin." },
        { t: "Operational deadlines configured", gate: true, d: "Salary update deadline, payroll calculation deadline, approval deadline, and funding deadline." },
        { t: "Statutory calendar built", d: "Tax authority, filing requirements, and days-after-pay-day rules per country (e.g. IRS → Federal Tax Deposit → 3 days after pay day)." }
      ]},
      { stage: 2, items: [
        { t: "Entity overrides configured", d: "ICP, payroll schedule, pay day, funding timeline, bonus month, statutory deadlines, approval deadlines, payment gateway, billing setup type, and deduction setup — all set at entity level." },
        { t: "KYB reviewed and global payroll enabled for entity", gate: true, d: "Three-party gate: client submits → Navro validates → Internal switches the entity to verified in-platform and enables global payroll. Manual for complex ownership (hedge funds, layered ownership). UBO attestation may be needed.", rv: { tag: "inferred", type: "infer", note: "From Liz: \"Once verified, we switch it to verified in-platform.\" Broadpeak example: go-live pushed for UBO attestation." } },
        { t: "Billing setup type confirmed", d: "Billing model configured for this entity (invoice frequency, billing contact, and so on)." },
        { t: "Deduction setup confirmed", d: "Employer-specific deductions (benefits, garnishments, and so on) configured." }
      ]},
      { stage: 4, items: [
        { t: "Payroll schedule and all cutoff dates finalized", gate: true, d: "Input cutoff, salary update cutoff, calculation date, approval date, and funding date — all locked for the entity." },
        { t: "ICP confirmed and assigned in admin", gate: true, d: "ICP linked in admin, contact info documented, escalation path confirmed." },
        { t: "ICP employer registration verified", gate: true, d: "Confirmed with the ICP that the employer entity is registered in their payroll system." },
        { t: "Approval chain configured", d: "Internal payroll approval chain set — who reviews and who signs off each cycle." }
      ]},
      { stage: 5, recurring: true, items: [
        { t: "Outbound file prepared", gate: true, recurring: true, d: "Liz manually reviews and edits: catch-ups, allowance breakdowns, leave data, and one-offs added to the outbound payroll file." },
        { t: "Outbound file emailed to ICP", gate: true, recurring: true, d: "File sent to the ICP contact over email — no portal; the ICP operates over email only." },
        { t: "G2N return received from ICP", gate: true, recurring: true, d: "Gross-to-net file received back from the ICP within the agreed turnaround." },
        { t: "G2N preprocessed", gate: true, recurring: true, d: "G2N Preprocessor: employee numbers added, headers flattened, name matching validated. If ICPs include worker IDs in the standard format (July test), the manual worker-ID step may be eliminated.", rv: { tag: "may simplify", type: "infer", note: "From Liz: manual worker-ID entry is \"a major bottleneck.\" If ICPs comply, this simplifies significantly. Germany / Sweden / France at highest risk of refusal." } },
        { t: "Processed file uploaded to admin panel", gate: true, recurring: true, d: "G2N output uploaded into the Niural admin panel for client review." },
        { t: "Client payroll approval received", gate: true, recurring: true, d: "Client has reviewed and approved the run in the platform." },
        { t: "Niural ops approval given", gate: true, recurring: true, d: "Internal sign-off on the run before the funding instruction is sent." },
        { t: "Funding instruction sent to Navro", gate: true, recurring: true, d: "Funding instruction with amounts and beneficiaries sent to Navro to start the payment batch." }
      ]},
      { stage: 6, items: [
        { t: "Direct deposit CSV sent to Treasury (Susho)", d: "DD CSV prepared and sent to Susho for bank reconciliation." },
        { t: "Bank reconciliation completed", d: "Payments reconciled against the run — discrepancies flagged and resolved." }
      ]}
    ]
  };

  // Seed items with verification status
  const itemsToInsert: any[] = [];
  let orderIndex = 0;
  Object.entries(DATA).forEach(([stakeholder, groups]) => {
    groups.forEach((group: any) => {
      group.items?.forEach((item: any, idx: number) => {
        if (item.t) {
          const itemId = `${stakeholder}-${group.stage}-${idx}`;
          const isVerified = !!item.rv; // Item is verified if it has review metadata
          const isRemoved = item.rv?.type === 'removed'; // Soft-delete for removed items

          itemsToInsert.push({
            id: itemId,
            stage_num: group.stage,
            stakeholder_id: stakeholder,
            title: item.t,
            description: item.d,
            is_gate: item.gate || false,
            is_recurring: item.recurring || false,
            is_removed: isRemoved,
            is_verified: isVerified,
            last_edited_by: isVerified ? 'Liz (validation session)' : null,
            last_edited_at: isVerified ? new Date().toISOString() : null,
            order_index: orderIndex++
          });
        }
      });
    });
  });

  if (itemsToInsert.length > 0) {
    await supabase.from('onboarding_items').insert(itemsToInsert);

    // Create empty states for all items
    const statesToInsert = itemsToInsert.map(item => ({
      id: `state-${item.id}`,
      item_id: item.id,
      status: 'pending'
    }));

    await supabase.from('item_states').insert(statesToInsert);
  }
}

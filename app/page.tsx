'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Dashboard from '@/components/Dashboard';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading onboarding dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return <Dashboard />;
}

async function seedDatabase(supabase: any) {
  const DATA = {
    client: [
      { stage: 2, items: [
        { t: "Account activation completed", d: "Client activates the global payroll product for their account." },
        { sub: "Verification (KYC / AML)" },
        { t: "Entity details submitted", d: "Legal entity name, DBA, country of incorporation, entity type, date of incorporation, local registration number, company website, phone, employee count, nature of business, registered address, mailing address." },
        { t: "Business formation documents uploaded", d: "Formation documents (not only incorporation). Includes Ultimate Beneficial Owner (UBO) details." },
        { t: "Tax IDs provided", d: "All applicable tax identification numbers for the entity (EIN, VAT, local tax ID per country)." },
        { t: "Bank details submitted", gate: true, d: "Entity bank account details — capture bank country and funding currency (USD vs local)." },
        { t: "Billing info configured", d: "Billing setup type and payment method for Niural platform fees." },
        { t: "KYB verified", gate: true, d: "Three-party gate: client provides ownership docs, address proof, identity and bank verification → validated → Internal approves global payroll." }
      ]},
      { stage: 3, items: [
        { t: "Employee details entered", d: "Per employee: personal details, employment details, compensation type and amount, and org position." },
        { t: "Employee agreements and documents submitted", d: "Client provides pre-signed employment agreements and related documents." }
      ]},
      { stage: 5, recurring: true, items: [
        { t: "Payroll files reviewed and approved each cycle", gate: true, recurring: true, d: "Payroll files submitted for client review." }
      ]}
    ],
    employee: [
      { stage: 3, items: [
        { t: "Invite received and accepted", d: "Employee receives the Niural invite and creates their account." },
        { t: "Personal info validated", d: "Full legal name, residential address, employment start date, personal email, reliable contact number." },
        { t: "Bank details submitted for payouts", gate: true, d: "Personal bank account for salary disbursement." },
        { t: "Tax information submitted", d: "Country-specific tax info (SSN for US, NI number for UK, etc)." }
      ]}
    ],
    icp: [
      { stage: 2, items: [
        { t: "ICP assigned to entity", gate: true, d: "In-country payroll partner confirmed and linked to this entity." },
        { t: "ICP onboarding agreement signed", d: "Formal engagement agreement between Niural and the ICP." },
        { t: "Employer registered with ICP", gate: true, d: "Entity legally registered in the ICP's payroll system." }
      ]},
      { stage: 3, items: [
        { t: "All employees registered with ICP", gate: true, d: "Each employee enrolled in the ICP's system with their local payroll ID." }
      ]},
      { stage: 4, items: [
        { t: "Outbound file format agreed", gate: true, d: "File structure, column headers, encoding, and delivery method confirmed." },
        { t: "G2N return template received", gate: true, d: "Gross-to-net return format documented and loaded into the G2N Preprocessor." },
        { t: "ICP statutory deadlines confirmed", d: "All filing deadlines, tax payment dates documented." },
        { t: "ICP contact and escalation path documented", d: "Primary contact, backup, SLA, and escalation path for payroll issues." },
        { t: "Test payroll cycle completed (if required)", d: "Dry-run payroll validated end-to-end with the ICP." }
      ]},
      { stage: 5, recurring: true, items: [
        { t: "Outbound file received and acknowledged", recurring: true, d: "ICP confirms receipt of Niural's payroll input file." },
        { t: "G2N return file sent to Niural", gate: true, recurring: true, d: "ICP sends the processed gross-to-net file back." }
      ]}
    ],
    navro: [
      { stage: 2, items: [
        { t: "Bank verification reviewed by Navro", gate: true, d: "Navro validates the employer's bank account details." },
        { t: "Identity checks cleared", gate: true, d: "Beneficial owners verified against Navro's AML/KYC requirements." },
        { t: "KYB fully approved by Navro", gate: true, d: "Full KYB package reviewed and approved." },
        { t: "Organisation created in Navro portal", gate: true, d: "Entity registered as an organisation in Navro." },
        { t: "Beneficiaries created per payout destination", gate: true, d: "Each destination configured with payout currency and payment method." },
        { t: "Payment method confirmed per corridor", gate: true, d: "INSTANT, SEPA, or WIRE selected and validated per currency/country corridor." },
        { t: "Funding source configured", gate: true, d: "Employer's funding bank account linked and validated in Navro." },
        { t: "Bank payment capability enabled", gate: true, d: "Live bank payment capability switched on for this entity's corridors." },
        { t: "Payout readiness confirmed", gate: true, d: "Test payment or written confirmation that all corridors are live." }
      ]},
      { stage: 6, recurring: true, items: [
        { t: "Funding received from employer", gate: true, recurring: true, d: "Funds received into Navro per the funding instruction." },
        { t: "FX conversion executed", recurring: true, d: "Currency converted if applicable, before disbursement." },
        { t: "Employee payouts disbursed", recurring: true, d: "Individual salary payments sent to each beneficiary." },
        { t: "Payment confirmations available", recurring: true, d: "Payout receipts and status available for reconciliation." }
      ]}
    ],
    internal: [
      { stage: 1, items: [
        { t: "Country config created", gate: true, d: "Country, ICP, payroll schedule configured in admin." },
        { t: "Operational deadlines configured", gate: true, d: "Salary update deadline, payroll calculation deadline configured." },
        { t: "Statutory calendar built", d: "Tax authority, filing requirements, and statutory dates per country." }
      ]},
      { stage: 2, items: [
        { t: "Entity overrides configured", d: "ICP, payroll schedule, pay day, funding timeline configured." },
        { t: "KYB reviewed and global payroll enabled for entity", gate: true, d: "Three-party gate: client submits → Navro validates → Internal switches the entity." },
        { t: "Billing setup type confirmed", d: "Billing model configured for this entity." },
        { t: "Deduction setup confirmed", d: "Employer-specific deductions configured." }
      ]},
      { stage: 4, items: [
        { t: "Payroll schedule and all cutoff dates finalized", gate: true, d: "All dates locked for the entity." },
        { t: "ICP confirmed and assigned in admin", gate: true, d: "ICP linked in admin, contact info documented." },
        { t: "ICP employer registration verified", gate: true, d: "Confirmed that the employer entity is registered in their payroll system." },
        { t: "Approval chain configured", d: "Internal payroll approval chain set." }
      ]},
      { stage: 5, recurring: true, items: [
        { t: "Outbound file prepared", gate: true, recurring: true, d: "Liz manually reviews and edits the outbound payroll file." },
        { t: "Outbound file emailed to ICP", gate: true, recurring: true, d: "File sent to the ICP contact over email." },
        { t: "G2N return received from ICP", gate: true, recurring: true, d: "Gross-to-net file received back from the ICP." },
        { t: "G2N preprocessed", gate: true, recurring: true, d: "G2N Preprocessor: employee numbers added, headers flattened." },
        { t: "Processed file uploaded to admin panel", gate: true, recurring: true, d: "G2N output uploaded into the Niural admin panel." },
        { t: "Client payroll approval received", gate: true, recurring: true, d: "Client has reviewed and approved the run." },
        { t: "Niural ops approval given", gate: true, recurring: true, d: "Internal sign-off on the run before funding instruction." },
        { t: "Funding instruction sent to Navro", gate: true, recurring: true, d: "Funding instruction with amounts and beneficiaries sent to Navro." }
      ]},
      { stage: 6, items: [
        { t: "Direct deposit CSV sent to Treasury (Susho)", d: "DD CSV prepared and sent to Susho for bank reconciliation." },
        { t: "Bank reconciliation completed", d: "Payments reconciled against the run." }
      ]}
    ]
  };

  // Seed items
  const itemsToInsert: any[] = [];
  Object.entries(DATA).forEach(([stakeholder, groups]) => {
    groups.forEach((group: any) => {
      group.items?.forEach((item: any, idx: number) => {
        if (item.t) {
          const itemId = `${stakeholder}-${group.stage}-${idx}`;
          itemsToInsert.push({
            id: itemId,
            stage_num: group.stage,
            stakeholder_id: stakeholder,
            title: item.t,
            description: item.d,
            is_gate: item.gate || false,
            is_recurring: item.recurring || false,
            is_removed: false
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

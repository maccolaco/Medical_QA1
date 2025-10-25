import { supabase } from '../lib/supabase'

interface DemoClaim {
  filename: string
  payer: string
  patient_name: string
  patient_id: string
  cpt_codes: string[]
  modifiers: string[]
  charges: number[]
  dates: string[]
  provider_name: string
  provider_npi: string
  diagnosis_codes: string[]
  raw_text: string
  queue: 'critical_errors' | 'warnings' | 'approved'
  errors: Array<{ severity: string; message: string; field: string }>
}

const demoClaims: DemoClaim[] = [
  {
    filename: "claim_001_critical.pdf",
    payer: "Medicare",
    patient_name: "John Smith",
    patient_id: "123456789",
    cpt_codes: ["99999", "99214"],
    modifiers: ["25"],
    charges: [150.00, 200.00],
    dates: ["2024-01-15"],
    provider_name: "Dr. Jane Doe",
    provider_npi: "1234567890",
    diagnosis_codes: [],
    raw_text: "Office visit for established patient with invalid CPT code...",
    queue: "critical_errors",
    errors: [
      { severity: "error", message: "Invalid CPT code: 99999", field: "cpt_codes" },
      { severity: "error", message: "Missing diagnosis codes required for claim", field: "diagnosis_codes" }
    ]
  },
  {
    filename: "claim_002_critical.pdf",
    payer: "Aetna",
    patient_name: "Mary Johnson",
    patient_id: "987654321",
    cpt_codes: ["99213", "99213"],
    modifiers: [],
    charges: [175.00, 175.00],
    dates: ["2024-01-16"],
    provider_name: "Dr. Robert Wilson",
    provider_npi: "0987654321",
    diagnosis_codes: ["E11.9"],
    raw_text: "Duplicate office visit codes on same claim...",
    queue: "critical_errors",
    errors: [
      { severity: "error", message: "Duplicate CPT code on same claim: 99213", field: "cpt_codes" },
      { severity: "warning", message: "Same service billed twice - verify this is intentional", field: "charges" }
    ]
  },
  {
    filename: "claim_003_warning.pdf",
    payer: "Blue Cross",
    patient_name: "David Brown",
    patient_id: "456789123",
    cpt_codes: ["99215"],
    modifiers: ["25"],
    charges: [850.00],
    dates: ["2024-01-17"],
    provider_name: "Dr. Sarah Lee",
    provider_npi: "1122334455",
    diagnosis_codes: ["M79.3", "R50.9"],
    raw_text: "Comprehensive office visit with unusually high charge...",
    queue: "warnings",
    errors: [
      { severity: "warning", message: "Charge amount $850.00 significantly higher than average $300-400 for CPT 99215", field: "charges" }
    ]
  },
  {
    filename: "claim_004_warning.pdf",
    payer: "Cigna",
    patient_name: "Lisa Davis",
    patient_id: "789123456",
    cpt_codes: ["99214", "93000"],
    modifiers: [],
    charges: [200.00, 75.00],
    dates: ["2024-01-18"],
    provider_name: "Dr. Michael Chen",
    provider_npi: "5566778899",
    diagnosis_codes: ["J06.9"],
    raw_text: "Office visit with EKG - modifier 25 may be needed...",
    queue: "warnings",
    errors: [
      { severity: "warning", message: "Multiple procedures on same day may require modifier 25 on E/M code", field: "modifiers" }
    ]
  },
  {
    filename: "claim_005_approved.pdf",
    payer: "Humana",
    patient_name: "Robert Taylor",
    patient_id: "321654987",
    cpt_codes: ["99213"],
    modifiers: [],
    charges: [150.00],
    dates: ["2024-01-19"],
    provider_name: "Dr. Jennifer Martinez",
    provider_npi: "9988776655",
    diagnosis_codes: ["I25.10", "E11.9"],
    raw_text: "Standard office visit for established patient - all validations passed...",
    queue: "approved",
    errors: []
  },
  {
    filename: "claim_006_approved.pdf",
    payer: "United Healthcare",
    patient_name: "Susan Williams",
    patient_id: "654321789",
    cpt_codes: ["99214"],
    modifiers: [],
    charges: [200.00],
    dates: ["2024-01-20"],
    provider_name: "Dr. James Anderson",
    provider_npi: "4455667788",
    diagnosis_codes: ["Z00.00"],
    raw_text: "Annual wellness visit - claim ready for submission...",
    queue: "approved",
    errors: []
  },
  {
    filename: "claim_007_critical.pdf",
    payer: "Medicare",
    patient_name: "George Miller",
    patient_id: "111222333",
    cpt_codes: ["99215"],
    modifiers: [],
    charges: [300.00],
    dates: ["2024-02-30"],
    provider_name: "Dr. Patricia Moore",
    provider_npi: "7788990011",
    diagnosis_codes: ["I10"],
    raw_text: "Comprehensive visit with invalid date...",
    queue: "critical_errors",
    errors: [
      { severity: "error", message: "Invalid service date: February 30 does not exist", field: "dates" }
    ]
  }
]

export async function loadDemoClaims(userId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('Loading demo claims data...')

    const claimsToInsert = demoClaims.map((claim, index) => ({
      user_id: userId,
      filename: claim.filename,
      status: 'processed',
      queue: claim.queue,
      payer: claim.payer,
      patient_name: claim.patient_name,
      patient_id: claim.patient_id,
      cpt_codes: claim.cpt_codes,
      modifiers: claim.modifiers,
      charges: claim.charges,
      service_dates: claim.dates,
      provider_name: claim.provider_name,
      provider_npi: claim.provider_npi,
      diagnosis_codes: claim.diagnosis_codes,
      raw_text: claim.raw_text,
      validation_errors: claim.errors,
      created_at: new Date(Date.now() - (7 - index) * 24 * 60 * 60 * 1000).toISOString()
    }))

    const { data, error } = await supabase
      .from('claims')
      .insert(claimsToInsert)
      .select()

    if (error) {
      console.error('Error loading demo claims:', error)
      return { success: false, count: 0, error: error.message }
    }

    console.log(`Successfully loaded ${data?.length || 0} demo claims`)
    return { success: true, count: data?.length || 0 }
  } catch (error) {
    console.error('Error loading demo data:', error)
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function clearDemoClaims(userId: string): Promise<void> {
  const demoFilenames = demoClaims.map(c => c.filename)

  await supabase
    .from('claims')
    .delete()
    .eq('user_id', userId)
    .in('filename', demoFilenames)
}

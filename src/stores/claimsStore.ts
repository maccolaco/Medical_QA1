import { create } from 'zustand'

export interface Claim {
  id: string
  filename: string
  file_path: string
  status: 'Uploaded' | 'Processing' | 'Processed' | 'UnderReview' | 'Approved' | 'Rejected' | 'Submitted' | 'Paid'
  extracted_data: ExtractedData
  validation_results: ValidationResult[]
  queue: 'CriticalErrors' | 'WarningsOnly' | 'ApprovedClaims'
  assigned_to?: string
  created_at: string
  updated_at: string
  comments: Comment[]
}

export interface ExtractedData {
  payer?: string
  patient_name?: string
  patient_id?: string
  cpt_codes: string[]
  modifiers: string[]
  charges: number[]
  dates: string[]
  provider_name?: string
  provider_npi?: string
  diagnosis_codes: string[]
  raw_text: string
}

export interface ValidationResult {
  id: string
  rule_id: string
  rule_name: string
  severity: 'Critical' | 'Warning' | 'Info'
  message: string
  field?: string
  suggested_fix?: string
  confidence: number
}

export interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
}

interface ClaimsState {
  claims: Claim[]
  currentClaim: Claim | null
  loading: boolean
  error: string | null
  setClaims: (claims: Claim[]) => void
  setCurrentClaim: (claim: Claim | null) => void
  updateClaim: (claim: Claim) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useClaimsStore = create<ClaimsState>((set, get) => ({
  claims: [],
  currentClaim: null,
  loading: false,
  error: null,
  setClaims: (claims) => set({ claims }),
  setCurrentClaim: (currentClaim) => set({ currentClaim }),
  updateClaim: (updatedClaim) => set((state) => ({
    claims: state.claims.map(claim => 
      claim.id === updatedClaim.id ? updatedClaim : claim
    ),
    currentClaim: state.currentClaim?.id === updatedClaim.id ? updatedClaim : state.currentClaim
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))


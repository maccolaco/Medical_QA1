import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DemoStep {
  id: string
  title: string
  description: string
  page: string
  action?: string
  highlight?: string
}

interface DemoState {
  isDemoMode: boolean
  currentStep: number
  isPlaying: boolean
  completedSteps: string[]
  demoSteps: DemoStep[]

  setDemoMode: (enabled: boolean) => void
  startDemo: () => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (stepIndex: number) => void
  completeStep: (stepId: string) => void
  resetDemo: () => void
}

const demoSteps: DemoStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ClaimsSense',
    description: 'This demo will walk you through the complete medical claims QA workflow. ClaimsSense helps healthcare billing departments catch errors before submitting claims to insurance payers.',
    page: '/',
    action: 'Click Next to begin the tour'
  },
  {
    id: 'upload-intro',
    title: 'Step 1: Upload Claims',
    description: 'The workflow starts by uploading claim documents. You can upload PDFs or images of medical claims.',
    page: '/upload',
    action: 'Navigate to the Upload page'
  },
  {
    id: 'upload-demo',
    title: 'Upload Demo Claims',
    description: 'Click the "Load Demo Claims" button to populate the system with sample claims. This will create 5 different claims with various types of issues.',
    page: '/upload',
    action: 'Click "Load Demo Claims"',
    highlight: 'demo-button'
  },
  {
    id: 'ocr-process',
    title: 'Step 2: OCR Processing',
    description: 'After upload, the system uses OCR (Optical Character Recognition) to extract text from the documents and parse key information like CPT codes, diagnosis codes, patient details, and charges.',
    page: '/upload',
    action: 'Claims are being processed automatically'
  },
  {
    id: 'validation',
    title: 'Step 3: Rules Validation',
    description: 'The system applies validation rules to check for common errors: invalid codes, missing modifiers, duplicate charges, date mismatches, and authorization issues.',
    page: '/upload',
    action: 'Validation rules are running'
  },
  {
    id: 'queues-intro',
    title: 'Step 4: Queue Management',
    description: 'Claims are automatically sorted into queues based on severity: Critical Errors (must fix), Warnings (review), and Approved (ready to submit).',
    page: '/queues',
    action: 'Navigate to the Queues page'
  },
  {
    id: 'critical-queue',
    title: 'Critical Errors Queue',
    description: 'This queue contains claims with serious issues that will result in denials if submitted. Examples: invalid CPT codes, missing diagnosis codes, or authorization failures.',
    page: '/queues',
    action: 'Review claims in Critical Errors queue',
    highlight: 'critical-queue'
  },
  {
    id: 'warnings-queue',
    title: 'Warnings Queue',
    description: 'This queue has claims with potential issues that should be reviewed but might not cause denials. Examples: unusual charge amounts or questionable modifier usage.',
    page: '/queues',
    action: 'Check the Warnings queue',
    highlight: 'warnings-queue'
  },
  {
    id: 'approved-queue',
    title: 'Approved Queue',
    description: 'Claims that passed all validation rules are ready for submission to insurance payers. These claims have the highest likelihood of clean payment.',
    page: '/queues',
    action: 'View approved claims',
    highlight: 'approved-queue'
  },
  {
    id: 'claim-review',
    title: 'Step 5: Claim Review',
    description: 'Click on any claim to see detailed information: extracted data, validation errors, original document preview, and audit history.',
    page: '/claim/:id',
    action: 'Select a claim from any queue'
  },
  {
    id: 'fix-errors',
    title: 'Fixing Errors',
    description: 'Billing coders can correct errors directly in the claim detail view. Changes are tracked for compliance and can be reviewed by auditors.',
    page: '/claim/:id',
    action: 'Edit claim fields to fix issues'
  },
  {
    id: 'analytics-intro',
    title: 'Step 6: Analytics Dashboard',
    description: 'Track your team\'s performance with real-time analytics: total claims processed, error rates, denial rates, and revenue protected.',
    page: '/analytics',
    action: 'Navigate to Analytics page'
  },
  {
    id: 'analytics-metrics',
    title: 'Key Performance Metrics',
    description: 'Monitor trends over time: claims volume, error patterns, top error types, and processing efficiency. Use this data to improve your billing operations.',
    page: '/analytics',
    action: 'Review the metrics and charts',
    highlight: 'metrics-section'
  },
  {
    id: 'users-intro',
    title: 'Step 7: User Management',
    description: 'Manage your team with role-based access: Billing Coders (process claims), Auditors (QA review), Billing Managers (oversight), and Local Admins (system management).',
    page: '/users',
    action: 'Navigate to Users page'
  },
  {
    id: 'settings-intro',
    title: 'Step 8: System Settings',
    description: 'Configure validation rules, OCR settings, and HIPAA compliance features. Enable HIPAA mode for local-only processing without cloud services.',
    page: '/settings',
    action: 'Navigate to Settings page'
  },
  {
    id: 'hipaa-mode',
    title: 'HIPAA Compliance',
    description: 'Toggle HIPAA mode to ensure all data processing happens locally. This disables cloud OCR/AI services and encrypts all stored data.',
    page: '/settings',
    action: 'Review HIPAA settings',
    highlight: 'hipaa-toggle'
  },
  {
    id: 'complete',
    title: 'Demo Complete!',
    description: 'You\'ve completed the tour of ClaimsSense. The system helps reduce claim denials, speed up billing, and protect revenue by catching errors early in the process.',
    page: '/',
    action: 'You can now explore on your own or restart the demo'
  }
]

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      isDemoMode: false,
      currentStep: 0,
      isPlaying: false,
      completedSteps: [],
      demoSteps,

      setDemoMode: (enabled) => set({ isDemoMode: enabled }),

      startDemo: () => set({
        isDemoMode: true,
        isPlaying: true,
        currentStep: 0,
        completedSteps: []
      }),

      nextStep: () => {
        const { currentStep, demoSteps, completedSteps } = get()
        const newStep = Math.min(currentStep + 1, demoSteps.length - 1)
        const currentStepId = demoSteps[currentStep].id

        set({
          currentStep: newStep,
          completedSteps: completedSteps.includes(currentStepId)
            ? completedSteps
            : [...completedSteps, currentStepId]
        })
      },

      previousStep: () => {
        const { currentStep } = get()
        set({ currentStep: Math.max(currentStep - 1, 0) })
      },

      goToStep: (stepIndex) => {
        const { demoSteps } = get()
        if (stepIndex >= 0 && stepIndex < demoSteps.length) {
          set({ currentStep: stepIndex })
        }
      },

      completeStep: (stepId) => {
        const { completedSteps } = get()
        if (!completedSteps.includes(stepId)) {
          set({ completedSteps: [...completedSteps, stepId] })
        }
      },

      resetDemo: () => set({
        currentStep: 0,
        isPlaying: false,
        completedSteps: []
      })
    }),
    {
      name: 'demo-storage'
    }
  )
)

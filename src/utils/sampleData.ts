import { invoke } from '@tauri-apps/api/tauri'

interface SampleClaim {
  filename: string
  content: string
  extracted_data: {
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
  }
}

const sampleClaims: SampleClaim[] = [
  {
    filename: "claim_001.pdf",
    content: "Sample PDF content for claim 001",
    extracted_data: {
      payer: "Medicare",
      patient_name: "John Smith",
      patient_id: "123456789",
      cpt_codes: ["99213", "99214"],
      modifiers: ["25"],
      charges: [150.00, 200.00],
      dates: ["2024-01-15T00:00:00Z"],
      provider_name: "Dr. Jane Doe",
      provider_npi: "1234567890",
      diagnosis_codes: ["Z00.00", "I10"],
      raw_text: "Office visit for established patient..."
    }
  },
  {
    filename: "claim_002.pdf",
    content: "Sample PDF content for claim 002",
    extracted_data: {
      payer: "Aetna",
      patient_name: "Mary Johnson",
      patient_id: "987654321",
      cpt_codes: ["99213"],
      modifiers: [],
      charges: [175.00],
      dates: ["2024-01-16T00:00:00Z"],
      provider_name: "Dr. Robert Wilson",
      provider_npi: "0987654321",
      diagnosis_codes: ["E11.9"],
      raw_text: "Office visit for diabetes management..."
    }
  },
  {
    filename: "claim_003.pdf",
    content: "Sample PDF content for claim 003",
    extracted_data: {
      payer: "Blue Cross",
      patient_name: "David Brown",
      patient_id: "456789123",
      cpt_codes: ["99215", "99281"],
      modifiers: ["25", "59"],
      charges: [300.00, 250.00],
      dates: ["2024-01-17T00:00:00Z"],
      provider_name: "Dr. Sarah Lee",
      provider_npi: "1122334455",
      diagnosis_codes: ["M79.3", "R50.9"],
      raw_text: "Comprehensive office visit with emergency consultation..."
    }
  },
  {
    filename: "claim_004.pdf",
    content: "Sample PDF content for claim 004",
    extracted_data: {
      payer: "Cigna",
      patient_name: "Lisa Davis",
      patient_id: "789123456",
      cpt_codes: ["99212"],
      modifiers: [],
      charges: [125.00],
      dates: ["2024-01-18T00:00:00Z"],
      provider_name: "Dr. Michael Chen",
      provider_npi: "5566778899",
      diagnosis_codes: ["J06.9"],
      raw_text: "Brief office visit for upper respiratory infection..."
    }
  },
  {
    filename: "claim_005.pdf",
    content: "Sample PDF content for claim 005",
    extracted_data: {
      payer: "Humana",
      patient_name: "Robert Taylor",
      patient_id: "321654987",
      cpt_codes: ["99213", "99214", "99215"],
      modifiers: ["25", "59"],
      charges: [150.00, 200.00, 300.00],
      dates: ["2024-01-19T00:00:00Z"],
      provider_name: "Dr. Jennifer Martinez",
      provider_npi: "9988776655",
      diagnosis_codes: ["I25.10", "E11.9", "M79.3"],
      raw_text: "Multiple office visits for complex medical conditions..."
    }
  }
]

export async function loadSampleData(): Promise<void> {
  try {
    console.log('Loading sample claims data...')
    
    for (const claim of sampleClaims) {
      // Create a mock claim object
      const mockClaim = {
        id: Math.random().toString(36).substr(2, 9),
        filename: claim.filename,
        file_path: `/sample/${claim.filename}`,
        status: 'Processed',
        extracted_data: claim.extracted_data,
        validation_results: [],
        queue: 'CriticalErrors',
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments: []
      }

      // Upload the claim
      await invoke('upload_files', { 
        filePaths: [mockClaim.file_path] 
      })

      // Run OCR processing
      await invoke('start_ocr', { 
        claimId: mockClaim.id 
      })

      // Run validation rules
      await invoke('run_rules', { 
        claimId: mockClaim.id 
      })

      console.log(`Loaded sample claim: ${claim.filename}`)
    }

    console.log('Sample data loaded successfully!')
  } catch (error) {
    console.error('Error loading sample data:', error)
    throw error
  }
}

export async function createSampleUsers(): Promise<void> {
  try {
    console.log('Creating sample users...')
    
    const sampleUsers = [
      {
        username: 'admin',
        email: 'admin@claimsense.com',
        password: 'admin123',
        role: 'LocalAdmin'
      },
      {
        username: 'coder1',
        email: 'coder1@claimsense.com',
        password: 'coder123',
        role: 'BillingCoder'
      },
      {
        username: 'auditor1',
        email: 'auditor1@claimsense.com',
        password: 'auditor123',
        role: 'Auditor'
      },
      {
        username: 'manager1',
        email: 'manager1@claimsense.com',
        password: 'manager123',
        role: 'BillingManager'
      }
    ]

    for (const user of sampleUsers) {
      try {
        await invoke('create_user', user)
        console.log(`Created user: ${user.username}`)
      } catch (error) {
        console.log(`User ${user.username} may already exist`)
      }
    }

    console.log('Sample users created successfully!')
  } catch (error) {
    console.error('Error creating sample users:', error)
    throw error
  }
}

// Function to be called from the UI
export async function initializeSampleData(): Promise<void> {
  try {
    await createSampleUsers()
    await loadSampleData()
    console.log('Sample data initialization completed!')
  } catch (error) {
    console.error('Failed to initialize sample data:', error)
    throw error
  }
}


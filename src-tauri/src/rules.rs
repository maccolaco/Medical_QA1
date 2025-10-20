use anyhow::Result;
use uuid::Uuid;
use crate::types::{Claim, ValidationResult, Severity};

pub struct RulesEngine;

impl RulesEngine {
    pub fn new() -> Self {
        Self
    }

    pub async fn validate_claim(&self, claim: &Claim) -> Result<Vec<ValidationResult>> {
        let mut results = Vec::new();

        // Rule 1: Check for missing CPT codes
        if claim.extracted_data.cpt_codes.is_empty() {
            results.push(ValidationResult {
                id: Uuid::new_v4(),
                rule_id: "missing_cpt_codes".to_string(),
                rule_name: "Missing CPT Codes".to_string(),
                severity: Severity::Critical,
                message: "No CPT codes found in the claim".to_string(),
                field: Some("cpt_codes".to_string()),
                suggested_fix: Some("Add appropriate CPT codes for the services provided".to_string()),
                confidence: 1.0,
            });
        }

        // Rule 2: Check for invalid CPT codes (basic validation)
        for cpt_code in &claim.extracted_data.cpt_codes {
            if cpt_code.len() != 5 || !cpt_code.chars().all(|c| c.is_ascii_digit()) {
                results.push(ValidationResult {
                    id: Uuid::new_v4(),
                    rule_id: "invalid_cpt_code".to_string(),
                    rule_name: "Invalid CPT Code Format".to_string(),
                    severity: Severity::Critical,
                    message: format!("Invalid CPT code format: {}", cpt_code),
                    field: Some("cpt_codes".to_string()),
                    suggested_fix: Some("Ensure CPT codes are 5-digit numbers".to_string()),
                    confidence: 1.0,
                });
            }
        }

        // Rule 3: Check for missing patient information
        if claim.extracted_data.patient_name.is_none() {
            results.push(ValidationResult {
                id: Uuid::new_v4(),
                rule_id: "missing_patient_name".to_string(),
                rule_name: "Missing Patient Name".to_string(),
                severity: Severity::Critical,
                message: "Patient name not found in the claim".to_string(),
                field: Some("patient_name".to_string()),
                suggested_fix: Some("Add patient name to the claim".to_string()),
                confidence: 0.9,
            });
        }

        // Rule 4: Check for missing provider information
        if claim.extracted_data.provider_name.is_none() {
            results.push(ValidationResult {
                id: Uuid::new_v4(),
                rule_id: "missing_provider_name".to_string(),
                rule_name: "Missing Provider Name".to_string(),
                severity: Severity::Warning,
                message: "Provider name not found in the claim".to_string(),
                field: Some("provider_name".to_string()),
                suggested_fix: Some("Add provider name to the claim".to_string()),
                confidence: 0.8,
            });
        }

        // Rule 5: Check for missing NPI
        if claim.extracted_data.provider_npi.is_none() {
            results.push(ValidationResult {
                id: Uuid::new_v4(),
                rule_id: "missing_npi".to_string(),
                rule_name: "Missing Provider NPI".to_string(),
                severity: Severity::Critical,
                message: "Provider NPI not found in the claim".to_string(),
                field: Some("provider_npi".to_string()),
                suggested_fix: Some("Add valid 10-digit NPI to the claim".to_string()),
                confidence: 0.9,
            });
        }

        // Rule 6: Check for missing charges
        if claim.extracted_data.charges.is_empty() {
            results.push(ValidationResult {
                id: Uuid::new_v4(),
                rule_id: "missing_charges".to_string(),
                rule_name: "Missing Charges".to_string(),
                severity: Severity::Critical,
                message: "No charges found in the claim".to_string(),
                field: Some("charges".to_string()),
                suggested_fix: Some("Add service charges to the claim".to_string()),
                confidence: 1.0,
            });
        }

        // Rule 7: Check for missing dates
        if claim.extracted_data.dates.is_empty() {
            results.push(ValidationResult {
                id: Uuid::new_v4(),
                rule_id: "missing_dates".to_string(),
                rule_name: "Missing Service Dates".to_string(),
                severity: Severity::Warning,
                message: "No service dates found in the claim".to_string(),
                field: Some("dates".to_string()),
                suggested_fix: Some("Add service dates to the claim".to_string()),
                confidence: 0.8,
            });
        }

        // Rule 8: Check for missing payer information
        if claim.extracted_data.payer.is_none() {
            results.push(ValidationResult {
                id: Uuid::new_v4(),
                rule_id: "missing_payer".to_string(),
                rule_name: "Missing Payer Information".to_string(),
                severity: Severity::Warning,
                message: "Payer information not found in the claim".to_string(),
                field: Some("payer".to_string()),
                suggested_fix: Some("Add payer information to the claim".to_string()),
                confidence: 0.7,
            });
        }

        // Rule 9: Check for missing diagnosis codes
        if claim.extracted_data.diagnosis_codes.is_empty() {
            results.push(ValidationResult {
                id: Uuid::new_v4(),
                rule_id: "missing_diagnosis_codes".to_string(),
                rule_name: "Missing Diagnosis Codes".to_string(),
                severity: Severity::Warning,
                message: "No diagnosis codes found in the claim".to_string(),
                field: Some("diagnosis_codes".to_string()),
                suggested_fix: Some("Add appropriate ICD-10 diagnosis codes".to_string()),
                confidence: 0.8,
            });
        }

        // Rule 10: Check for duplicate CPT codes
        let mut cpt_counts = std::collections::HashMap::new();
        for cpt_code in &claim.extracted_data.cpt_codes {
            *cpt_counts.entry(cpt_code).or_insert(0) += 1;
        }

        for (cpt_code, count) in cpt_counts {
            if count > 1 {
                results.push(ValidationResult {
                    id: Uuid::new_v4(),
                    rule_id: "duplicate_cpt_code".to_string(),
                    rule_name: "Duplicate CPT Code".to_string(),
                    severity: Severity::Warning,
                    message: format!("CPT code {} appears {} times", cpt_code, count),
                    field: Some("cpt_codes".to_string()),
                    suggested_fix: Some("Review if duplicate codes are intentional or remove duplicates".to_string()),
                    confidence: 1.0,
                });
            }
        }

        Ok(results)
    }
}


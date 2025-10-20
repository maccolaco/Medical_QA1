use anyhow::Result;
use regex::Regex;
use crate::types::ExtractedData;
use chrono::{DateTime, Utc};

pub struct ClaimParser;

impl ClaimParser {
    pub fn new() -> Self {
        Self
    }

    pub async fn parse_text(&self, text: &str) -> Result<ExtractedData> {
        let mut extracted = ExtractedData {
            payer: None,
            patient_name: None,
            patient_id: None,
            cpt_codes: vec![],
            modifiers: vec![],
            charges: vec![],
            dates: vec![],
            provider_name: None,
            provider_npi: None,
            diagnosis_codes: vec![],
            raw_text: text.to_string(),
        };

        // Extract CPT codes (5-digit codes)
        let cpt_regex = Regex::new(r"\b\d{5}\b")?;
        for mat in cpt_regex.find_iter(text) {
            extracted.cpt_codes.push(mat.as_str().to_string());
        }

        // Extract modifiers (2-character codes)
        let modifier_regex = Regex::new(r"\b[A-Z]{2}\b")?;
        for mat in modifier_regex.find_iter(text) {
            extracted.modifiers.push(mat.as_str().to_string());
        }

        // Extract charges (dollar amounts)
        let charge_regex = Regex::new(r"\$[\d,]+\.?\d*")?;
        for mat in charge_regex.find_iter(text) {
            let charge_str = mat.as_str().replace("$", "").replace(",", "");
            if let Ok(charge) = charge_str.parse::<f64>() {
                extracted.charges.push(charge);
            }
        }

        // Extract dates (various formats)
        let date_patterns = vec![
            r"\b\d{1,2}/\d{1,2}/\d{4}\b",  // MM/DD/YYYY
            r"\b\d{4}-\d{2}-\d{2}\b",      // YYYY-MM-DD
            r"\b\d{1,2}-\d{1,2}-\d{4}\b",  // MM-DD-YYYY
        ];

        for pattern in date_patterns {
            let date_regex = Regex::new(pattern)?;
            for mat in date_regex.find_iter(text) {
                if let Ok(date) = DateTime::parse_from_rfc3339(&format!("{}T00:00:00Z", mat.as_str())) {
                    extracted.dates.push(date.with_timezone(&Utc));
                }
            }
        }

        // Extract diagnosis codes (ICD-10 format)
        let icd_regex = Regex::new(r"\b[A-Z]\d{2,3}(?:\.\d+)?\b")?;
        for mat in icd_regex.find_iter(text) {
            extracted.diagnosis_codes.push(mat.as_str().to_string());
        }

        // Extract NPI (10-digit number)
        let npi_regex = Regex::new(r"\b\d{10}\b")?;
        for mat in npi_regex.find_iter(text) {
            extracted.provider_npi = Some(mat.as_str().to_string());
            break; // Take the first NPI found
        }

        // Simple payer detection based on common keywords
        let payer_keywords = vec![
            "medicare", "medicaid", "aetna", "blue cross", "cigna", "humana", "unitedhealth"
        ];
        
        let text_lower = text.to_lowercase();
        for keyword in payer_keywords {
            if text_lower.contains(keyword) {
                extracted.payer = Some(keyword.to_string());
                break;
            }
        }

        // Extract patient name (simple pattern - first name, last name)
        let name_regex = Regex::new(r"(?i)patient[:\s]+([A-Z][a-z]+)\s+([A-Z][a-z]+)")?;
        if let Some(mat) = name_regex.find(text) {
            let name_match = mat.as_str();
            if let Some(captures) = name_regex.captures(name_match) {
                if let (Some(first), Some(last)) = (captures.get(1), captures.get(2)) {
                    extracted.patient_name = Some(format!("{} {}", first.as_str(), last.as_str()));
                }
            }
        }

        // Extract provider name (simple pattern)
        let provider_regex = Regex::new(r"(?i)provider[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)")?;
        if let Some(mat) = provider_regex.find(text) {
            let provider_match = mat.as_str();
            if let Some(captures) = provider_regex.captures(provider_match) {
                if let Some(provider) = captures.get(1) {
                    extracted.provider_name = Some(provider.as_str().to_string());
                }
            }
        }

        Ok(extracted)
    }
}


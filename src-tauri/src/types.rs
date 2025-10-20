use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claim {
    pub id: Uuid,
    pub filename: String,
    pub file_path: String,
    pub status: ClaimStatus,
    pub extracted_data: ExtractedData,
    pub validation_results: Vec<ValidationResult>,
    pub queue: QueueType,
    pub assigned_to: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub comments: Vec<Comment>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClaimStatus {
    Uploaded,
    Processing,
    Processed,
    UnderReview,
    Approved,
    Rejected,
    Submitted,
    Paid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractedData {
    pub payer: Option<String>,
    pub patient_name: Option<String>,
    pub patient_id: Option<String>,
    pub cpt_codes: Vec<String>,
    pub modifiers: Vec<String>,
    pub charges: Vec<f64>,
    pub dates: Vec<DateTime<Utc>>,
    pub provider_name: Option<String>,
    pub provider_npi: Option<String>,
    pub diagnosis_codes: Vec<String>,
    pub raw_text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub id: Uuid,
    pub rule_id: String,
    pub rule_name: String,
    pub severity: Severity,
    pub message: String,
    pub field: Option<String>,
    pub suggested_fix: Option<String>,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Severity {
    Critical,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QueueType {
    CriticalErrors,
    WarningsOnly,
    ApprovedClaims,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub role: UserRole,
    pub created_at: DateTime<Utc>,
    pub last_login: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UserRole {
    BillingCoder,
    Auditor,
    BillingManager,
    LocalAdmin,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLog {
    pub id: Uuid,
    pub user_id: Uuid,
    pub action: String,
    pub resource_type: String,
    pub resource_id: Option<Uuid>,
    pub details: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Analytics {
    pub total_claims: i64,
    pub critical_errors: i64,
    pub warnings: i64,
    pub approved_claims: i64,
    pub denial_rate: f64,
    pub revenue_protected: f64,
    pub claims_per_day: Vec<DailyStats>,
    pub error_patterns: Vec<ErrorPattern>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyStats {
    pub date: DateTime<Utc>,
    pub claims_processed: i64,
    pub errors_found: i64,
    pub revenue: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorPattern {
    pub rule_name: String,
    pub count: i64,
    pub severity: Severity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub hipaa_mode: bool,
    pub ocr_provider: String,
    pub cloud_ocr_enabled: bool,
    pub llm_provider: Option<String>,
    pub encryption_key: Option<String>,
    pub rules_config: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadProgress {
    pub file_id: Uuid,
    pub filename: String,
    pub status: String,
    pub progress: f64,
    pub error: Option<String>,
}


use tauri::State;
use uuid::Uuid;
use chrono::Utc;
use std::collections::HashMap;
use crate::types::*;
use crate::database::Database;
use crate::ocr::OcrProcessor;
use crate::parser::ClaimParser;
use crate::rules::RulesEngine;
use crate::encryption::EncryptionService;

#[tauri::command]
pub async fn upload_files(
    file_paths: Vec<String>,
    state: State<'_, AppState>,
) -> Result<Vec<UploadProgress>, String> {
    let mut results = Vec::new();
    
    for file_path in file_paths {
        let file_id = Uuid::new_v4();
        let filename = std::path::Path::new(&file_path)
            .file_name()
            .unwrap()
            .to_string_lossy()
            .to_string();

        let claim = Claim {
            id: file_id,
            filename: filename.clone(),
            file_path: file_path.clone(),
            status: ClaimStatus::Uploaded,
            extracted_data: ExtractedData {
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
                raw_text: String::new(),
            },
            validation_results: vec![],
            queue: QueueType::CriticalErrors, // Default, will be updated after processing
            assigned_to: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            comments: vec![],
        };

        if let Err(e) = state.db.lock().unwrap().create_claim(&claim).await {
            results.push(UploadProgress {
                file_id,
                filename,
                status: "error".to_string(),
                progress: 0.0,
                error: Some(e.to_string()),
            });
        } else {
            results.push(UploadProgress {
                file_id,
                filename,
                status: "uploaded".to_string(),
                progress: 100.0,
                error: None,
            });
        }
    }

    Ok(results)
}

#[tauri::command]
pub async fn start_ocr(
    claim_id: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let claim_id = Uuid::parse_str(&claim_id)
        .map_err(|e| e.to_string())?;

    let mut db = state.db.lock().unwrap();
    let claim = db.get_claim(&claim_id).await
        .map_err(|e| e.to_string())?
        .ok_or("Claim not found")?;

    // Update status to processing
    let mut updated_claim = claim.clone();
    updated_claim.status = ClaimStatus::Processing;
    updated_claim.updated_at = Utc::now();
    
    db.update_claim(&updated_claim).await
        .map_err(|e| e.to_string())?;

    // Start OCR processing
    let ocr_processor = OcrProcessor::new();
    let extracted_text = ocr_processor.process_file(&claim.file_path)
        .await
        .map_err(|e| e.to_string())?;

    // Parse the extracted text
    let parser = ClaimParser::new();
    let extracted_data = parser.parse_text(&extracted_text)
        .await
        .map_err(|e| e.to_string())?;

    // Update claim with extracted data
    updated_claim.extracted_data = extracted_data;
    updated_claim.status = ClaimStatus::Processed;
    updated_claim.updated_at = Utc::now();

    db.update_claim(&updated_claim).await
        .map_err(|e| e.to_string())?;

    Ok("OCR completed successfully".to_string())
}

#[tauri::command]
pub async fn run_rules(
    claim_id: String,
    state: State<'_, AppState>,
) -> Result<Vec<ValidationResult>, String> {
    let claim_id = Uuid::parse_str(&claim_id)
        .map_err(|e| e.to_string())?;

    let mut db = state.db.lock().unwrap();
    let claim = db.get_claim(&claim_id).await
        .map_err(|e| e.to_string())?
        .ok_or("Claim not found")?;

    let rules_engine = RulesEngine::new();
    let validation_results = rules_engine.validate_claim(&claim)
        .await
        .map_err(|e| e.to_string())?;

    // Determine queue based on validation results
    let queue = if validation_results.iter().any(|r| matches!(r.severity, Severity::Critical)) {
        QueueType::CriticalErrors
    } else if validation_results.iter().any(|r| matches!(r.severity, Severity::Warning)) {
        QueueType::WarningsOnly
    } else {
        QueueType::ApprovedClaims
    };

    // Update claim with validation results
    let mut updated_claim = claim.clone();
    updated_claim.validation_results = validation_results.clone();
    updated_claim.queue = queue;
    updated_claim.updated_at = Utc::now();

    db.update_claim(&updated_claim).await
        .map_err(|e| e.to_string())?;

    Ok(validation_results)
}

#[tauri::command]
pub async fn get_claims(
    queue: Option<String>,
    state: State<'_, AppState>,
) -> Result<Vec<Claim>, String> {
    let db = state.db.lock().unwrap();
    let queue_type = if let Some(queue_str) = queue {
        serde_json::from_str(&queue_str).ok()
    } else {
        None
    };

    db.get_claims(queue_type).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_claim_by_id(
    claim_id: String,
    state: State<'_, AppState>,
) -> Result<Option<Claim>, String> {
    let claim_id = Uuid::parse_str(&claim_id)
        .map_err(|e| e.to_string())?;

    let db = state.db.lock().unwrap();
    db.get_claim(&claim_id).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_claim(
    claim: Claim,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut db = state.db.lock().unwrap();
    db.update_claim(&claim).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_queues(
    state: State<'_, AppState>,
) -> Result<HashMap<String, Vec<Claim>>, String> {
    let db = state.db.lock().unwrap();
    
    let mut queues = HashMap::new();
    
    let critical_errors = db.get_claims(Some(QueueType::CriticalErrors)).await
        .map_err(|e| e.to_string())?;
    queues.insert("critical_errors".to_string(), critical_errors);

    let warnings = db.get_claims(Some(QueueType::WarningsOnly)).await
        .map_err(|e| e.to_string())?;
    queues.insert("warnings".to_string(), warnings);

    let approved = db.get_claims(Some(QueueType::ApprovedClaims)).await
        .map_err(|e| e.to_string())?;
    queues.insert("approved".to_string(), approved);

    Ok(queues)
}

#[tauri::command]
pub async fn get_analytics(
    state: State<'_, AppState>,
) -> Result<Analytics, String> {
    let db = state.db.lock().unwrap();
    db.get_analytics().await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_user(
    username: String,
    email: String,
    password: String,
    role: String,
    state: State<'_, AppState>,
) -> Result<User, String> {
    let user_id = Uuid::new_v4();
    let role_enum: UserRole = serde_json::from_str(&format!("\"{}\"", role))
        .map_err(|e| e.to_string())?;

    let user = User {
        id: user_id,
        username: username.clone(),
        email: email.clone(),
        role: role_enum,
        created_at: Utc::now(),
        last_login: None,
    };

    // Hash password (in production, use proper password hashing)
    let password_hash = format!("hashed_{}", password);

    let db = state.db.lock().unwrap();
    db.create_user(&user, &password_hash).await
        .map_err(|e| e.to_string())?;

    Ok(user)
}

#[tauri::command]
pub async fn authenticate_user(
    username: String,
    password: String,
    state: State<'_, AppState>,
) -> Result<Option<User>, String> {
    let db = state.db.lock().unwrap();
    let result = db.get_user_by_username(&username).await
        .map_err(|e| e.to_string())?;

    if let Some((user, password_hash)) = result {
        // Simple password check (in production, use proper password verification)
        if password_hash == format!("hashed_{}", password) {
            Ok(Some(user))
        } else {
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn get_users(
    state: State<'_, AppState>,
) -> Result<Vec<User>, String> {
    let db = state.db.lock().unwrap();
    db.get_users().await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_user(
    user: User,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // TODO: Implement user update
    Ok(())
}

#[tauri::command]
pub async fn delete_user(
    user_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // TODO: Implement user deletion
    Ok(())
}

#[tauri::command]
pub async fn get_audit_logs(
    state: State<'_, AppState>,
) -> Result<Vec<AuditLog>, String> {
    // TODO: Implement audit log retrieval
    Ok(vec![])
}

#[tauri::command]
pub async fn export_claims(
    claim_ids: Vec<String>,
    format: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    // TODO: Implement claim export
    Ok("Export completed".to_string())
}

#[tauri::command]
pub async fn get_settings(
    state: State<'_, AppState>,
) -> Result<Settings, String> {
    Ok(Settings {
        hipaa_mode: true,
        ocr_provider: "tesseract".to_string(),
        cloud_ocr_enabled: false,
        llm_provider: None,
        encryption_key: None,
        rules_config: serde_json::json!({}),
    })
}

#[tauri::command]
pub async fn update_settings(
    settings: Settings,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // TODO: Implement settings update
    Ok(())
}


// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod encryption;
mod ocr;
mod parser;
mod rules;
mod types;

use commands::*;
use database::Database;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<Database>,
}

#[tokio::main]
async fn main() {
    let db = Database::new().await.expect("Failed to initialize database");
    let app_state = AppState {
        db: Mutex::new(db),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            upload_files,
            start_ocr,
            run_rules,
            get_claims,
            get_claim_by_id,
            update_claim,
            get_queues,
            get_analytics,
            create_user,
            authenticate_user,
            get_users,
            update_user,
            delete_user,
            get_audit_logs,
            export_claims,
            get_settings,
            update_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


mod credential_service;
mod project_service;

use credential_service::{clear_api_credential, credential_status, replace_api_credential, store_api_credential};
use project_service::{list_recent_projects, select_project_directory};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            select_project_directory,
            list_recent_projects,
            store_api_credential,
            credential_status,
            replace_api_credential,
            clear_api_credential,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}

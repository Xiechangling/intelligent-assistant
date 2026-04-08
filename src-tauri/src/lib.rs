mod assistant_service;
mod credential_service;
mod execution_service;
mod project_service;
mod session_service;

use assistant_service::{start_assistant_turn, start_assistant_turn_stream};
use credential_service::{
    clear_api_credential, clear_assistant_connection_settings, credential_status,
    get_assistant_connection_settings, replace_api_credential, save_assistant_connection_settings,
    store_api_credential,
};
use execution_service::execute_approved_command;
use project_service::{list_recent_projects, select_project_directory};
use session_service::{
    create_session, load_recovery_snapshot, load_session, list_sessions, save_recovery_snapshot,
    update_session_activity,
};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            start_assistant_turn,
            start_assistant_turn_stream,
            execute_approved_command,
            select_project_directory,
            list_recent_projects,
            store_api_credential,
            credential_status,
            replace_api_credential,
            clear_api_credential,
            get_assistant_connection_settings,
            save_assistant_connection_settings,
            clear_assistant_connection_settings,
            create_session,
            list_sessions,
            load_session,
            update_session_activity,
            save_recovery_snapshot,
            load_recovery_snapshot,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}

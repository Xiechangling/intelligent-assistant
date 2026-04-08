use dirs::data_local_dir;
use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::fs;

const APP_NAMESPACE: &str = "IntelligentAssistant";
const ACCOUNT_NAME: &str = "anthropic_api_key";
const SETTINGS_FILE: &str = "assistant-settings.json";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialStatusResponse {
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantConnectionSettings {
    pub api_base_url: Option<String>,
}

#[tauri::command]
pub fn store_api_credential(api_key: String) -> Result<CredentialStatusResponse, String> {
    write_secret(&api_key)?;
    Ok(CredentialStatusResponse {
        status: "configured".to_string(),
    })
}

#[tauri::command]
pub fn replace_api_credential(api_key: String) -> Result<CredentialStatusResponse, String> {
    write_secret(&api_key)?;
    Ok(CredentialStatusResponse {
        status: "configured".to_string(),
    })
}

#[tauri::command]
pub fn clear_api_credential() -> Result<CredentialStatusResponse, String> {
    let entry = credential_entry()?;
    match entry.delete_credential() {
        Ok(_) => Ok(CredentialStatusResponse {
            status: "missing".to_string(),
        }),
        Err(_) => Ok(CredentialStatusResponse {
            status: "missing".to_string(),
        }),
    }
}

#[tauri::command]
pub fn credential_status() -> Result<CredentialStatusResponse, String> {
    let entry = credential_entry()?;
    match entry.get_password() {
        Ok(secret) if !secret.is_empty() => Ok(CredentialStatusResponse {
            status: "configured".to_string(),
        }),
        Ok(_) => Ok(CredentialStatusResponse {
            status: "missing".to_string(),
        }),
        Err(_) => Ok(CredentialStatusResponse {
            status: "missing".to_string(),
        }),
    }
}

#[tauri::command]
pub fn get_assistant_connection_settings() -> Result<AssistantConnectionSettings, String> {
    read_assistant_connection_settings()
}

#[tauri::command]
pub fn save_assistant_connection_settings(api_base_url: String) -> Result<AssistantConnectionSettings, String> {
    let normalized = normalize_api_base_url(&api_base_url)?;
    let settings = AssistantConnectionSettings {
        api_base_url: normalized,
    };
    persist_assistant_connection_settings(&settings)?;
    Ok(settings)
}

#[tauri::command]
pub fn clear_assistant_connection_settings() -> Result<AssistantConnectionSettings, String> {
    let settings = AssistantConnectionSettings { api_base_url: None };
    persist_assistant_connection_settings(&settings)?;
    Ok(settings)
}

pub fn read_api_credential() -> Result<String, String> {
    let entry = credential_entry()?;
    let secret = entry.get_password().map_err(|err| err.to_string())?;
    if secret.trim().is_empty() {
        return Err("API key is not configured".to_string());
    }

    Ok(secret)
}

fn write_secret(api_key: &str) -> Result<(), String> {
    if api_key.trim().is_empty() {
        return Err("API key cannot be empty".to_string());
    }

    credential_entry()?
        .set_password(api_key)
        .map_err(|err| err.to_string())
}

fn credential_entry() -> Result<Entry, String> {
    Entry::new(APP_NAMESPACE, ACCOUNT_NAME).map_err(|err| err.to_string())
}

pub fn read_assistant_connection_settings() -> Result<AssistantConnectionSettings, String> {
    let file_path = assistant_settings_path();
    let Ok(contents) = fs::read_to_string(file_path) else {
        return Ok(AssistantConnectionSettings { api_base_url: None });
    };

    serde_json::from_str(&contents).map_err(|err| err.to_string())
}

fn persist_assistant_connection_settings(settings: &AssistantConnectionSettings) -> Result<(), String> {
    let file_path = assistant_settings_path();
    let parent = file_path.parent().ok_or("missing assistant settings directory")?;
    fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    let payload = serde_json::to_string_pretty(settings).map_err(|err| err.to_string())?;
    fs::write(file_path, payload).map_err(|err| err.to_string())
}

fn normalize_api_base_url(value: &str) -> Result<Option<String>, String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Ok(None);
    }

    let normalized = trimmed.trim_end_matches('/');
    if !(normalized.starts_with("http://") || normalized.starts_with("https://")) {
        return Err("API base URL must start with http:// or https://".to_string());
    }

    Ok(Some(normalized.to_string()))
}

fn assistant_settings_path() -> std::path::PathBuf {
    data_local_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join(APP_NAMESPACE)
        .join(SETTINGS_FILE)
}

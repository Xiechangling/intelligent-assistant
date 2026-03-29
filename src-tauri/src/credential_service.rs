use keyring::Entry;
use serde::Serialize;

const SERVICE_NAME: &str = "IntelligentAssistant";
const ACCOUNT_NAME: &str = "anthropic_api_key";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialStatusResponse {
    pub status: String,
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

fn write_secret(api_key: &str) -> Result<(), String> {
    if api_key.trim().is_empty() {
        return Err("API key cannot be empty".to_string());
    }

    credential_entry()?
        .set_password(api_key)
        .map_err(|err| err.to_string())
}

fn credential_entry() -> Result<Entry, String> {
    Entry::new(SERVICE_NAME, ACCOUNT_NAME).map_err(|err| err.to_string())
}

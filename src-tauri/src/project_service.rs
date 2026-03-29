use dirs::data_local_dir;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

const APP_NAMESPACE: &str = "IntelligentAssistant";
const RECENTS_FILE: &str = "recent-projects.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectRecord {
    pub name: String,
    pub path: Option<String>,
    pub warning: String,
}

#[tauri::command]
pub fn select_project_directory(selected_path: String) -> Result<ProjectRecord, String> {
    let normalized = normalize_path(&selected_path)?;
    let warning = if looks_like_standard_project(&normalized) {
        "none".to_string()
    } else {
        "non-standard".to_string()
    };

    let record = ProjectRecord {
        name: project_name(&normalized),
        path: Some(normalized.clone()),
        warning,
    };

    let mut recents = read_recent_projects();
    recents.retain(|entry| entry.path.as_deref() != Some(normalized.as_str()));
    recents.insert(0, record.clone());
    persist_recent_projects(&recents)?;

    Ok(record)
}

#[tauri::command]
pub fn list_recent_projects() -> Result<Vec<ProjectRecord>, String> {
    Ok(read_recent_projects())
}

fn normalize_path(input: &str) -> Result<String, String> {
    let path = Path::new(input);
    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()
            .map_err(|err| err.to_string())?
            .join(path)
    };

    Ok(absolute.to_string_lossy().replace('\\', "/"))
}

fn project_name(path: &str) -> String {
    Path::new(path)
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("Selected Project")
        .to_string()
}

fn looks_like_standard_project(path: &str) -> bool {
    let project_path = Path::new(path);
    let markers = [".git", "package.json", "pyproject.toml", "Cargo.toml", "requirements.txt"];

    markers.iter().any(|marker| project_path.join(marker).exists())
}

fn read_recent_projects() -> Vec<ProjectRecord> {
    let file_path = recent_projects_path();
    let Ok(contents) = fs::read_to_string(file_path) else {
        return Vec::new();
    };

    serde_json::from_str(&contents).unwrap_or_default()
}

fn persist_recent_projects(projects: &[ProjectRecord]) -> Result<(), String> {
    let file_path = recent_projects_path();
    let parent = file_path.parent().ok_or("missing parent directory")?;
    fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    let payload = serde_json::to_string_pretty(projects).map_err(|err| err.to_string())?;
    fs::write(file_path, payload).map_err(|err| err.to_string())
}

fn recent_projects_path() -> std::path::PathBuf {
    data_local_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join(APP_NAMESPACE)
        .join(RECENTS_FILE)
}

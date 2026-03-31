use dirs::data_local_dir;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

const APP_NAMESPACE: &str = "IntelligentAssistant";
const SESSIONS_DIR: &str = "sessions";
const METADATA_DIR: &str = "metadata";
const TRANSCRIPTS_DIR: &str = "transcripts";
const RECOVERY_FILE: &str = "recovery-snapshot.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionRecentActivity {
    pub label: String,
    pub summary: String,
    pub at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandProposal {
    pub id: String,
    pub summary: String,
    pub command: String,
    pub project_path: String,
    pub working_directory: String,
    pub requires_approval: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionTranscriptEvent {
    pub id: String,
    pub kind: String,
    pub body: String,
    pub created_at: String,
    pub display_role: Option<String>,
    pub stage_label: Option<String>,
    pub tool_label: Option<String>,
    pub tool_summary: Option<String>,
    pub proposal: Option<CommandProposal>,
    pub approval_decision: Option<String>,
    pub execution_status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionRecord {
    pub id: String,
    pub project_path: String,
    pub project_name: String,
    pub created_at: String,
    pub updated_at: String,
    pub last_activity_at: String,
    pub effective_model_id: String,
    pub title: String,
    pub status: String,
    pub recent_activity: Option<SessionRecentActivity>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionDetail {
    #[serde(flatten)]
    pub record: SessionRecord,
    pub transcript: Vec<SessionTranscriptEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SessionHistoryFilter {
    pub project_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionRecoverySnapshot {
    pub session_id: String,
    pub project_path: String,
    pub project_name: String,
    pub effective_model_id: String,
    pub restored_at: String,
    pub last_activity_at: String,
    pub recent_activity: Option<SessionRecentActivity>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSessionInput {
    pub project_path: String,
    pub project_name: String,
    pub effective_model_id: String,
    pub title: String,
    pub initial_transcript: Option<Vec<SessionTranscriptEvent>>,
    pub recent_activity: Option<SessionRecentActivity>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SessionActivityUpdate {
    pub status: Option<String>,
    pub effective_model_id: Option<String>,
    pub title: Option<String>,
    pub recent_activity: Option<SessionRecentActivity>,
    pub transcript: Option<Vec<SessionTranscriptEvent>>,
}

#[tauri::command]
pub fn create_session(input: CreateSessionInput) -> Result<SessionDetail, String> {
    ensure_session_storage()?;

    let session_id = new_session_id();
    let timestamp = now_iso();
    let record = SessionRecord {
        id: session_id.clone(),
        project_path: normalize_path(&input.project_path),
        project_name: input.project_name,
        created_at: timestamp.clone(),
        updated_at: timestamp.clone(),
        last_activity_at: input
            .recent_activity
            .as_ref()
            .map(|activity| activity.at.clone())
            .unwrap_or_else(|| timestamp.clone()),
        effective_model_id: input.effective_model_id,
        title: input.title,
        status: "active".to_string(),
        recent_activity: input.recent_activity,
    };

    let transcript = input.initial_transcript.unwrap_or_default();
    write_session_metadata(&record)?;
    write_session_transcript(&session_id, &transcript)?;

    Ok(SessionDetail { record, transcript })
}

#[tauri::command]
pub fn list_sessions(filter: Option<SessionHistoryFilter>) -> Result<Vec<SessionRecord>, String> {
    ensure_session_storage()?;

    let filter_project_path = filter
        .and_then(|entry| entry.project_path)
        .map(|path| normalize_path(&path));

    let mut sessions = Vec::new();
    for entry in fs::read_dir(metadata_dir()).map_err(|err| err.to_string())? {
        let path = entry.map_err(|err| err.to_string())?.path();
        if path.extension().and_then(|value| value.to_str()) != Some("json") {
            continue;
        }

        let contents = fs::read_to_string(&path).map_err(|err| err.to_string())?;
        let record = serde_json::from_str::<SessionRecord>(&contents).map_err(|err| err.to_string())?;

        if filter_project_path
            .as_ref()
            .is_some_and(|project_path| record.project_path != *project_path)
        {
            continue;
        }

        sessions.push(record);
    }

    sessions.sort_by(|left, right| right.last_activity_at.cmp(&left.last_activity_at));
    Ok(sessions)
}

#[tauri::command]
pub fn load_session(session_id: String) -> Result<SessionDetail, String> {
    ensure_session_storage()?;

    let record = read_session_metadata(&session_id)?;
    let transcript = read_session_transcript(&session_id)?;

    Ok(SessionDetail { record, transcript })
}

#[tauri::command]
pub fn update_session_activity(
    session_id: String,
    update: SessionActivityUpdate,
) -> Result<SessionDetail, String> {
    ensure_session_storage()?;

    let mut record = read_session_metadata(&session_id)?;
    let transcript = if let Some(transcript) = update.transcript {
        write_session_transcript(&session_id, &transcript)?;
        transcript
    } else {
        read_session_transcript(&session_id)?
    };

    if let Some(status) = update.status {
        record.status = status;
    }
    if let Some(effective_model_id) = update.effective_model_id {
        record.effective_model_id = effective_model_id;
    }
    if let Some(title) = update.title {
        record.title = title;
    }
    if let Some(recent_activity) = update.recent_activity {
        record.last_activity_at = recent_activity.at.clone();
        record.recent_activity = Some(recent_activity);
    }

    record.updated_at = now_iso();
    write_session_metadata(&record)?;

    Ok(SessionDetail { record, transcript })
}

#[tauri::command]
pub fn save_recovery_snapshot(snapshot: Option<SessionRecoverySnapshot>) -> Result<(), String> {
    ensure_session_storage()?;

    let recovery_path = recovery_snapshot_path();
    if let Some(snapshot) = snapshot {
        let payload = serde_json::to_string_pretty(&snapshot).map_err(|err| err.to_string())?;
        fs::write(recovery_path, payload).map_err(|err| err.to_string())
    } else if recovery_path.exists() {
        fs::remove_file(recovery_path).map_err(|err| err.to_string())
    } else {
        Ok(())
    }
}

#[tauri::command]
pub fn load_recovery_snapshot() -> Result<Option<SessionRecoverySnapshot>, String> {
    ensure_session_storage()?;

    let recovery_path = recovery_snapshot_path();
    if !recovery_path.exists() {
        return Ok(None);
    }

    let contents = fs::read_to_string(recovery_path).map_err(|err| err.to_string())?;
    let snapshot = serde_json::from_str::<SessionRecoverySnapshot>(&contents).map_err(|err| err.to_string())?;
    Ok(Some(snapshot))
}

fn ensure_session_storage() -> Result<(), String> {
    fs::create_dir_all(metadata_dir()).map_err(|err| err.to_string())?;
    fs::create_dir_all(transcripts_dir()).map_err(|err| err.to_string())?;
    Ok(())
}

fn read_session_metadata(session_id: &str) -> Result<SessionRecord, String> {
    let path = metadata_dir().join(format!("{session_id}.json"));
    let contents = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&contents).map_err(|err| err.to_string())
}

fn write_session_metadata(record: &SessionRecord) -> Result<(), String> {
    let path = metadata_dir().join(format!("{}.json", record.id));
    let payload = serde_json::to_string_pretty(record).map_err(|err| err.to_string())?;
    fs::write(path, payload).map_err(|err| err.to_string())
}

fn read_session_transcript(session_id: &str) -> Result<Vec<SessionTranscriptEvent>, String> {
    let path = transcripts_dir().join(format!("{session_id}.json"));
    if !path.exists() {
        return Ok(Vec::new());
    }

    let contents = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&contents).map_err(|err| err.to_string())
}

fn write_session_transcript(session_id: &str, transcript: &[SessionTranscriptEvent]) -> Result<(), String> {
    let path = transcripts_dir().join(format!("{session_id}.json"));
    let payload = serde_json::to_string_pretty(transcript).map_err(|err| err.to_string())?;
    fs::write(path, payload).map_err(|err| err.to_string())
}

fn app_data_dir() -> PathBuf {
    data_local_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join(APP_NAMESPACE)
        .join(SESSIONS_DIR)
}

fn metadata_dir() -> PathBuf {
    app_data_dir().join(METADATA_DIR)
}

fn transcripts_dir() -> PathBuf {
    app_data_dir().join(TRANSCRIPTS_DIR)
}

fn recovery_snapshot_path() -> PathBuf {
    app_data_dir().join(RECOVERY_FILE)
}

fn new_session_id() -> String {
    let epoch_nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();

    format!("session-{epoch_nanos}")
}

fn normalize_path(path: &str) -> String {
    path.replace('\\', "/")
}

fn now_iso() -> String {
    let epoch_millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();

    epoch_millis.to_string()
}

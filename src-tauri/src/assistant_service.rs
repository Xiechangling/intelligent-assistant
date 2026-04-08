use crate::credential_service::{read_api_credential, read_assistant_connection_settings};
use futures_util::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};

const DEFAULT_ANTHROPIC_URL: &str = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION: &str = "2023-06-01";
const ASSISTANT_STREAM_EVENT: &str = "assistant-turn-event";
static TURN_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantAttachment {
    pub id: String,
    pub kind: String,
    pub name: String,
    pub path: String,
    pub mime_type: Option<String>,
    pub size_bytes: Option<u64>,
    pub source: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantInputSegment {
    pub segment_type: String,
    pub text: String,
    pub command_name: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantTurnInput {
    pub mode: String,
    pub prompt: String,
    pub model_id: String,
    pub project_name: Option<String>,
    pub project_path: Option<String>,
    pub input_segments: Option<Vec<AssistantInputSegment>>,
    pub attachments: Option<Vec<AssistantAttachment>>,
    #[serde(default)]
    pub turn_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CommandProposalPayload {
    pub summary: String,
    pub command: String,
    pub project_path: String,
    pub working_directory: String,
    pub requires_approval: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AssistantStagePayload {
    pub label: String,
    pub body: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AssistantToolSummaryPayload {
    pub tool_label: String,
    pub tool_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantTurnResponse {
    pub stages: Vec<AssistantStagePayload>,
    pub assistant_message: String,
    pub tool_summary: Option<AssistantToolSummaryPayload>,
    pub command_proposal: Option<CommandProposalPayload>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind", rename_all = "kebab-case", rename_all_fields = "camelCase")]
pub enum AssistantStreamEvent {
    StageStatus {
        turn_id: String,
        stage_label: String,
        body: String,
    },
    AssistantStart {
        turn_id: String,
    },
    AssistantDelta {
        turn_id: String,
        delta: String,
    },
    ToolSummary {
        turn_id: String,
        tool_label: String,
        tool_summary: String,
    },
    CommandProposal {
        turn_id: String,
        command_proposal: CommandProposalPayload,
    },
    Complete {
        turn_id: String,
    },
    Error {
        turn_id: String,
        error: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AssistantStreamStartResponse {
    pub turn_id: String,
}

#[derive(Debug, Serialize)]
struct AnthropicMessageRequest {
    model: String,
    max_tokens: u32,
    system: String,
    messages: Vec<AnthropicMessage>,
    stream: bool,
}

#[derive(Debug, Serialize)]
struct AnthropicMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct AnthropicResponse {
    content: Vec<AnthropicContentBlock>,
}

#[derive(Debug, Deserialize)]
struct AnthropicContentBlock {
    #[serde(rename = "type")]
    block_type: String,
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AnthropicStreamEnvelope {
    #[serde(rename = "type")]
    envelope_type: String,
    delta: Option<AnthropicStreamDelta>,
    error: Option<AnthropicStreamError>,
}

#[derive(Debug, Deserialize)]
struct AnthropicStreamDelta {
    #[serde(rename = "type")]
    delta_type: String,
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AnthropicStreamError {
    message: String,
}

#[derive(Debug, Default)]
struct StreamLifecycleState {
    assistant_started: bool,
    first_delta_seen: bool,
    tool_summary_emitted: bool,
}

trait StreamEventSink: Send {
    fn emit(&mut self, event: AssistantStreamEvent) -> Result<(), String>;
}

struct TauriStreamSink {
    app: AppHandle,
}

impl StreamEventSink for TauriStreamSink {
    fn emit(&mut self, event: AssistantStreamEvent) -> Result<(), String> {
        self.app
            .emit(ASSISTANT_STREAM_EVENT, &event)
            .map_err(|err| format!("Assistant event emit failed: {err}"))
    }
}

#[cfg(test)]
#[derive(Default)]
struct TestStreamSink {
    events: Vec<AssistantStreamEvent>,
}

#[cfg(test)]
impl StreamEventSink for TestStreamSink {
    fn emit(&mut self, event: AssistantStreamEvent) -> Result<(), String> {
        self.events.push(event);
        Ok(())
    }
}

#[tauri::command]
pub async fn start_assistant_turn_stream(
    app: AppHandle,
    input: AssistantTurnInput,
) -> Result<AssistantStreamStartResponse, String> {
    validate_turn_input(&input)?;

    let turn_id = input
        .turn_id
        .clone()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(new_turn_id);
    let stream_turn_id = turn_id.clone();
    let stream_input = input.clone();
    let app_handle = app.clone();

    tauri::async_runtime::spawn(async move {
        let mut sink = TauriStreamSink { app: app_handle };
        if let Err(error) = run_streamed_turn(stream_input, stream_turn_id.clone(), &mut sink).await {
            let _ = sink.emit(AssistantStreamEvent::Error {
                turn_id: stream_turn_id,
                error,
            });
        }
    });

    Ok(AssistantStreamStartResponse { turn_id })
}

#[tauri::command]
pub async fn start_assistant_turn(input: AssistantTurnInput) -> Result<AssistantTurnResponse, String> {
    validate_turn_input(&input)?;

    let api_key = read_api_credential()?;
    let settings = read_assistant_connection_settings()?;
    let base_url = settings
        .api_base_url
        .as_deref()
        .unwrap_or(DEFAULT_ANTHROPIC_URL);

    let request = build_message_request(&input, false);
    let client = build_http_client()?;
    let response = client
        .post(base_url)
        .header("x-api-key", api_key)
        .header("anthropic-version", ANTHROPIC_VERSION)
        .header("content-type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|err| format!("Assistant request failed: {err}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response
            .text()
            .await
            .unwrap_or_else(|_| "<no body>".to_string());
        return Err(format!("Assistant request failed ({status}): {body}"));
    }

    let payload: AnthropicResponse = response
        .json()
        .await
        .map_err(|err| format!("Assistant response decode failed: {err}"))?;

    let text = payload
        .content
        .iter()
        .filter(|block| block.block_type == "text")
        .filter_map(|block| block.text.clone())
        .collect::<Vec<_>>()
        .join("\n");

    Ok(AssistantTurnResponse {
        stages: vec![
            AssistantStagePayload {
                label: "Request accepted".to_string(),
                body: "Assistant turn accepted for streaming delivery.".to_string(),
            },
            AssistantStagePayload {
                label: "Contacting assistant".to_string(),
                body: "Backend connected to the assistant service.".to_string(),
            },
        ],
        assistant_message: text.trim().to_string(),
        tool_summary: derive_optional_tool_summary(&input),
        command_proposal: None,
    })
}

async fn run_streamed_turn<S: StreamEventSink>(
    input: AssistantTurnInput,
    turn_id: String,
    sink: &mut S,
) -> Result<(), String> {
    emit_stage(
        sink,
        &turn_id,
        "Request accepted",
        "Assistant turn accepted and queued for streaming.",
    )?;

    if let Some(tool_summary) = derive_optional_tool_summary(&input) {
        sink.emit(AssistantStreamEvent::ToolSummary {
            turn_id: turn_id.clone(),
            tool_label: tool_summary.tool_label,
            tool_summary: tool_summary.tool_summary,
        })?;
    }

    emit_stage(
        sink,
        &turn_id,
        "Contacting assistant",
        "Backend connected to the assistant service and started streaming.",
    )?;

    let api_key = read_api_credential()?;
    let settings = read_assistant_connection_settings()?;
    let base_url = settings
        .api_base_url
        .as_deref()
        .unwrap_or(DEFAULT_ANTHROPIC_URL);

    let client = build_http_client()?;
    let response = client
        .post(base_url)
        .header("x-api-key", api_key)
        .header("anthropic-version", ANTHROPIC_VERSION)
        .header("content-type", "application/json")
        .json(&build_message_request(&input, true))
        .send()
        .await
        .map_err(|err| format!("Assistant request failed: {err}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response
            .text()
            .await
            .unwrap_or_else(|_| "<no body>".to_string());
        return Err(format!("Assistant request failed ({status}): {body}"));
    }

    let mut lifecycle = StreamLifecycleState::default();
    let mut parser = SseParser::default();
    let mut stream = response.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|err| format!("Assistant stream read failed: {err}"))?;
        let text = String::from_utf8_lossy(&chunk);
        let messages = parser.push(&text);
        for (event_name, data) in messages {
            handle_sse_message(&turn_id, &data, sink, &mut lifecycle)?;
            if event_name == "error" {
                return Err("Assistant stream reported an error event.".to_string());
            }
        }
    }

    if !lifecycle.assistant_started {
        sink.emit(AssistantStreamEvent::AssistantStart {
            turn_id: turn_id.clone(),
        })?;
        lifecycle.assistant_started = true;
    }

    emit_stage(
        sink,
        &turn_id,
        "Finalizing",
        "Assistant stream finished; finalizing transcript state.",
    )?;
    sink.emit(AssistantStreamEvent::Complete { turn_id })?;
    Ok(())
}

fn build_http_client() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(90))
        .build()
        .map_err(|err| format!("Assistant client setup failed: {err}"))
}

fn build_message_request(input: &AssistantTurnInput, stream: bool) -> AnthropicMessageRequest {
    AnthropicMessageRequest {
        model: map_model_id(&input.model_id).to_string(),
        max_tokens: 1200,
        system: build_system_prompt(input),
        messages: vec![AnthropicMessage {
            role: "user".to_string(),
            content: build_user_prompt(input),
        }],
        stream,
    }
}

fn validate_turn_input(input: &AssistantTurnInput) -> Result<(), String> {
    match input.mode.as_str() {
        "project" => {
            if input.project_path.as_deref().unwrap_or("").trim().is_empty() {
                return Err("Project mode requires an active project path.".to_string());
            }
            Ok(())
        }
        "conversation" => Ok(()),
        _ => Err("Unsupported assistant mode.".to_string()),
    }
}

fn build_system_prompt(input: &AssistantTurnInput) -> String {
    let is_project_mode = input.mode == "project";
    let project_context = if is_project_mode {
        format!(
            "Active project name: {}\nActive project path: {}",
            input.project_name.as_deref().unwrap_or("Selected Project"),
            input.project_path.as_deref().unwrap_or("<unknown>")
        )
    } else {
        "No project execution context is required for this turn.".to_string()
    };

    format!(
        "You are the assistant response generator for a Windows-first desktop coding assistant.\n{project_context}\n\nRules:\n- Respond in plain natural language, not JSON.\n- Keep the response suitable for incremental streaming.\n- For project mode, stay grounded in the active workspace context.\n- Do not emit markdown code fences unless they help answer the user.\n- Do not invent command execution results you did not actually run."
    )
}

fn build_user_prompt(input: &AssistantTurnInput) -> String {
    let input_summary = input
        .input_segments
        .as_ref()
        .filter(|segments| !segments.is_empty())
        .map(|segments| {
            let lines = segments
                .iter()
                .map(|segment| match segment.segment_type.as_str() {
                    "command" => format!(
                        "- command: {}{}",
                        segment.command_name.as_deref().unwrap_or("unknown"),
                        if segment.text.is_empty() {
                            String::new()
                        } else {
                            format!(" | raw: {}", segment.text)
                        }
                    ),
                    _ => format!("- text: {}", segment.text),
                })
                .collect::<Vec<_>>()
                .join("\n");
            format!("\nInput segments:\n{}", lines)
        })
        .unwrap_or_default();

    let attachment_summary = input
        .attachments
        .as_ref()
        .filter(|attachments| !attachments.is_empty())
        .map(|attachments| {
            let lines = attachments
                .iter()
                .map(|attachment| format!("- {} ({}) [{}]", attachment.name, attachment.kind, attachment.status))
                .collect::<Vec<_>>()
                .join("\n");
            format!("\nAttachments:\n{}", lines)
        })
        .unwrap_or_default();

    format!(
        "Mode: {}\nModel: {}\nPrompt: {}{}{}",
        input.mode, input.model_id, input.prompt, input_summary, attachment_summary
    )
}

fn map_model_id(model_id: &str) -> &'static str {
    match model_id {
        "claude-opus" => "claude-opus-4-6",
        "claude-haiku" => "claude-haiku-4-5-20251001",
        _ => "claude-sonnet-4-6",
    }
}

fn derive_optional_tool_summary(input: &AssistantTurnInput) -> Option<AssistantToolSummaryPayload> {
    let command_count = input
        .input_segments
        .as_ref()
        .map(|segments| {
            segments
                .iter()
                .filter(|segment| segment.segment_type == "command")
                .count()
        })
        .unwrap_or(0);
    let text_count = input
        .input_segments
        .as_ref()
        .map(|segments| {
            segments
                .iter()
                .filter(|segment| segment.segment_type == "text")
                .count()
        })
        .unwrap_or(0);
    let attachment_count = input.attachments.as_ref().map(|attachments| attachments.len()).unwrap_or(0);

    if command_count == 0 && text_count == 0 && attachment_count == 0 {
        return None;
    }

    Some(AssistantToolSummaryPayload {
        tool_label: "Request context".to_string(),
        tool_summary: format!(
            "Prepared assistant request with {text_count} text segment(s), {command_count} command segment(s), and {attachment_count} attachment(s)."
        ),
    })
}

fn emit_stage(
    sink: &mut dyn StreamEventSink,
    turn_id: &str,
    stage_label: &str,
    body: &str,
) -> Result<(), String> {
    sink.emit(AssistantStreamEvent::StageStatus {
        turn_id: turn_id.to_string(),
        stage_label: stage_label.to_string(),
        body: body.to_string(),
    })
}

fn handle_sse_message(
    turn_id: &str,
    data: &str,
    sink: &mut dyn StreamEventSink,
    lifecycle: &mut StreamLifecycleState,
) -> Result<(), String> {
    if data.trim().is_empty() || data.trim() == "[DONE]" {
        return Ok(());
    }

    let envelope: AnthropicStreamEnvelope =
        serde_json::from_str(data).map_err(|err| format!("Assistant stream decode failed: {err}. Raw event: {data}"))?;

    match envelope.envelope_type.as_str() {
        "content_block_delta" => {
            let delta = envelope
                .delta
                .ok_or_else(|| "Assistant stream delta event missing delta payload.".to_string())?;
            if delta.delta_type == "text_delta" {
                let text = delta.text.unwrap_or_default();
                if !text.is_empty() {
                    if !lifecycle.assistant_started {
                        sink.emit(AssistantStreamEvent::AssistantStart {
                            turn_id: turn_id.to_string(),
                        })?;
                        lifecycle.assistant_started = true;
                    }
                    if !lifecycle.first_delta_seen {
                        emit_stage(
                            sink,
                            turn_id,
                            "First token received",
                            "Assistant started returning streamed output.",
                        )?;
                        lifecycle.first_delta_seen = true;
                    }
                    sink.emit(AssistantStreamEvent::AssistantDelta {
                        turn_id: turn_id.to_string(),
                        delta: text,
                    })?;
                }
            }
        }
        "error" => {
            let message = envelope
                .error
                .map(|error| error.message)
                .unwrap_or_else(|| "Assistant stream failed.".to_string());
            return Err(message);
        }
        _ => {}
    }

    Ok(())
}

fn new_turn_id() -> String {
    let epoch_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let counter = TURN_COUNTER.fetch_add(1, Ordering::Relaxed);
    format!("turn-{epoch_ms}-{counter}")
}

#[derive(Default)]
struct SseParser {
    buffer: String,
    event_name: Option<String>,
    data_lines: Vec<String>,
}

impl SseParser {
    fn push(&mut self, chunk: &str) -> Vec<(String, String)> {
        self.buffer.push_str(chunk);
        let mut messages = Vec::new();

        while let Some(index) = self.buffer.find('\n') {
            let mut line = self.buffer.drain(..=index).collect::<String>();
            if line.ends_with('\n') {
                line.pop();
            }
            if line.ends_with('\r') {
                line.pop();
            }

            if line.is_empty() {
                if !self.data_lines.is_empty() {
                    messages.push((
                        self.event_name
                            .clone()
                            .unwrap_or_else(|| "message".to_string()),
                        self.data_lines.join("\n"),
                    ));
                    self.event_name = None;
                    self.data_lines.clear();
                }
                continue;
            }

            if let Some(rest) = line.strip_prefix("event:") {
                self.event_name = Some(rest.trim().to_string());
                continue;
            }

            if let Some(rest) = line.strip_prefix("data:") {
                self.data_lines.push(rest.trim_start().to_string());
            }
        }

        messages
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_turn_id() -> String {
        "turn-test-1".to_string()
    }

    #[test]
    fn streams_deltas_before_completion() {
        let mut sink = TestStreamSink::default();
        let mut lifecycle = StreamLifecycleState::default();
        let turn_id = sample_turn_id();

        emit_stage(&mut sink, &turn_id, "Request accepted", "Queued").unwrap();
        emit_stage(&mut sink, &turn_id, "Contacting assistant", "Connected").unwrap();
        handle_sse_message(
            &turn_id,
            r#"{"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}"#,
            &mut sink,
            &mut lifecycle,
        )
        .unwrap();
        emit_stage(&mut sink, &turn_id, "Finalizing", "Done").unwrap();
        sink.emit(AssistantStreamEvent::Complete {
            turn_id: turn_id.clone(),
        })
        .unwrap();

        let first_delta_index = sink
            .events
            .iter()
            .position(|event| matches!(event, AssistantStreamEvent::AssistantDelta { .. }))
            .expect("expected at least one assistant delta event");
        let complete_index = sink
            .events
            .iter()
            .position(|event| matches!(event, AssistantStreamEvent::Complete { .. }))
            .expect("expected complete event");

        assert!(first_delta_index < complete_index);
    }

    #[test]
    fn emits_stage_and_complete_events_in_order() {
        let mut sink = TestStreamSink::default();
        let mut lifecycle = StreamLifecycleState::default();
        let turn_id = sample_turn_id();

        emit_stage(&mut sink, &turn_id, "Request accepted", "Queued").unwrap();
        emit_stage(&mut sink, &turn_id, "Contacting assistant", "Connected").unwrap();
        handle_sse_message(
            &turn_id,
            r#"{"type":"content_block_delta","delta":{"type":"text_delta","text":"A"}}"#,
            &mut sink,
            &mut lifecycle,
        )
        .unwrap();
        emit_stage(&mut sink, &turn_id, "Finalizing", "Done").unwrap();
        sink.emit(AssistantStreamEvent::Complete {
            turn_id: turn_id.clone(),
        })
        .unwrap();

        let labels = sink
            .events
            .iter()
            .filter_map(|event| match event {
                AssistantStreamEvent::StageStatus { stage_label, .. } => Some(stage_label.as_str()),
                AssistantStreamEvent::Complete { .. } => Some("complete"),
                _ => None,
            })
            .collect::<Vec<_>>();

        assert_eq!(
            labels,
            vec![
                "Request accepted",
                "Contacting assistant",
                "First token received",
                "Finalizing",
                "complete",
            ]
        );
    }

    #[test]
    fn stream_contract_examples_round_trip() {
        let event = AssistantStreamEvent::AssistantDelta {
            turn_id: "turn-123".to_string(),
            delta: "hello".to_string(),
        };
        let json = serde_json::to_string(&event).unwrap();
        assert!(json.contains(r#""kind":"assistant-delta""#));
        assert!(json.contains(r#""turnId":"turn-123""#));
        assert!(json.contains(r#""delta":"hello""#));

        let decoded: AssistantStreamEvent = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded, event);
    }

    #[test]
    fn sse_parser_collects_split_messages() {
        let mut parser = SseParser::default();
        let first = parser.push("event: content_block_delta\ndata: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\"Hel");
        assert!(first.is_empty());
        let second = parser.push("lo\"}}\n\n");
        assert_eq!(second.len(), 1);
        assert_eq!(second[0].0, "content_block_delta");
        assert!(second[0].1.contains("Hello"));
    }
}

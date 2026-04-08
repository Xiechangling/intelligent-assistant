use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::{Command, Output};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteCommandInput {
    pub command: String,
    pub project_path: String,
    pub working_directory: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionOutputPayload {
    pub stream: String,
    pub text: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChangedFilePayload {
    pub path: String,
    pub summary: String,
    pub diff: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteCommandResponse {
    pub status: String,
    pub started_at: String,
    pub completed_at: String,
    pub output: Vec<ExecutionOutputPayload>,
    pub changed_files: Vec<ChangedFilePayload>,
}

#[tauri::command]
pub fn execute_approved_command(input: ExecuteCommandInput) -> Result<ExecuteCommandResponse, String> {
    if input.command.trim().is_empty() {
        return Err("Execution blocked: approved command cannot be empty.".to_string());
    }

    validate_working_directory(&input.project_path, &input.working_directory)?;

    let started_at = now_string();
    let mut output = vec![system_output(format!(
        "Execution started for workspace {} in working directory {}.",
        input.project_path, input.working_directory
    ))];

    let result = run_command(&input.command, &input.working_directory)
        .map_err(|err| format!("Execution failed to launch command: {err}"))?;

    append_process_output(&mut output, &result);

    let changed_files = match collect_git_review(&input.working_directory) {
        Ok(files) => files,
        Err(message) => {
            output.push(system_output(format!(
                "Review unavailable after execution: {message}"
            )));
            Vec::new()
        }
    };

    output.push(system_output(if result.status.success() {
        "Execution finished successfully.".to_string()
    } else {
        format!(
            "Execution failed with exit code {}.",
            result.status.code().unwrap_or(-1)
        )
    }));

    Ok(ExecuteCommandResponse {
        status: if result.status.success() {
            "completed".to_string()
        } else {
            "failed".to_string()
        },
        started_at,
        completed_at: now_string(),
        output,
        changed_files,
    })
}

fn run_command(command: &str, working_directory: &str) -> Result<Output, std::io::Error> {
    if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", command])
            .current_dir(working_directory)
            .output()
    } else {
        Command::new("sh")
            .args(["-lc", command])
            .current_dir(working_directory)
            .output()
    }
}

fn append_process_output(output: &mut Vec<ExecutionOutputPayload>, result: &Output) {
    let stdout = String::from_utf8_lossy(&result.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&result.stderr).trim().to_string();

    if !stdout.is_empty() {
        output.push(ExecutionOutputPayload {
            stream: "stdout".to_string(),
            text: stdout,
            created_at: now_string(),
        });
    }

    if !stderr.is_empty() {
        output.push(ExecutionOutputPayload {
            stream: "stderr".to_string(),
            text: stderr,
            created_at: now_string(),
        });
    }
}

fn system_output(text: String) -> ExecutionOutputPayload {
    ExecutionOutputPayload {
        stream: "system".to_string(),
        text,
        created_at: now_string(),
    }
}

fn validate_working_directory(project_path: &str, working_directory: &str) -> Result<(), String> {
    let project = Path::new(project_path)
        .canonicalize()
        .map_err(|err| format!("Execution blocked: invalid project path: {err}"))?;
    let working = Path::new(working_directory)
        .canonicalize()
        .map_err(|err| format!("Execution blocked: invalid working directory: {err}"))?;

    if !working.starts_with(&project) {
        return Err(format!(
            "Execution blocked: working directory '{}' escapes the selected workspace '{}'.",
            working.display(),
            project.display()
        ));
    }

    Ok(())
}

fn collect_git_review(working_directory: &str) -> Result<Vec<ChangedFilePayload>, String> {
    let status = Command::new("git")
        .args(["status", "--short"])
        .current_dir(working_directory)
        .output()
        .map_err(|err| format!("git status failed: {err}"))?;

    if !status.status.success() {
        return Err("current folder is not a git repository".to_string());
    }

    let status_text = String::from_utf8_lossy(&status.stdout);
    let mut files = Vec::new();

    for line in status_text.lines() {
        if line.len() < 4 {
            continue;
        }
        let status_code = line[..2].to_string();
        let path = line[3..]
            .split(" -> ")
            .last()
            .unwrap_or("")
            .trim()
            .to_string();

        if path.is_empty() {
            continue;
        }

        let diff = Command::new("git")
            .args(["diff", "HEAD", "--", &path])
            .current_dir(working_directory)
            .output()
            .map_err(|err| format!("git diff failed for {path}: {err}"))?;
        let diff_text = String::from_utf8_lossy(&diff.stdout).to_string();
        files.push(ChangedFilePayload {
            path: path.clone(),
            summary: summarize_status(&status_code, &path),
            diff: if diff_text.trim().is_empty() {
                format!("No diff available for {}.", path)
            } else {
                diff_text
            },
        });
    }

    Ok(files)
}

fn summarize_status(status: &str, path: &str) -> String {
    let normalized = status.trim();
    match normalized {
        "M" | "MM" | "AM" => format!("Modified {}", path),
        "A" | "??" => format!("Added {}", path),
        "D" => format!("Deleted {}", path),
        "R" | "RM" | "R?" => format!("Renamed {}", path),
        _ => format!("Updated {}", path),
    }
}

fn now_string() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis().to_string())
        .unwrap_or_else(|_| "0".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    struct TestDirs {
        root: PathBuf,
        project: PathBuf,
        nested: PathBuf,
        outside: PathBuf,
    }

    impl TestDirs {
        fn new(label: &str) -> Self {
            let unique = format!(
                "intelligent-assistant-{label}-{}-{}",
                std::process::id(),
                now_string()
            );
            let root = std::env::temp_dir().join(unique);
            let project = root.join("project");
            let nested = project.join("nested");
            let outside = root.join("outside");

            fs::create_dir_all(&nested).unwrap();
            fs::create_dir_all(&outside).unwrap();

            Self {
                root,
                project,
                nested,
                outside,
            }
        }
    }

    impl Drop for TestDirs {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.root);
        }
    }

    #[test]
    fn validate_working_directory_rejects_escape_attempts() {
        let dirs = TestDirs::new("escape");

        let error = validate_working_directory(
            dirs.project.to_str().unwrap(),
            dirs.outside.to_str().unwrap(),
        )
        .unwrap_err();

        assert!(error.contains("Execution blocked: working directory"));
        assert!(error.contains("escapes the selected workspace"));
    }

    #[test]
    fn execute_command_rejects_empty_commands() {
        let dirs = TestDirs::new("empty");

        let error = execute_approved_command(ExecuteCommandInput {
            command: "   ".to_string(),
            project_path: dirs.project.to_str().unwrap().to_string(),
            working_directory: dirs.nested.to_str().unwrap().to_string(),
        })
        .unwrap_err();

        assert_eq!(error, "Execution blocked: approved command cannot be empty.");
    }

    #[test]
    fn execute_command_returns_labeled_output_streams() {
        let dirs = TestDirs::new("streams");
        let command = if cfg!(target_os = "windows") {
            "echo hello stdout && echo hello stderr 1>&2"
        } else {
            "printf 'hello stdout\n' && printf 'hello stderr\n' >&2"
        };

        let response = execute_approved_command(ExecuteCommandInput {
            command: command.to_string(),
            project_path: dirs.project.to_str().unwrap().to_string(),
            working_directory: dirs.nested.to_str().unwrap().to_string(),
        })
        .unwrap();

        let streams: Vec<&str> = response.output.iter().map(|entry| entry.stream.as_str()).collect();
        assert!(streams.contains(&"system"));
        assert!(streams.contains(&"stdout"));
        assert!(streams.contains(&"stderr"));
        assert!(response
            .output
            .iter()
            .any(|entry| entry.stream == "stdout" && entry.text.contains("hello stdout")));
        assert!(response
            .output
            .iter()
            .any(|entry| entry.stream == "stderr" && entry.text.contains("hello stderr")));
    }

    #[test]
    fn execute_command_surfaces_review_unavailable_message() {
        let dirs = TestDirs::new("review-unavailable");

        let response = execute_approved_command(ExecuteCommandInput {
            command: if cfg!(target_os = "windows") {
                "echo done".to_string()
            } else {
                "printf 'done\n'".to_string()
            },
            project_path: dirs.project.to_str().unwrap().to_string(),
            working_directory: dirs.nested.to_str().unwrap().to_string(),
        })
        .unwrap();

        assert_eq!(response.status, "completed");
        assert!(response.changed_files.is_empty());
        assert!(response.output.iter().any(|entry| {
            entry.stream == "system" && entry.text.contains("Review unavailable after execution")
        }));
    }
}

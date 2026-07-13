import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { BiMicrophone, BiStopCircle } from "react-icons/bi";

import api from "../api/axios";

interface ChatSource {
  chunk_id: number;
  document_id: number;
  page_number: number | null;
  distance: number;
}

interface ChatResponse {
  answer: string;
  session_id: number;
  language: SupportedLanguage;
  sources: ChatSource[];
}

interface TranscriptionResponse {
  text: string;
}

type SupportedLanguage =
  | "English"
  | "Spanish"
  | "French"
  | "German"
  | "Amharic"
  | "Arabic"
  | "Chinese"
  | "Hindi"
  | "Portuguese";

const supportedLanguages: SupportedLanguage[] = [
  "English",
  "Spanish",
  "French",
  "German",
  "Amharic",
  "Arabic",
  "Chinese",
  "Hindi",
  "Portuguese",
];

function Chat() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("English");
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const suggestedQuestions = [
    "Summarize the newest uploaded document",
    "What risks or decisions are mentioned?",
    "List action items with source pages",
  ];

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => (
      await api.post<ChatResponse>("/chat/", {
        question: prompt,
        language,
      })
    ).data,
    onSuccess: (data) => setAnswer(data),
  });

  const transcriptionMutation = useMutation({
    mutationFn: async (audioFile: File) => {
      const formData = new FormData();
      formData.append("file", audioFile);

      return (await api.post<TranscriptionResponse>("/transcriptions/", formData)).data;
    },
    onSuccess: (data) => {
      setQuestion(data.text);
      setRecordingError("");
    },
    onError: () => {
      setRecordingError("Unable to transcribe audio. Check microphone permissions and backend OpenAI configuration.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (question.trim()) {
      chatMutation.mutate(question.trim());
    }
  };

  const stopMediaTracks = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const startRecording = async () => {
    setRecordingError("");

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingError("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      audioChunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
        const audioFile = new File([audioBlob], "voice-question.webm", { type: audioBlob.type });

        setIsRecording(false);
        stopMediaTracks();

        if (audioBlob.size === 0) {
          setRecordingError("No audio was captured. Try recording again.");
          return;
        }

        transcriptionMutation.mutate(audioFile);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      stopMediaTracks();
      setIsRecording(false);
      setRecordingError("Microphone permission was denied or no microphone is available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => () => stopMediaTracks(), []);

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 4 } }}>
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Box>
            <Typography variant="overline" color="secondary.dark">
              Grounded Q&A
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: 30, sm: 38 } }}>Chat with your documents</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
              Ask focused questions and review the document chunks used to generate each answer.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {suggestedQuestions.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                onClick={() => setQuestion(prompt)}
                sx={{
                  bgcolor: "rgba(11, 61, 145, 0.42)",
                  color: "#ffffff",
                  border: "1px solid rgba(96, 165, 250, 0.44)",
                  fontWeight: 800,
                  "&:hover": {
                    bgcolor: "rgba(37, 99, 235, 0.62)",
                    borderColor: "rgba(147, 197, 253, 0.76)",
                  },
                }}
              />
            ))}
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "stretch" }}>
            <TextField
              label="Ask a question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              multiline
              minRows={4}
              fullWidth
            />
            <TextField
              select
              label="Answer language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              {supportedLanguages.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={chatMutation.isPending || !question.trim()}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {chatMutation.isPending ? "Thinking..." : "Ask assistant"}
            </Button>
            <Button
              type="button"
              variant={isRecording ? "contained" : "outlined"}
              color={isRecording ? "error" : "primary"}
              size="large"
              startIcon={isRecording ? <BiStopCircle /> : <BiMicrophone />}
              disabled={transcriptionMutation.isPending}
              onClick={isRecording ? stopRecording : startRecording}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {isRecording ? "Stop recording" : transcriptionMutation.isPending ? "Transcribing..." : "Voice question"}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Record a question, review the transcript, then ask the assistant.
            </Typography>
          </Stack>
          {chatMutation.isError ? <Alert severity="error">Unable to generate an answer.</Alert> : null}
          {recordingError ? <Alert severity="error">{recordingError}</Alert> : null}
          {isRecording ? <Alert severity="info">Recording. Speak clearly, then stop to transcribe.</Alert> : null}
        </Stack>
      </Paper>
      {answer ? (
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
              <Box>
                <Typography variant="overline" color="secondary.dark">
                  Response
                </Typography>
                <Typography variant="h5">Answer</Typography>
              </Box>
              <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", alignSelf: { xs: "flex-start", md: "center" } }}>
                <Chip label={`Language: ${answer.language}`} color="secondary" variant="outlined" />
                <Chip label={`Session ${answer.session_id}`} color="primary" variant="outlined" />
              </Stack>
            </Stack>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                bgcolor: "rgba(11, 61, 145, 0.06)",
                border: "1px solid rgba(11, 61, 145, 0.12)",
              }}
            >
              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{answer.answer}</Typography>
            </Box>
            <Divider />
            <Stack spacing={1.5}>
              <Typography variant="h6">Sources</Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {answer.sources.map((source) => (
                  <Chip
                    key={source.chunk_id}
                    label={`Doc ${source.document_id} / Chunk ${source.chunk_id}${source.page_number ? ` / Page ${source.page_number}` : ""}`}
                    variant="outlined"
                    color="secondary"
                  />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default Chat;



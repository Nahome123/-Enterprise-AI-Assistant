import { useState } from "react";
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (question.trim()) {
      chatMutation.mutate(question.trim());
    }
  };

  return (
    <Stack spacing={3}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="secondary.dark">
              Grounded Q&A
            </Typography>
            <Typography variant="h4">Chat with your documents</Typography>
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
                  bgcolor: "rgba(11, 61, 145, 0.1)",
                  color: "primary.dark",
                  "&:hover": { bgcolor: "rgba(11, 61, 145, 0.16)" },
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
            <Button type="submit" variant="contained" size="large" disabled={chatMutation.isPending || !question.trim()}>
              {chatMutation.isPending ? "Thinking..." : "Ask assistant"}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Answers are limited to uploaded document context.
            </Typography>
          </Stack>
          {chatMutation.isError ? <Alert severity="error">Unable to generate an answer.</Alert> : null}
        </Stack>
      </Paper>
      {answer ? (
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
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
                p: 3,
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



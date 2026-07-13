import { useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import api from "../api/axios";

interface DocumentItem {
  id: number;
  file_name: string;
  file_type: string;
  status: string;
  uploaded_at: string;
}

interface ApiError {
  detail?: string;
}

type IngestionMode = "file" | "text";

function Documents() {
  const queryClient = useQueryClient();
  const [ingestionMode, setIngestionMode] = useState<IngestionMode>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [formError, setFormError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"completed" | "failed" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: async () => (await api.get<DocumentItem[]>("/documents/")).data,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (ingestionMode === "text") {
        return (await api.post<DocumentItem>("/documents/text", {
          title: textTitle.trim(),
          content: textContent.trim(),
        })).data;
      }

      if (!selectedFile) {
        throw new Error("Choose a file before uploading.");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      return (await api.post<DocumentItem>("/documents/upload", formData)).data;
    },
    onSuccess: (document) => {
      setSelectedFile(null);
      setTextTitle("");
      setTextContent("");
      setFormError("");
      setUploadStatus(document.status === "completed" ? "completed" : "failed");
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await api.delete(`/documents/${documentId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadStatus(null);
    setFormError("");
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = () => {
    setFormError("");
    setUploadStatus(null);

    if (ingestionMode === "file" && !selectedFile) {
      setFormError("Choose a file before uploading.");
      return;
    }

    if (ingestionMode === "text") {
      if (textTitle.trim().length < 2) {
        setFormError("Add a short title for the pasted text.");
        return;
      }

      if (textContent.trim().length < 20) {
        setFormError("Paste at least 20 characters of text.");
        return;
      }
    }

    uploadMutation.mutate();
  };

  const handleDelete = (document: DocumentItem) => {
    const shouldDelete = window.confirm(`Delete ${document.file_name}?`);

    if (shouldDelete) {
      deleteMutation.mutate(document.id);
    }
  };

  const uploadError = uploadMutation.error as AxiosError<ApiError> | null;
  const canSubmit =
    ingestionMode === "file"
      ? Boolean(selectedFile)
      : textTitle.trim().length >= 2 && textContent.trim().length >= 20;
  const documents = documentsQuery.data ?? [];
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || document.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: documents.length,
    completed: documents.filter((document) => document.status === "completed").length,
    failed: documents.filter((document) => document.status === "failed").length,
    processing: documents.filter((document) => document.status === "processing").length,
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") {
      return "success";
    }

    if (status === "failed") {
      return "error";
    }

    return "warning";
  };

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Stack spacing={{ xs: 2, sm: 2.5 }}>
              <Box>
                <Typography variant="overline" color="secondary.dark">
                  Ingestion
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: 30, sm: 38 } }}>Documents</Typography>
                <Typography color="text.secondary">
                  Upload files or paste text directly and track when it becomes searchable.
                </Typography>
              </Box>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={ingestionMode}
                onChange={(_, value: IngestionMode | null) => {
                  if (value) {
                    setIngestionMode(value);
                    setFormError("");
                    setUploadStatus(null);
                  }
                }}
                color="primary"
              >
                <ToggleButton value="file">Upload file</ToggleButton>
                <ToggleButton value="text">Paste text</ToggleButton>
              </ToggleButtonGroup>
              {ingestionMode === "file" ? (
                <Box
                  component="label"
                  sx={{
                    display: "block",
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    border: "1px dashed rgba(11, 61, 145, 0.36)",
                    bgcolor: "rgba(11, 61, 145, 0.06)",
                    cursor: "pointer",
                    transition: "border-color 160ms ease, background 160ms ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(11, 61, 145, 0.1)",
                    },
                  }}
                >
                  <input hidden type="file" accept=".pdf,.txt,.docx" onChange={handleFileChange} />
                  <Stack spacing={1}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {selectedFile ? selectedFile.name : "Choose a document"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                        : "PDF, TXT, and DOCX are supported."}
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Stack spacing={2}>
                  <TextField
                    label="Text title"
                    value={textTitle}
                    onChange={(event) => {
                      setFormError("");
                      setTextTitle(event.target.value);
                    }}
                    helperText="This becomes the document name."
                    fullWidth
                  />
                  <TextField
                    label="Paste text"
                    value={textContent}
                    onChange={(event) => {
                      setFormError("");
                      setTextContent(event.target.value);
                    }}
                    minRows={7}
                    multiline
                    fullWidth
                    helperText={`${textContent.trim().length} characters`}
                  />
                </Stack>
              )}
              <Button
                variant="contained"
                size="large"
                disabled={!canSubmit || uploadMutation.isPending}
                onClick={handleUpload}
              >
                {uploadMutation.isPending ? "Processing..." : ingestionMode === "file" ? "Upload and process" : "Save text and process"}
              </Button>
              {formError ? <Alert severity="warning">{formError}</Alert> : null}
              {uploadMutation.isPending ? <LinearProgress /> : null}
              {uploadMutation.isError ? (
                <Alert severity="error">
                  {uploadError?.response?.data?.detail ?? "Upload failed."}
                </Alert>
              ) : null}
              {uploadStatus === "completed" ? (
                <Alert severity="success">Document uploaded and processed.</Alert>
              ) : null}
              {uploadStatus === "failed" ? (
                <Alert severity="warning">
                  Document uploaded, but processing failed. Check the backend OpenAI/API configuration and try again.
                </Alert>
              ) : null}
              {deleteMutation.isError ? <Alert severity="error">Unable to delete document.</Alert> : null}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
            <Stack spacing={2}>
              <Typography variant="h6">Library health</Typography>
              <Grid container spacing={2}>
                {Object.entries(statusCounts).map(([label, value]) => (
                  <Grid key={label} size={{ xs: 6, sm: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "rgba(1, 126, 132, 0.07)",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                        {label}
                      </Typography>
                      <Typography variant="h5">{value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Divider />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Search documents"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Status"
                  select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  sx={{ minWidth: { xs: "100%", sm: 180 } }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ overflowX: "auto" }}>
        {documentsQuery.isError ? <Alert severity="error">Unable to load documents.</Alert> : null}
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((document) => (
              <TableRow key={document.id}>
                <TableCell>{document.file_name}</TableCell>
                <TableCell>{document.file_type.toUpperCase()}</TableCell>
                <TableCell>
                  <Chip label={document.status} size="small" color={getStatusColor(document.status)} />
                </TableCell>
                <TableCell>{new Date(document.uploaded_at).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button
                    color="error"
                    size="small"
                    variant="outlined"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(document)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filteredDocuments.length ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="info">No documents match the current view.</Alert>
          </Box>
        ) : null}
      </Paper>
    </Stack>
  );
}

export default Documents;



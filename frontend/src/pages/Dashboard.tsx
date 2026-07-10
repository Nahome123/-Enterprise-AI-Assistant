import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import api from "../api/axios";
import type { AuthUser } from "../types/auth";

interface DocumentItem {
  id: number;
  file_name: string;
  file_type: string;
  status: string;
  uploaded_at: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const userQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => (await api.get<AuthUser>("/auth/me")).data,
  });

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: async () => (await api.get<DocumentItem[]>("/documents/")).data,
  });

  const documents = documentsQuery.data ?? [];
  const completedDocuments = documents.filter((document) => document.status === "completed").length;
  const failedDocuments = documents.filter((document) => document.status === "failed").length;
  const processingDocuments = documents.filter((document) => document.status === "processing").length;
  const readiness = documents.length ? Math.round((completedDocuments / documents.length) * 100) : 0;
  const recentDocuments = documents.slice(0, 5);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/auth/me");
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      navigate("/");
    },
  });

  const cards = [
    { label: "Total documents", value: documents.length, tone: "#0b3d91" },
    { label: "Ready for search", value: completedDocuments, tone: "#198754" },
    { label: "Needs attention", value: failedDocuments, tone: "#dc3545" },
    { label: "Processing", value: processingDocuments, tone: "#f0ad4e" },
  ];

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          bgcolor: "rgba(0, 0, 0, 0.92)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: { md: "center" } }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="secondary.dark">
              Workspace overview
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              {userQuery.data ? `Welcome, ${userQuery.data.full_name}` : "Dashboard"}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 680, mt: 1 }}>
              Track ingestion health, review your searchable knowledge base, and jump into grounded Q&A with source citations.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/documents" variant="contained">
              Upload documents
            </Button>
            <Button component={RouterLink} to="/chat" variant="outlined" color="secondary">
              Ask questions
            </Button>
          </Stack>
        </Stack>
      </Paper>
      {userQuery.isError || documentsQuery.isError ? (
        <Alert severity="error">Unable to load dashboard data.</Alert>
      ) : null}
      {deleteAccountMutation.isError ? (
        <Alert severity="error">Unable to delete account. Please try again.</Alert>
      ) : null}
      <Alert severity="info" variant="outlined">
        Free beta access is active on this account for a limited time while Lumora is being evaluated.
      </Alert>
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                transition: "transform 160ms ease, box-shadow 160ms ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 18px 40px rgba(31, 41, 55, 0.1)",
                },
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ width: 38, height: 4, borderRadius: 99, bgcolor: card.tone }} />
                <Typography color="text.secondary">{card.label}</Typography>
                <Typography variant="h3" sx={{ fontWeight: 850, color: card.tone }}>
                  {card.value}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6">Search readiness</Typography>
                <Typography color="text.secondary">
                  {completedDocuments} of {documents.length} documents are embedded and ready.
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={readiness}
                sx={{ height: 10, borderRadius: 99, bgcolor: "rgba(11, 61, 145, 0.12)" }}
              />
              <Typography variant="h4" color="primary.dark">
                {readiness}%
              </Typography>
              <Chip label={`Role: ${userQuery.data?.role ?? "loading"}`} sx={{ alignSelf: "flex-start" }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Recent documents</Typography>
                <Button component={RouterLink} to="/documents" size="small">
                  View all
                </Button>
              </Stack>
              {recentDocuments.length ? (
                recentDocuments.map((document) => (
                  <Stack
                    key={document.id}
                    direction="row"
                    spacing={2}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(11, 61, 145, 0.06)",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 750 }} noWrap>
                        {document.file_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(document.uploaded_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip label={document.status} size="small" color={document.status === "completed" ? "success" : document.status === "failed" ? "error" : "warning"} />
                  </Stack>
                ))
              ) : (
                <Alert severity="info">No documents yet. Upload your first file to activate search.</Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: 3, border: "1px solid rgba(220, 53, 69, 0.34)", bgcolor: "rgba(20, 0, 0, 0.72)" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">Account controls</Typography>
            <Typography color="text.secondary">
              Permanently delete your profile, documents, chat history, tickets, and audit entries.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setIsDeleteDialogOpen(true)}
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          >
            Delete my account
          </Button>
        </Stack>
      </Paper>
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes your Lumora account and all workspace data connected to it. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteAccountMutation.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteAccountMutation.mutate()}
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending ? "Deleting..." : "Delete account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default Dashboard;




import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import api from "../api/axios";

interface Ticket {
  id: number;
  title: string;
  description: string;
  customer_email: string | null;
  status: string;
  category: string;
  priority: string;
  routed_team: string;
  suggested_response: string;
  created_at: string;
  updated_at: string;
}

interface TicketAnalytics {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  high_priority: number;
  category_counts: Record<string, number>;
  team_counts: Record<string, number>;
}

interface ManagerDashboard {
  unresolved_count: number;
  high_priority_open: number;
  routing_load: Record<string, number>;
  attention_queue: Array<{
    id: number;
    title: string;
    priority: string;
    category: string;
    routed_team: string;
    status: string;
  }>;
}

interface AuditLog {
  id: number;
  ticket_id: number | null;
  action: string;
  details: string;
  created_at: string;
}

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function priorityColor(priority: string) {
  if (priority === "High") {
    return "error";
  }

  if (priority === "Low") {
    return "success";
  }

  return "warning";
}

function Tickets() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [formError, setFormError] = useState("");

  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => (await api.get<Ticket[]>("/tickets/")).data,
  });

  const analyticsQuery = useQuery({
    queryKey: ["ticket-analytics"],
    queryFn: async () => (await api.get<TicketAnalytics>("/tickets/analytics")).data,
  });

  const managerQuery = useQuery({
    queryKey: ["ticket-manager"],
    queryFn: async () => (await api.get<ManagerDashboard>("/tickets/manager")).data,
  });

  const auditQuery = useQuery({
    queryKey: ["ticket-audit-log"],
    queryFn: async () => (await api.get<AuditLog[]>("/tickets/audit-log")).data,
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => (
      await api.post<Ticket>("/tickets/", {
        title: title.trim(),
        description: description.trim(),
        customer_email: customerEmail.trim() || null,
      })
    ).data,
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setCustomerEmail("");
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
      void queryClient.invalidateQueries({ queryKey: ["ticket-analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["ticket-manager"] });
      void queryClient.invalidateQueries({ queryKey: ["ticket-audit-log"] });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => (
      await api.patch<Ticket>(`/tickets/${id}`, { status })
    ).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
      void queryClient.invalidateQueries({ queryKey: ["ticket-analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["ticket-manager"] });
      void queryClient.invalidateQueries({ queryKey: ["ticket-audit-log"] });
    },
  });

  const tickets = ticketsQuery.data ?? [];
  const analytics = analyticsQuery.data;
  const manager = managerQuery.data;
  const auditLog = auditQuery.data ?? [];

  const readiness = useMemo(() => {
    if (!analytics?.total) {
      return 0;
    }

    return Math.round(((analytics.resolved + analytics.closed) / analytics.total) * 100);
  }, [analytics]);

  const handleCreateTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (title.trim().length < 3) {
      setFormError("Title must be at least 3 characters.");
      return;
    }

    if (description.trim().length < 10) {
      setFormError("Description must be at least 10 characters.");
      return;
    }

    createTicketMutation.mutate();
  };

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 2, md: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="secondary.dark">
              Ticket intelligence
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: 30, sm: 38 } }}>Operations queue</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
              Capture support requests, classify the issue, predict priority, route ownership, and give teams a ready-to-edit response.
            </Typography>
          </Box>
          <Grid container spacing={1.5} sx={{ width: { xs: "100%", lg: "auto" }, minWidth: { lg: 520 } }}>
            {[
              ["Total", analytics?.total ?? 0],
              ["High priority", analytics?.high_priority ?? 0],
              ["Unresolved", manager?.unresolved_count ?? 0],
              ["Resolved rate", `${readiness}%`],
            ].map(([label, value]) => (
              <Grid key={label} size={{ xs: 6 }}>
                <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: "rgba(11, 61, 145, 0.06)" }}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 850 }}>
                    {value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      {ticketsQuery.isError || analyticsQuery.isError || managerQuery.isError || auditQuery.isError ? (
        <Alert severity="error">Unable to load ticket operations data.</Alert>
      ) : null}

      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable" scrollButtons="auto">
        <Tab label="Ticket queue" />
        <Tab label="Analytics" />
        <Tab label="Manager dashboard" />
        <Tab label="Audit log" />
      </Tabs>

      {activeTab === 0 ? (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper component="form" onSubmit={handleCreateTicket} sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={{ xs: 2, sm: 2.5 }}>
                <Box>
                  <Typography variant="h6">Create ticket</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categorization, priority, routing, and response drafting run on submission.
                  </Typography>
                </Box>
                {formError ? <Alert severity="warning">{formError}</Alert> : null}
                {createTicketMutation.isError ? <Alert severity="error">Unable to create ticket.</Alert> : null}
                <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth required />
                <TextField label="Customer email" type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} fullWidth />
                <TextField
                  label="Issue description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  multiline
                  minRows={5}
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" disabled={createTicketMutation.isPending} size="large">
                  {createTicketMutation.isPending ? "Classifying..." : "Create and route"}
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={2}>
              {tickets.map((ticket) => (
                <Paper key={ticket.id} sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6">{ticket.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ticket.customer_email ?? "No customer email"} / {new Date(ticket.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip label={ticket.category} color="secondary" variant="outlined" />
                        <Chip label={ticket.priority} color={priorityColor(ticket.priority)} />
                        <Chip label={ticket.routed_team} variant="outlined" />
                      </Stack>
                    </Stack>
                    <Typography color="text.secondary">{ticket.description}</Typography>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(11, 61, 145, 0.06)" }}>
                      <Typography variant="subtitle2">Suggested response</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {ticket.suggested_response}
                      </Typography>
                    </Box>
                    <TextField
                      select
                      label="Status"
                      value={ticket.status}
                      onChange={(event) => updateTicketMutation.mutate({ id: ticket.id, status: event.target.value })}
                      sx={{ width: { xs: "100%", sm: 220 } }}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Paper>
              ))}
              {!tickets.length ? <Alert severity="info">No tickets yet. Create one to activate the queue.</Alert> : null}
            </Stack>
          </Grid>
        </Grid>
      ) : null}

      {activeTab === 1 ? (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="h6">Resolution health</Typography>
                <LinearProgress value={readiness} variant="determinate" sx={{ height: 10, borderRadius: 99 }} />
                <Typography variant="h4" color="primary.dark">
                  {readiness}%
                </Typography>
                <Typography color="text.secondary">Resolved or closed tickets across the current queue.</Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="h6">Category distribution</Typography>
                {Object.entries(analytics?.category_counts ?? {}).map(([category, count]) => (
                  <Stack key={category} direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography>{category}</Typography>
                    <Chip label={count} size="small" />
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {activeTab === 2 ? (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="h6">Routing load</Typography>
                {Object.entries(manager?.routing_load ?? {}).map(([team, count]) => (
                  <Stack key={team} direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography>{team}</Typography>
                    <Chip label={`${count} active`} size="small" color="primary" variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="h6">Attention queue</Typography>
                {manager?.attention_queue.map((ticket) => (
                  <Box key={ticket.id} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(157, 75, 60, 0.08)" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", gap: 1.5 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800 }}>{ticket.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ticket.category} / {ticket.routed_team}
                        </Typography>
                      </Box>
                      <Chip label={ticket.priority} color="error" sx={{ alignSelf: { xs: "flex-start", sm: "center" } }} />
                    </Stack>
                  </Box>
                ))}
                {!manager?.attention_queue.length ? <Alert severity="success">No high-priority open tickets.</Alert> : null}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {activeTab === 3 ? (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h6">Audit log</Typography>
            {auditLog.map((entry) => (
              <Box key={entry.id}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 800 }}>{entry.action}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(entry.created_at).toLocaleString()}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {entry.ticket_id ? `Ticket ${entry.ticket_id}: ` : ""}
                  {entry.details}
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
            {!auditLog.length ? <Alert severity="info">No audit activity yet.</Alert> : null}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default Tickets;



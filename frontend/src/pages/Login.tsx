import { useState } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BiBarChartAlt2,
  BiBrain,
  BiCheckShield,
  BiEnvelope,
  BiFile,
  BiGlobe,
  BiImage,
  BiMicrophone,
  BiSearch,
  BiSolidQuoteAltLeft,
} from "react-icons/bi";

import api from "../api/axios";
import EnterpriseBackground from "../components/EnterpriseBackground";
import type { AuthToken } from "../types/auth";

interface ApiError {
  detail?: string;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as AxiosError<ApiError>;

  return apiError.response?.data?.detail ?? fallback;
}

const pipelineSteps = [
  { label: "Upload", icon: BiFile },
  { label: "Embed", icon: BiBrain },
  { label: "Ask", icon: BiSearch },
  { label: "Cite", icon: BiSolidQuoteAltLeft },
];

const insightCards = [
  { label: "Contracts", top: "12%", left: "8%", delay: "0s" },
  { label: "Policies", top: "62%", left: "5%", delay: "1.8s" },
  { label: "Reports", top: "18%", left: "72%", delay: "0.9s" },
  { label: "SOPs", top: "68%", left: "72%", delay: "2.7s" },
];

const enterpriseBenefits = [
  {
    title: "Faster decisions",
    detail: "Find answers across policies, reports, SOPs, and contracts without searching folder by folder.",
    icon: BiSearch,
  },
  {
    title: "Trusted citations",
    detail: "Every response points back to source documents so teams can verify before acting.",
    icon: BiSolidQuoteAltLeft,
  },
  {
    title: "Protected knowledge",
    detail: "Private workspace access keeps sensitive institutional knowledge behind authentication.",
    icon: BiCheckShield,
  },
  {
    title: "Reusable intelligence",
    detail: "Uploaded knowledge becomes a searchable assistant instead of a static document archive.",
    icon: BiBrain,
  },
];

const enterpriseExtensions = [
  { label: "Microsoft Teams", detail: "Ask workspace questions from team channels.", icon: BiCheckShield },
  { label: "Slack bot", detail: "Bring cited answers into daily collaboration.", icon: BiSolidQuoteAltLeft },
  { label: "Email parser", detail: "Convert important inbox content into searchable knowledge.", icon: BiEnvelope },
  { label: "OCR images", detail: "Extract text from scanned docs, screenshots, and forms.", icon: BiImage },
  { label: "Voice assistant", detail: "Ask questions hands-free during operations and reviews.", icon: BiMicrophone },
  { label: "Multi-language", detail: "Support global teams across languages and regions.", icon: BiGlobe },
  { label: "Power BI", detail: "Surface knowledge and adoption metrics in executive dashboards.", icon: BiBarChartAlt2 },
  { label: "Usage analytics", detail: "Track search patterns, adoption, and high-value knowledge gaps.", icon: BiSearch },
];

const ragStoryText =
  "ChatGPT is excellent for general knowledge, but it doesn't know a company's internal documents, policies, APIs, or procedures. This application uses Retrieval-Augmented Generation to search the organization's own knowledge base and answer questions using only that trusted information. It also cites the exact documents it used, respects user permissions, and can integrate with internal systems like SharePoint, ServiceNow, or Jira. The result is an AI assistant that's tailored to the business rather than relying on general internet knowledge.";

const trustedKnowledgeLayers = ["Policies", "APIs", "Procedures"];

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<AuthToken>("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        overflowX: "hidden",
      }}
    >
      <EnterpriseBackground />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1240,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.18fr) minmax(360px, 0.82fr)" },
          gap: { xs: 3, md: 4 },
          alignItems: "stretch",
        }}
      >
        <Paper
          sx={{
            minHeight: { xs: "auto", md: 760 },
            p: { xs: 2.5, sm: 3.5, md: 4 },
            overflow: "hidden",
            bgcolor: "rgba(16, 27, 45, 0.9)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 26px 80px rgba(0, 0, 0, 0.26)",
          }}
        >
          <Stack spacing={2.25} sx={{ height: "100%" }}>
            <Box>
              <Typography variant="overline" color="secondary.dark">
                Lumora
              </Typography>
              <Typography variant="h4" sx={{ maxWidth: 560, fontWeight: 900, lineHeight: 1.08 }}>
                Illuminate Enterprise Knowledge.
              </Typography>
            </Box>

            <Box
              sx={{
                position: "relative",
                flex: "0 0 auto",
                minHeight: { xs: 300, sm: 330, md: 340 },
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid rgba(11, 61, 145, 0.14)",
                background:
                  "radial-gradient(circle at 50% 42%, rgba(11, 61, 145, 0.16), transparent 34%), linear-gradient(135deg, rgba(16, 27, 45, 0.96), rgba(15, 23, 42, 0.9))",
                "@keyframes loginFloat": {
                  "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: 0.84 },
                  "50%": { transform: "translate3d(0, -14px, 0) scale(1.03)", opacity: 1 },
                },
                "@keyframes loginOrbit": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
                "@keyframes loginPulse": {
                  "0%, 100%": { transform: "scale(1)", boxShadow: "0 18px 46px rgba(11, 61, 145, 0.2)" },
                  "50%": { transform: "scale(1.06)", boxShadow: "0 24px 70px rgba(1, 126, 132, 0.2)" },
                },
                "@keyframes loginFlow": {
                  "0%": { transform: "translateX(-18%)", opacity: 0 },
                  "18%, 72%": { opacity: 1 },
                  "100%": { transform: "translateX(118%)", opacity: 0 },
                },
                "@keyframes loginReveal": {
                  "0%, 28%, 100%": { transform: "translateY(16px) scale(0.92)", opacity: 0 },
                  "38%, 78%": { transform: "translateY(0) scale(1)", opacity: 1 },
                },
                "@keyframes ragTilt": {
                  "0%, 100%": { transform: "rotateX(58deg) rotateZ(-18deg) translateY(0)" },
                  "50%": { transform: "rotateX(58deg) rotateZ(-18deg) translateY(-8px)" },
                },
                "@keyframes ragBeam": {
                  "0%": { transform: "translateX(-18%) scaleX(0.35)", opacity: 0 },
                  "20%, 72%": { opacity: 1 },
                  "100%": { transform: "translateX(96%) scaleX(1)", opacity: 0 },
                },
                "@keyframes ragStack": {
                  "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
                  "50%": { transform: "translateY(-6px) rotate(2deg)" },
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 16, sm: 28 },
                  top: { xs: 18, sm: 28 },
                  width: { xs: 118, sm: 150 },
                  height: { xs: 92, sm: 112 },
                  borderRadius: 3,
                  p: 1.4,
                  color: "#ffffff",
                  background: "linear-gradient(145deg, rgba(31, 41, 55, 0.92), rgba(75, 85, 99, 0.88))",
                  boxShadow: "18px 22px 42px rgba(0, 0, 0, 0.32)",
                  transformStyle: "preserve-3d",
                  animation: "ragTilt 6s ease-in-out infinite",
                }}
              >
                <Typography variant="caption" sx={{ display: "block", fontWeight: 900, color: "inherit" }}>
                  General AI
                </Typography>
                <Typography variant="caption" sx={{ display: "block", mt: 0.8, color: "rgba(255,255,255,0.72)", lineHeight: 1.25 }}>
                  Broad knowledge, no internal source access
                </Typography>
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  right: { xs: 14, sm: 30 },
                  top: { xs: 20, sm: 30 },
                  width: { xs: 126, sm: 160 },
                  transformStyle: "preserve-3d",
                  animation: "ragStack 5.5s ease-in-out infinite",
                }}
              >
                {trustedKnowledgeLayers.map((layer, index) => (
                  <Box
                    key={layer}
                    sx={{
                      position: index === 0 ? "relative" : "absolute",
                      inset: index === 0 ? "auto" : `${index * 12}px ${index * 10}px auto auto`,
                      width: "100%",
                      p: 1.2,
                      borderRadius: 2,
                      color: "#ffffff",
                      bgcolor: index === 0 ? "primary.dark" : index === 1 ? "primary.main" : "secondary.dark",
                      boxShadow: "12px 18px 36px rgba(11, 61, 145, 0.16)",
                      transform: `translateZ(${index * 18}px) rotateX(4deg)`,
                    }}
                  >
                    <Typography variant="caption" sx={{ display: "block", fontWeight: 900, color: "inherit" }}>
                      {layer}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  left: "22%",
                  right: "22%",
                  top: "30%",
                  height: 4,
                  borderRadius: 999,
                  overflow: "hidden",
                  bgcolor: "rgba(11, 61, 145, 0.08)",
                  "&::before, &::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background: "linear-gradient(90deg, transparent, rgba(1,126,132,0.95), rgba(11,61,145,0.95), transparent)",
                    animation: "ragBeam 3.8s ease-in-out infinite",
                  },
                  "&::after": {
                    animationDelay: "1.7s",
                  },
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  inset: "14%",
                  border: "1px solid rgba(11, 61, 145, 0.18)",
                  borderRadius: "50%",
                  animation: "loginOrbit 26s linear infinite",
                  "&::before, &::after": {
                    content: '""',
                    position: "absolute",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "secondary.main",
                    boxShadow: "0 0 0 8px rgba(1, 126, 132, 0.1)",
                  },
                  "&::before": { top: "7%", left: "48%" },
                  "&::after": { bottom: "8%", right: "17%", bgcolor: "primary.main" },
                }}
              />

              {insightCards.map((card) => (
                <Paper
                  key={card.label}
                  sx={{
                    position: "absolute",
                    top: card.top,
                    left: card.left,
                    width: { xs: 112, sm: 132 },
                    p: 1.4,
                    bgcolor: "rgba(16, 27, 45, 0.9)",
                    boxShadow: "0 16px 38px rgba(0, 0, 0, 0.26)",
                    animation: `loginReveal 7s ease-in-out ${card.delay} infinite`,
                  }}
                >
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BiFile color="#0b3d91" size={18} />
                      <Typography variant="caption" sx={{ fontWeight: 850, color: "text.primary" }}>
                        {card.label}
                      </Typography>
                    </Box>
                    <Box sx={{ width: "100%", height: 5, borderRadius: 999, bgcolor: "rgba(11, 61, 145, 0.14)" }} />
                    <Box sx={{ width: "72%", height: 5, borderRadius: 999, bgcolor: "rgba(1, 126, 132, 0.2)" }} />
                  </Stack>
                </Paper>
              ))}

              <Box
                sx={{
                  position: "absolute",
                  left: "8%",
                  right: "8%",
                  top: "47%",
                  height: 3,
                  borderRadius: 999,
                  bgcolor: "rgba(11, 61, 145, 0.14)",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    width: "34%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, transparent, #017E84, #0b3d91)",
                    animation: "loginFlow 4s ease-in-out infinite",
                  },
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: { xs: 148, sm: 178 },
                  height: { xs: 148, sm: 178 },
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  color: "#ffffff",
                  background:
                    "linear-gradient(145deg, rgba(11, 61, 145, 0.98), rgba(6, 43, 99, 0.96))",
                  animation: "loginPulse 4.5s ease-in-out infinite",
                }}
              >
                <Stack spacing={0.5} sx={{ alignItems: "center", textAlign: "center" }}>
                  <BiBrain size={42} />
                  <Typography variant="button" sx={{ color: "inherit", lineHeight: 1.1 }}>
                    AI Answer
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.78)" }}>
                    with sources
                  </Typography>
                </Stack>
              </Box>

              <Paper
                sx={{
                  position: "absolute",
                  left: { xs: "10%", sm: "14%" },
                  right: { xs: "10%", sm: "14%" },
                  bottom: { xs: 22, sm: 28 },
                  p: 1.5,
                  bgcolor: "rgba(31, 41, 55, 0.9)",
                  color: "#ffffff",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
                  animation: "loginFloat 5.5s ease-in-out infinite",
                }}
              >
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BiCheckShield color="#2aa5aa" size={18} />
                    <Typography variant="caption" sx={{ fontWeight: 850, color: "inherit" }}>
                      Verified response
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "rgba(16, 27, 45, 0.82)" }}>
                    Answers stay connected to the documents they came from.
                  </Typography>
                </Stack>
              </Paper>
            </Box>

            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                bgcolor: "rgba(11, 61, 145, 0.045)",
                border: "1px solid rgba(11, 61, 145, 0.12)",
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip label="RAG" color="primary" size="small" />
                  <Chip label="Trusted sources" color="secondary" variant="outlined" size="small" />
                  <Chip label="Permissions aware" variant="outlined" size="small" />
                </Stack>
                <Typography sx={{ color: "text.primary", lineHeight: 1.65 }}>
                  {ragStoryText}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.25 }}>
              {enterpriseBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <Box
                    key={benefit.title}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "34px 1fr",
                      gap: 1.25,
                      p: 1.5,
                      minHeight: 112,
                      borderRadius: 2,
                      bgcolor: "rgba(11, 61, 145, 0.06)",
                      border: "1px solid rgba(11, 61, 145, 0.1)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: "grid",
                        placeItems: "center",
                        color: "#ffffff",
                        bgcolor: benefit.title === "Trusted citations" ? "secondary.dark" : "primary.dark",
                      }}
                    >
                      <Icon size={18} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 850, lineHeight: 1.2 }}>
                        {benefit.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.4, lineHeight: 1.45 }}>
                        {benefit.detail}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(148, 163, 184, 0.06)",
                border: "1px solid rgba(11, 61, 145, 0.12)",
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="overline" color="secondary.dark">
                      Enterprise extensions
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 850, lineHeight: 1.25 }}>
                      Built to grow with your operating stack.
                    </Typography>
                  </Box>
                  <Chip
                    label="Roadmap"
                    size="small"
                    sx={{
                      bgcolor: "rgba(1, 126, 132, 0.1)",
                      color: "secondary.dark",
                      border: "1px solid rgba(1, 126, 132, 0.18)",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                    gap: 1,
                  }}
                >
                  {enterpriseExtensions.map((extension) => {
                    const Icon = extension.icon;

                    return (
                      <Box
                        key={extension.label}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "30px 1fr",
                          gap: 1,
                          p: 1.2,
                          minHeight: 78,
                          borderRadius: 1.5,
                          bgcolor: "rgba(16, 27, 45, 0.82)",
                          border: "1px solid rgba(11, 61, 145, 0.08)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: 1.25,
                            display: "grid",
                            placeItems: "center",
                            color: "primary.dark",
                            bgcolor: "rgba(11, 61, 145, 0.1)",
                          }}
                        >
                          <Icon size={16} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ display: "block", fontWeight: 850, color: "text.primary" }}>
                            {extension.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35 }}>
                            {extension.detail}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Stack>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {pipelineSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <Chip
                    key={step.label}
                    icon={<Icon size={17} />}
                    label={step.label}
                    sx={{
                      bgcolor: "rgba(11, 61, 145, 0.1)",
                      color: "primary.dark",
                      border: "1px solid rgba(11, 61, 145, 0.14)",
                      "& .MuiChip-icon": { color: "secondary.dark" },
                    }}
                  />
                );
              })}
            </Box>
          </Stack>
        </Paper>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            alignSelf: { xs: "stretch", md: "start" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            p: { xs: 3, sm: 4 },
            bgcolor: "rgba(16, 27, 45, 0.96)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.26)",
          }}
        >
          <Stack spacing={3} sx={{ width: "100%", maxWidth: 430, mx: "auto" }}>
            <Box>
              <Typography variant="overline" color="secondary.dark">
                Secure workspace
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 850 }}>
                Sign in
              </Typography>
              <Typography color="text.secondary">
                Continue to Lumora, your trusted enterprise knowledge hub.
              </Typography>
            </Box>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <Typography variant="body2">
              Need an account?{" "}
              <Link component={RouterLink} to="/register">
                Register
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default Login;




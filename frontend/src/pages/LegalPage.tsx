import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import EnterpriseBackground from "../components/EnterpriseBackground";
import LegalFooter from "../components/LegalFooter";

const sections = {
  privacy: {
    title: "Privacy Notice",
    updated: "Last updated: July 13, 2026",
    intro:
      "Lumora is a beta enterprise knowledge assistant. This notice explains the basic data practices users should understand while evaluating the product.",
    items: [
      {
        heading: "Information processed",
        body:
          "Lumora may process account details, uploaded documents, pasted text, chat prompts, generated answers, citations, tickets, usage activity, and authentication data needed to operate the workspace.",
      },
      {
        heading: "How information is used",
        body:
          "Information is used to authenticate users, store and retrieve enterprise knowledge, generate cited answers, improve product reliability, protect the service, and support workspace administration.",
      },
      {
        heading: "Third-party services",
        body:
          "The application may use infrastructure, database, authentication, analytics, and AI service providers to deliver the product. OAuth sign-in providers only receive the information required to complete authentication.",
      },
      {
        heading: "Beta access",
        body:
          "Beta functionality may change. Users should avoid uploading highly sensitive regulated data unless their organization has approved the deployment, data handling, and provider configuration.",
      },
      {
        heading: "Account deletion",
        body:
          "Users can request account deletion from the dashboard. Deletion removes the profile and user-owned workspace records from the active application database.",
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    updated: "Last updated: July 13, 2026",
    intro:
      "These beta terms outline acceptable use for Lumora while the product is being evaluated.",
    items: [
      {
        heading: "Beta service",
        body:
          "Lumora is provided as a beta product for evaluation. Features, limits, integrations, and availability may change as the application evolves.",
      },
      {
        heading: "User responsibility",
        body:
          "Users are responsible for uploading only information they are authorized to use and for verifying AI-generated answers against cited source documents before relying on them.",
      },
      {
        heading: "No professional advice",
        body:
          "Generated answers are informational and should not be treated as legal, financial, medical, security, or compliance advice.",
      },
      {
        heading: "Acceptable use",
        body:
          "Users may not misuse the service, attempt unauthorized access, upload malicious content, bypass security controls, or use the product in a way that violates applicable law or organizational policy.",
      },
      {
        heading: "Ownership",
        body:
          "Lumora and its interface, branding, software, and product design are protected intellectual property. Users retain responsibility for the documents and content they submit.",
      },
    ],
  },
};

interface LegalPageProps {
  type: keyof typeof sections;
}

function LegalPage({ type }: LegalPageProps) {
  const content = sections[type];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <EnterpriseBackground />
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, py: { xs: 4, md: 7 }, flex: 1 }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, bgcolor: "rgba(0, 0, 0, 0.92)" }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" color="secondary.dark">
                Lumora legal
              </Typography>
              <Typography variant="h3" sx={{ mt: 0.5 }}>
                {content.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {content.updated}
              </Typography>
              <Typography sx={{ mt: 2, color: "text.secondary", lineHeight: 1.7 }}>
                {content.intro}
              </Typography>
            </Box>
            {content.items.map((item) => (
              <Box key={item.heading}>
                <Typography variant="h6">{item.heading}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.7 }}>
                  {item.body}
                </Typography>
              </Box>
            ))}
            <Typography variant="body2" color="text.secondary">
              This page is starter product copy and should be reviewed by qualified counsel before production commercial use.
            </Typography>
            <Button component={RouterLink} to="/" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Back to sign in
            </Button>
          </Stack>
        </Paper>
      </Container>
      <LegalFooter />
    </Box>
  );
}

export default LegalPage;

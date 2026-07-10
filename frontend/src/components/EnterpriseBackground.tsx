import { Box, Stack, Typography } from "@mui/material";

const logoTiles = [
  { initials: "AC", name: "Acacia Cloud", mark: "leaf", x: "7%", y: "12%", delay: "0s", size: "large" },
  { initials: "MR", name: "Meridian Risk", mark: "axis", x: "34%", y: "9%", delay: "4.5s", size: "small" },
  { initials: "NV", name: "Northvale", mark: "ridge", x: "68%", y: "14%", delay: "8s", size: "large" },
  { initials: "OL", name: "Olivine Labs", mark: "orbit", x: "84%", y: "36%", delay: "1.8s", size: "small" },
  { initials: "TH", name: "TerraHold", mark: "stack", x: "13%", y: "52%", delay: "7s", size: "small" },
  { initials: "SC", name: "SageCore", mark: "core", x: "43%", y: "44%", delay: "2.8s", size: "large" },
  { initials: "BR", name: "Briar Systems", mark: "branch", x: "69%", y: "67%", delay: "10s", size: "small" },
  { initials: "VT", name: "Verdant Trust", mark: "shield", x: "22%", y: "78%", delay: "12.4s", size: "large" },
  { initials: "AC", name: "Acacia Cloud", mark: "leaf", x: "53%", y: "84%", delay: "14s", size: "small" },
  { initials: "MR", name: "Meridian Risk", mark: "axis", x: "88%", y: "76%", delay: "16.5s", size: "large" },
  { initials: "NV", name: "Northvale", mark: "ridge", x: "4%", y: "31%", delay: "18.4s", size: "small" },
  { initials: "OL", name: "Olivine Labs", mark: "orbit", x: "52%", y: "24%", delay: "20s", size: "small" },
];

interface LogoMarkProps {
  mark: string;
  compact?: boolean;
}

function LogoMark({ mark, compact = false }: LogoMarkProps) {
  const size = compact ? 30 : 38;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: mark === "shield" ? "14px 14px 18px 18px" : 1.5,
        bgcolor: "rgba(11, 61, 145, 0.12)",
        border: "1px solid rgba(11, 61, 145, 0.18)",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: mark === "orbit" ? "9px" : mark === "stack" ? "8px 7px" : "8px",
          borderRadius:
            mark === "leaf"
              ? "80% 20% 80% 20%"
              : mark === "ridge"
                ? "2px"
                : mark === "axis"
                  ? "50%"
                  : mark === "shield"
                    ? "10px 10px 14px 14px"
                    : 99,
          bgcolor:
            mark === "branch" || mark === "axis"
              ? "transparent"
              : mark === "orbit"
                ? "rgba(1, 126, 132, 0.36)"
                : "rgba(11, 61, 145, 0.62)",
          border:
            mark === "orbit"
              ? "2px solid rgba(1, 126, 132, 0.72)"
              : mark === "axis"
                ? "2px solid rgba(11, 61, 145, 0.66)"
                : mark === "branch"
                  ? "0"
                  : "none",
          transform:
            mark === "leaf"
              ? "rotate(-28deg)"
              : mark === "ridge"
                ? "skewX(-22deg)"
                : "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: mark === "branch" ? "8px" : mark === "axis" ? "17px" : "11px",
          top: mark === "branch" ? "9px" : mark === "axis" ? "7px" : "18px",
          width: mark === "stack" ? 22 : mark === "branch" ? 22 : mark === "ridge" ? 20 : 14,
          height: mark === "stack" ? 4 : mark === "branch" ? 3 : mark === "ridge" ? 3 : 12,
          borderRadius: 99,
          bgcolor: "rgba(1, 126, 132, 0.72)",
          boxShadow:
            mark === "stack"
              ? "0 7px 0 rgba(1, 126, 132, 0.42), 0 -7px 0 rgba(11, 61, 145, 0.42)"
              : mark === "branch"
                ? "8px 8px 0 rgba(11, 61, 145, 0.42), 15px -2px 0 rgba(1, 126, 132, 0.42)"
                : mark === "ridge"
                  ? "8px -8px 0 rgba(11, 61, 145, 0.42)"
                  : "none",
          transform:
            mark === "axis"
              ? "rotate(42deg)"
              : mark === "branch"
                ? "rotate(-34deg)"
                : mark === "ridge"
                  ? "rotate(-28deg)"
                  : "none",
        },
      }}
    />
  );
}

function EnterpriseBackground() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        bgcolor: "background.default",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "-20%",
          background:
            "radial-gradient(circle at 18% 24%, rgba(47, 111, 214, 0.26), transparent 28%), radial-gradient(circle at 76% 18%, rgba(1, 126, 132, 0.2), transparent 24%), radial-gradient(circle at 62% 82%, rgba(99, 102, 241, 0.14), transparent 30%)",
          animation: "workspaceDrift 28s ease-in-out infinite alternate",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(120deg, rgba(96, 165, 250, 0.12) 1px, transparent 1px), linear-gradient(30deg, rgba(45, 212, 191, 0.1) 1px, transparent 1px)",
          backgroundSize: "92px 92px",
          animation: "workspaceSlide 36s linear infinite",
        },
        "@keyframes workspaceDrift": {
          "0%": { transform: "translate3d(-2%, -1%, 0) scale(1)" },
          "100%": { transform: "translate3d(2%, 1%, 0) scale(1.05)" },
        },
        "@keyframes workspaceSlide": {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "184px 92px, -92px 184px" },
        },
        "@keyframes logoPop": {
          "0%": {
            opacity: 0,
            transform: "translate3d(-50%, -50%, 0) scale(0.72)",
            filter: "blur(8px)",
          },
          "10%": {
            opacity: 0.62,
            transform: "translate3d(-50%, -50%, 0) scale(1.04)",
            filter: "blur(0)",
          },
          "24%": {
            opacity: 0.5,
            transform: "translate3d(-50%, -50%, 0) scale(1)",
          },
          "38%": {
            opacity: 0,
            transform: "translate3d(-50%, -50%, 0) scale(0.88)",
            filter: "blur(5px)",
          },
          "100%": {
            opacity: 0,
            transform: "translate3d(-50%, -50%, 0) scale(0.88)",
          },
        },
        "@keyframes markPulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
      }}
    >
      {logoTiles.map((tile, index) => {
        const isLarge = tile.size === "large";

        return (
          <Box
            key={`${tile.name}-${tile.x}-${tile.y}`}
            sx={{
              position: "absolute",
              left: tile.x,
              top: tile.y,
              minWidth: isLarge ? 220 : 168,
              p: isLarge ? 1.75 : 1.25,
              borderRadius: 2.5,
              bgcolor: isLarge ? "rgba(0, 0, 0, 0.72)" : "rgba(0, 0, 0, 0.58)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.24)",
              backdropFilter: "blur(10px)",
              opacity: 0,
              animation: `logoPop ${isLarge ? "24s" : "22s"} ease-in-out infinite`,
              animationDelay: tile.delay,
              zIndex: index % 3,
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Box sx={{ animation: "markPulse 4s ease-in-out infinite" }}>
                <LogoMark mark={tile.mark} compact={!isLarge} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant={isLarge ? "body1" : "body2"}
                  sx={{ fontWeight: 850, color: "text.primary" }}
                  noWrap
                >
                  {tile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tile.initials} Enterprise
                </Typography>
              </Box>
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}

export default EnterpriseBackground;




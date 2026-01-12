import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Category,
  MedicalServices,
  Layers,
  VolunteerActivism,
  Description,
  ArrowForward,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useGetOperations } from "../../api/operations/hooks";
import { useGetMaterials } from "../../api/materials/hooks";
import { useGetCategories } from "../../api/categories/hooks";
import { useGetProcedures } from "../../api/procedures/hooks";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch data for statistics
  const { data: operationsResponse, isLoading: isLoadingOperations } =
    useGetOperations({
      page: 1,
      limit: 100,
    });
  const { data: materialsResponse, isLoading: isLoadingMaterials } =
    useGetMaterials({ page: 1, limit: 100 });
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetCategories({
      page: 1,
      limit: 100,
    });
  const { data: proceduresResponse, isLoading: isLoadingProcedures } =
    useGetProcedures({
      page: 1,
      limit: 100,
    });

  // Cast responses to get counts
  const operationsCount = (operationsResponse as any)?.data?.length || 0;
  const materialsCount = (materialsResponse as any)?.data?.length || 0;
  const categoriesCount = (categoriesResponse as any)?.data?.length || 0;
  const proceduresCount = (proceduresResponse as any)?.data?.length || 0;

  const adminModules = [
    {
      title: "Kategorien",
      description: "Verwalten Sie Kategorien für zahnärztliche Vorgänge",
      icon: <Category sx={{ fontSize: 32 }} />,
      path: "/admin/categories",
      color: "#9c27b0",
      bgColor: "#f3e5f5",
      count: categoriesCount,
      isLoading: isLoadingCategories,
    },
    {
      title: "Vorgänge",
      description: "Verwalten Sie zahnärztliche Vorgänge und Eingriffe",
      icon: <MedicalServices sx={{ fontSize: 32 }} />,
      path: "/admin/operations",
      color: "#1976d2",
      bgColor: "#e3f2fd",
      count: operationsCount,
      isLoading: isLoadingOperations,
    },
    {
      title: "Materialien",
      description:
        "Verwalten Sie zahnärztliche Materialien in Vorgänge benutzen",
      icon: <Layers sx={{ fontSize: 32 }} />,
      path: "/admin/materials",
      color: "#388e3c",
      bgColor: "#e8f5e9",
      count: materialsCount,
      isLoading: isLoadingMaterials,
    },
    {
      title: "Leistungen",
      description: "Verwalten Sie Leistungsoptionen",
      icon: <VolunteerActivism sx={{ fontSize: 32 }} />,
      path: "/admin/procedures",
      color: "#f57c00",
      bgColor: "#fff3e0",
      count: proceduresCount,
      isLoading: isLoadingProcedures,
    },
    {
      title: "Laborzettel-Vorlagen",
      description: "Verwalten Sie Laborzettel-Vorlagen und Konfigurationen",
      icon: <Description sx={{ fontSize: 32 }} />,
      path: "/admin/laborzettel",
      color: "#00796b",
      bgColor: "#e0f2f1",
      count: "-",
      isLoading: false,
    },
  ];

  return (
    <Stack flex="1" gap="20px" sx={{ overflow: "hidden", minWidth: 0 }}>
      {/* Header Section */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              width: 48,
              height: 48,
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              Admin-Bereich
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(146, 146, 146, 1)", fontWeight: 400 }}
            >
              Systemverwaltung und Konfiguration
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Management Modules List */}
      <Stack
        sx={{
          flex: 1,
          overflow: "auto",
          gap: { xs: 2, sm: 2 },
        }}
      >
        {adminModules.map((module) => (
          <Card
            key={module.path}
            onClick={isMobile ? () => navigate(module.path) : undefined}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              p: { xs: 2, sm: 2.5 },
              cursor: { xs: "pointer", sm: "default" },
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px -6px rgba(0, 0, 0, 0.12)",
                "& .module-icon": {
                  transform: "scale(1.05)",
                },
                "& .arrow-icon": {
                  transform: "translateX(4px)",
                },
              },
              "&:active": {
                transform: { xs: "scale(0.98)", sm: "translateY(-2px)" },
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "4px",
                background: `linear-gradient(180deg, ${module.color} 0%, ${module.color}80 100%)`,
              },
            }}
          >
            {/* Left: Icon with Count (count moves to right on mobile) */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 1.5, sm: 2 }}
              sx={{ minWidth: { xs: "auto", sm: 140 } }}
            >
              <Avatar
                className="module-icon"
                sx={{
                  bgcolor: module.bgColor,
                  color: module.color,
                  width: { xs: 44, sm: 52 },
                  height: { xs: 44, sm: 52 },
                  transition: "all 0.3s ease",
                }}
              >
                {module.icon}
              </Avatar>
              {/* Count - hidden on mobile, shown on desktop */}
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                {module.isLoading ? (
                  <CircularProgress size={24} sx={{ color: module.color }} />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: module.color,
                      fontSize: "1.5rem",
                      lineHeight: 1,
                    }}
                  >
                    {module.count}
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* Center: Title and Description */}
            <Box sx={{ flex: 1, mx: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#1e293b",
                  mb: 0.25,
                  fontSize: { xs: "1.1rem", sm: "1.1rem" },
                }}
              >
                {module.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  lineHeight: 1.4,
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                {module.description}
              </Typography>
            </Box>

            {/* Count on right - mobile only */}
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              {module.isLoading ? (
                <CircularProgress size={20} sx={{ color: module.color }} />
              ) : (
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: module.color,
                    fontSize: "1.25rem",
                    lineHeight: 1,
                  }}
                >
                  {module.count}
                </Typography>
              )}
            </Box>

            {/* Right: Button - hidden on mobile */}
            {!isMobile && (
              <Button
                variant="contained"
                onClick={() => navigate(module.path)}
                endIcon={
                  <ArrowForward
                    className="arrow-icon"
                    sx={{
                      transition: "transform 0.3s ease",
                      fontSize: 18,
                    }}
                  />
                }
                sx={{
                  color: "white",
                  background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}dd 100%)`,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.25,
                  px: 3,
                  fontSize: "0.9rem",
                  boxShadow: `0 4px 12px ${module.color}40`,
                  whiteSpace: "nowrap",
                  minWidth: 130,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${module.color}dd 0%, ${module.color} 100%)`,
                    boxShadow: `0 6px 16px ${module.color}50`,
                  },
                }}
              >
                Verwalten
              </Button>
            )}
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

export default AdminDashboard;

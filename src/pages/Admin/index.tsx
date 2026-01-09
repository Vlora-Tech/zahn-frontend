import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Build,
  Palette,
  Assessment,
  ArrowForward,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useGetOperations } from "../../api/operations/hooks";
import { useGetMaterials } from "../../api/materials/hooks";
import { useGetCategories } from "../../api/categories/hooks";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch data for statistics
  const { data: operationsResponse } = useGetOperations({
    page: 1,
    limit: 100,
  });
  const { data: materialsResponse } = useGetMaterials({ page: 1, limit: 100 });
  const { data: categoriesResponse } = useGetCategories({
    page: 1,
    limit: 100,
  });

  // Cast responses to get counts
  const operationsCount = (operationsResponse as any)?.data?.length || 0;
  const materialsCount = (materialsResponse as any)?.data?.length || 0;
  const categoriesCount = (categoriesResponse as any)?.data?.length || 0;

  const adminModules = [
    {
      title: "Categories Management",
      description: "Manage dental procedure categories",
      icon: <Build sx={{ fontSize: 32 }} />,
      path: "/admin/categories",
      color: "#9c27b0",
      bgColor: "#f3e5f5",
      count: categoriesCount,
      subtitle: "Procedure Categories",
    },
    {
      title: "Operations Management",
      description: "Manage dental operations and procedures",
      icon: <Build sx={{ fontSize: 32 }} />,
      path: "/admin/operations",
      color: "#1976d2",
      bgColor: "#e3f2fd",
      count: operationsCount,
      subtitle: "Active Operations",
    },
    {
      title: "Materials Management",
      description: "Manage dental materials and supplies",
      icon: <Palette sx={{ fontSize: 32 }} />,
      path: "/admin/materials",
      color: "#388e3c",
      bgColor: "#e8f5e9",
      count: materialsCount,
      subtitle: "Available Materials",
    },
  ];

  return (
    <Box sx={{ p: 3, height: "100vh" }}>
      <Stack spacing={4}>
        {/* Header Section */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                width: 56,
                height: 56,
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "2.5rem",
                }}
              >
                Admin Dashboard
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#64748b",
                  fontWeight: 400,
                }}
              >
                Manage your dental practice system
              </Typography>
            </Box>
          </Stack>
        </Box>
        {/* Management Modules */}
        <Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {adminModules.map((module) => (
              <Box
                key={module.path}
                sx={{ flex: "1 1 300px", minWidth: "300px" }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      "& .module-icon": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                      "& .arrow-icon": {
                        transform: "translateX(4px)",
                      },
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: `linear-gradient(90deg, ${module.color} 0%, ${module.color}80 100%)`,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Stack spacing={3}>
                      {/* Icon and Count */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Avatar
                          className="module-icon"
                          sx={{
                            bgcolor: module.bgColor,
                            color: module.color,
                            width: 64,
                            height: 64,
                            transition: "all 0.3s ease",
                          }}
                        >
                          {module.icon}
                        </Avatar>
                        <Box textAlign="right">
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: module.color,
                            }}
                          >
                            {module.count}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            {module.subtitle}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Title and Description */}
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#1e293b",
                            mb: 1,
                          }}
                        >
                          {module.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            lineHeight: 1.6,
                          }}
                        >
                          {module.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 2 }}>
                    <Button
                      fullWidth
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
                        background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}dd 100%)`,
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1.5,
                        fontSize: "1rem",
                        boxShadow: `0 4px 12px ${module.color}40`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${module.color}dd 0%, ${module.color} 100%)`,
                          boxShadow: `0 8px 24px ${module.color}60`,
                        },
                      }}
                    >
                      Manage
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* System Status */}
        <Paper
          sx={{
            p: 4,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                System Status
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                All systems are running smoothly
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  100%
                </Typography>
                <Typography variant="caption">Uptime</Typography>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
              />
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  <Assessment />
                </Typography>
                <Typography variant="caption">Monitoring</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default AdminDashboard;

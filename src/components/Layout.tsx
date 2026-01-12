import * as React from "react";
import {
  styled,
  type CSSObject,
  type Theme,
  useTheme,
} from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import logo from "../assets/logo.svg";
import headerLogo from "../assets/zahn-care-logo-wide.png";
import {
  Divider,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Warehouse, MedicalInformation, Assignment } from "@mui/icons-material";
import SvgIcon from "./SvgIcon";
import LabTechnicianIcon from "./LabTechnicianIcon";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNavigation from "./BottomNavigation";
import ResponsiveDrawer, { HamburgerButton } from "./ResponsiveDrawer";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `85px`,
  [theme.breakpoints.up("sm")]: {
    width: `85px`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: "25px",
  paddingBottom: "40px",
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600-960px
  const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // > 960px

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = location.pathname === "/login";

  const [now, setNow] = React.useState(new Date());

  // Close drawer on route change
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);

  const formattedDateShort = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(now);

  const formattedTime = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 0, md: "5px" },
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* Desktop Sidebar - only show on desktop */}
      {isDesktop && (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            "& > .MuiDrawer-paper": {
              background: "transparent",
              borderRight: "none",
              maxHeight: "max-content",
            },
          }}
        >
          <DrawerHeader>
            <img src={logo} style={{ height: "50px", width: "50px" }} />
          </DrawerHeader>
          {!isAuthRoute && (
            <List sx={{ flex: 1 }}>
              {[
                {
                  icon: "patient",
                  link: "/patients",
                  roles: ["superadmin", "doctor", "nurse"],
                },
                {
                  icon: "request",
                  link: "/requests",
                  roles: ["superadmin", "doctor", "nurse"],
                },
                {
                  icon: "lab",
                  link: "/lab/queue",
                  activePrefix: "/lab/",
                  roles: ["superadmin", "lab_technician"],
                },
                {
                  icon: "laborzettel",
                  link: "/laborzettel",
                  activePrefix: "/laborzettel",
                  roles: ["superadmin", "lab_technician"],
                },
                {
                  icon: "inventory",
                  link: "/inventory/materials",
                  activePrefix: "/inventory",
                  roles: ["superadmin", "lab_technician"],
                },
                { icon: "clinic", link: "/clinics", roles: ["superadmin"] },
                { icon: "doctor", link: "/doctors", roles: ["superadmin"] },
                { icon: "nurse", link: "/nurses", roles: ["superadmin"] },
                {
                  icon: "lab-technician",
                  link: "/lab-technicians",
                  activePrefix: "/lab-technicians",
                  roles: ["superadmin"],
                },
                { icon: "settings", link: "/admin", roles: ["superadmin"] },
              ].map(({ icon, link, roles, activePrefix }) => {
                const activePath = activePrefix || link;
                const isActive = location?.pathname.startsWith(activePath);

                return (
                  roles.includes(user?.role || "") && (
                    <ListItem
                      key={link}
                      disablePadding
                      sx={{
                        display: "block",
                        borderRadius: "0 10px 10px 0",
                        overflow: "hidden",
                        flex: 1,
                        ...(isActive
                          ? { background: "rgba(244, 244, 244, 0.92)" }
                          : {}),
                      }}
                    >
                      <ListItemButton
                        component="a"
                        href={link}
                        sx={[
                          { minHeight: 80, px: 2.5 },
                          open
                            ? { justifyContent: "initial" }
                            : { justifyContent: "center" },
                        ]}
                        onClick={(e: React.MouseEvent) => {
                          if (e.button === 1 || e.ctrlKey || e.metaKey) return;
                          e.preventDefault();
                          navigate(link);
                        }}
                      >
                        <ListItemIcon
                          sx={[
                            {
                              minWidth: 0,
                              justifyContent: "center",
                              color: isActive
                                ? "rgba(135, 193, 51, 1)"
                                : "#fff",
                            },
                          ]}
                        >
                          {icon === "lab-technician" ? (
                            <LabTechnicianIcon
                              width="32px"
                              height="32px"
                              color={
                                isActive
                                  ? "rgba(135, 193, 51, 1)"
                                  : "rgba(244, 244, 244, 1)"
                              }
                            />
                          ) : icon === "inventory" ? (
                            <Warehouse
                              sx={{
                                width: "32px",
                                height: "32px",
                                color: isActive
                                  ? "rgba(135, 193, 51, 1)"
                                  : "rgba(244, 244, 244, 1)",
                              }}
                            />
                          ) : icon === "laborzettel" ? (
                            <Assignment
                              sx={{
                                width: "32px",
                                height: "32px",
                                color: isActive
                                  ? "rgba(135, 193, 51, 1)"
                                  : "rgba(244, 244, 244, 1)",
                              }}
                            />
                          ) : icon === "request" ? (
                            <MedicalInformation
                              sx={{
                                width: "32px",
                                height: "32px",
                                color: isActive
                                  ? "rgba(135, 193, 51, 1)"
                                  : "rgba(244, 244, 244, 1)",
                              }}
                            />
                          ) : (
                            <SvgIcon
                              icon={icon}
                              width="32px"
                              height="32px"
                              color={
                                isActive
                                  ? "rgba(135, 193, 51, 1)"
                                  : "rgba(244, 244, 244, 1)"
                              }
                            />
                          )}
                        </ListItemIcon>
                      </ListItemButton>
                    </ListItem>
                  )
                );
              })}
            </List>
          )}

          {!isAuthRoute && (
            <List sx={{ pb: "46px" }}>
              {[{ icon: "logout", link: "/login" }].map(({ icon, link }) => (
                <ListItem
                  key={link}
                  disablePadding
                  sx={{
                    display: "block",
                    borderRadius: "0 10px 10px 0",
                    overflow: "hidden",
                    ...(location?.pathname.startsWith(link)
                      ? { background: "rgba(244, 244, 244, 0.92)" }
                      : {}),
                  }}
                >
                  <ListItemButton
                    component="a"
                    href={link}
                    sx={[
                      { minHeight: 80, px: 2.5 },
                      open
                        ? { justifyContent: "initial" }
                        : { justifyContent: "center" },
                    ]}
                    onClick={(e: React.MouseEvent) => {
                      if (e.button === 1 || e.ctrlKey || e.metaKey) return;
                      e.preventDefault();
                      navigate(link);
                    }}
                  >
                    <ListItemIcon
                      sx={[
                        {
                          minWidth: 0,
                          justifyContent: "center",
                          color: location?.pathname.startsWith(link)
                            ? "rgba(135, 193, 51, 1)"
                            : "#fff",
                        },
                      ]}
                    >
                      <SvgIcon
                        icon={icon}
                        width="32px"
                        height="32px"
                        color={
                          location?.pathname.startsWith(link)
                            ? "rgba(135, 193, 51, 1)"
                            : "rgba(244, 244, 244, 1)"
                        }
                      />
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Drawer>
      )}

      {/* Tablet Drawer */}
      {isTablet && !isAuthRoute && (
        <ResponsiveDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          userRole={user?.role || ""}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && !isAuthRoute && (
        <BottomNavigation userRole={user?.role || ""} />
      )}

      {isAuthRoute ? (
        <Stack component="main" sx={{ flex: 1, p: { xs: 0, sm: 3 } }}>
          {children}
        </Stack>
      ) : (
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            height: "100%",
            minHeight: "100vh",
            borderRadius: { xs: 0, md: "40px 0 0 40px" },
            background: "rgba(244, 244, 244, 1)",
            boxShadow: {
              xs: "none",
              md: "-4px -4px 8px 0px rgba(0, 0, 0, 0.25)",
            },
            // Responsive horizontal padding: minimal on mobile, moderate on tablet, 2rem on desktop
            padding: { xs: "0 8px", sm: "0 16px", md: "0 2rem" },
            // Add bottom padding on mobile for bottom nav + safe area inset for notched devices
            paddingBottom: {
              xs: "calc(80px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))",
              sm: 0,
            },
            overflow: "hidden",
          }}
        >
          <Toolbar
            sx={{
              borderBottom: "0.5px solid rgba(0, 0, 0, 0.12)",
              // Responsive toolbar padding: compact on mobile, moderate on tablet, full on desktop
              padding: { xs: "12px 16px", sm: "16px 24px", md: "25px 2rem" },
              justifyContent: "space-between",
              minHeight: { xs: "56px", sm: "64px", md: "auto" },
              backgroundColor: "#fff",
              // Extend header full width by using negative margins to counter parent padding
              marginLeft: { xs: "-8px", sm: "-16px", md: "-2rem" },
              marginRight: { xs: "-8px", sm: "-16px", md: "-2rem" },
              paddingLeft: { xs: "16px", sm: "24px", md: "2rem" },
              paddingRight: { xs: "16px", sm: "24px", md: "2rem" },
            }}
          >
            {/* Left side: Hamburger + Logo grouped together on tablet */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isTablet && (
                <HamburgerButton onClick={() => setDrawerOpen(true)} />
              )}
              <img
                src={headerLogo}
                style={{
                  height: isMobile ? "36px" : "50px",
                  width: "auto",
                }}
              />
            </Box>

            <Stack
              flexDirection="row"
              gap={{ xs: "12px", sm: "16px", md: "24px" }}
              alignItems="center"
            >
              {/* Clinic name - hide on mobile */}
              {user?.clinic?.name && !isMobile && (
                <>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "600",
                      fontSize: { sm: "14px", md: "16px" },
                      color: "rgba(0, 0, 0, 1)",
                    }}
                  >
                    {user?.clinic?.name}
                  </Typography>
                  <Divider orientation="vertical" flexItem />
                </>
              )}

              {/* Username */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "600",
                  fontSize: { xs: "14px", md: "16px" },
                  color: "rgba(0, 0, 0, 1)",
                }}
              >
                @{user?.username}
              </Typography>

              {/* Date/Time - hide on mobile, short format on tablet */}
              {!isMobile && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Box display="flex" alignItems="center" gap="8px">
                    <SvgIcon icon="calender" />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "600",
                        fontSize: { sm: "14px", md: "16px" },
                        color: "rgba(0, 0, 0, 1)",
                      }}
                    >
                      {isTablet ? formattedDateShort : formattedDate}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap="8px">
                    <SvgIcon icon="alarm" />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "600",
                        fontSize: { sm: "14px", md: "16px" },
                        color: "rgba(0, 0, 0, 1)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formattedTime} Uhr
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Toolbar>
          <Stack
            component="main"
            sx={{
              flex: 1,
              // Responsive padding: reduced on mobile, moderate on tablet, full on desktop
              p: { xs: 1, sm: 2, md: 3 },
              // Additional horizontal padding adjustment for better content spacing
              px: { xs: 1, sm: 2, md: 3 },
              py: { xs: 1.5, sm: 2, md: 3 },
              // Prevent content overflow
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            {children}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

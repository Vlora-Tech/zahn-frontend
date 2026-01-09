import * as React from "react";
import { styled, type CSSObject, type Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import logo from "../assets/logo.svg";
import headerLogo from "../assets/header-logo.svg";
import { Divider, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { Warehouse } from "@mui/icons-material";
import SvgIcon from "./SvgIcon";
import LabTechnicianIcon from "./LabTechnicianIcon";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  paddingBottom: "115px",
  // necessary for content to be below app bar
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

  const { user } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const isAuthRoute = location.pathname === "/login";

  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000); // update every second
    return () => clearInterval(interval);
  }, []);

  // Format date in German style
  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);

  // Format time with leading zeros
  const formattedTime = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return (
    <Box sx={{ display: "flex", gap: "5px", minWidth: "100vw" }}>
      <CssBaseline />
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
          <img
            src={logo}
            style={{
              height: "50px",
              width: "50px",
            }}
          />
        </DrawerHeader>
        {!isAuthRoute && (
          <List
            sx={{
              flex: 1,
            }}
          >
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
                icon: "inventory",
                link: "/inventory/materials",
                activePrefix: "/inventory",
                roles: ["superadmin", "lab_technician"],
              },
              {
                icon: "clinic",
                link: "/clinics",
                roles: ["superadmin"],
              },
              {
                icon: "doctor",
                link: "/doctors",
                roles: ["superadmin"],
              },
              {
                icon: "nurse",
                link: "/nurses",
                roles: ["superadmin"],
              },
              {
                icon: "lab-technician",
                link: "/lab-technicians",
                activePrefix: "/lab-technicians",
                roles: ["superadmin"],
              },
              {
                icon: "settings",
                link: "/admin",
                roles: ["superadmin"],
              },
              // {
              //   icon: "notification",
              //   link: "/notification",
              // },
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
                        ? {
                            background: "rgba(244, 244, 244, 0.92)",
                          }
                        : {}),
                    }}
                  >
                    <ListItemButton
                      sx={[
                        {
                          minHeight: 80,
                          px: 2.5,
                        },
                        open
                          ? {
                              justifyContent: "initial",
                            }
                          : {
                              justifyContent: "center",
                            },
                      ]}
                      onClick={() => {
                        navigate(link);
                      }}
                    >
                      <ListItemIcon
                        sx={[
                          {
                            minWidth: 0,
                            justifyContent: "center",
                            color: isActive ? "rgba(135, 193, 51, 1)" : "#fff",
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
          <List
            sx={{
              pb: "46px",
            }}
          >
            {[
              // {
              //   icon: "settings",
              //   link: "/settings",
              // },
              {
                icon: "logout",
                link: "/login",
              },
            ].map(({ icon, link }) => (
              <ListItem
                key={link}
                disablePadding
                sx={{
                  display: "block",
                  borderRadius: "0 10px 10px 0",
                  overflow: "hidden",

                  ...(location?.pathname.startsWith(link)
                    ? {
                        background: "rgba(244, 244, 244, 0.92)",
                      }
                    : {}),
                }}
              >
                <ListItemButton
                  sx={[
                    {
                      minHeight: 80,
                      px: 2.5,
                    },
                    open
                      ? {
                          justifyContent: "initial",
                        }
                      : {
                          justifyContent: "center",
                        },
                  ]}
                  onClick={() => {
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
      {isAuthRoute ? (
        <Stack component="main" sx={{ flex: 1, p: 3 }}>
          {children}
        </Stack>
      ) : (
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            width: "100%",
            height: "100%",
            minHeight: "100vh",
            borderRadius: "40px 0 0 40px",
            background: "rgba(244, 244, 244, 1)",
            boxShadow: "-4px -4px 8px 0px rgba(0, 0, 0, 0.25)",
            padding: "0 45px 0 74px",
          }}
        >
          <Toolbar
            sx={{
              borderBottom: "0.5px solid rgba(0, 0, 0, 1)",
              padding: "25px 118px",
              justifyContent: "space-between",
            }}
          >
            <img
              src={headerLogo}
              style={{
                height: "50px",
                width: "auto",
              }}
            />

            <Stack flexDirection="row" gap="24px">
              {user?.clinic?.name && (
                <>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "rgba(0, 0, 0, 1)",
                    }}
                  >
                    {user?.clinic?.name}
                  </Typography>
                  <Divider orientation="vertical" flexItem />
                </>
              )}

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "rgba(0, 0, 0, 1)",
                }}
              >
                @{user?.username}
              </Typography>
              <Divider orientation="vertical" flexItem />

              <Box display="flex" alignItems="center" gap="8px">
                <SvgIcon icon="calender" />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "rgba(0, 0, 0, 1)",
                  }}
                >
                  {formattedDate}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap="8px">
                <SvgIcon icon="alarm" />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "rgba(0, 0, 0, 1)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formattedTime} Uhr
                </Typography>
              </Box>
            </Stack>
          </Toolbar>
          <Stack component="main" sx={{ flex: 1, p: 3 }}>
            {children}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

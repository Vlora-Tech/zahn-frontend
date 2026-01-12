import { useState } from "react";
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
} from "@mui/material";
import {
  Warehouse,
  MoreHoriz,
  Close as CloseIcon,
  MedicalInformation,
  Assignment,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import SvgIcon from "./SvgIcon";
import LabTechnicianIcon from "./LabTechnicianIcon";
import logo from "../assets/logo.svg";

interface NavItem {
  icon: string;
  label: string;
  link: string;
  activePrefix?: string;
  roles: string[];
  showInMore?: boolean; // If true, only show in "More" drawer
}

const navItems: NavItem[] = [
  {
    icon: "patient",
    label: "Patienten",
    link: "/patients",
    roles: ["superadmin", "doctor", "nurse"],
  },
  {
    icon: "request",
    label: "Auftragen",
    link: "/requests",
    roles: ["superadmin", "doctor", "nurse"],
  },
  {
    icon: "lab",
    label: "Labor",
    link: "/lab/queue",
    activePrefix: "/lab/",
    roles: ["superadmin", "lab_technician"],
  },
  {
    icon: "laborzettel",
    label: "Laborzettel",
    link: "/laborzettel",
    activePrefix: "/laborzettel",
    roles: ["superadmin", "lab_technician"],
    showInMore: true,
  },
  {
    icon: "inventory",
    label: "Lagerverwaltung",
    link: "/inventory/materials",
    activePrefix: "/inventory",
    roles: ["superadmin", "lab_technician"],
    showInMore: true,
  },
  {
    icon: "clinic",
    label: "Kliniken",
    link: "/clinics",
    roles: ["superadmin"],
    showInMore: true,
  },
  {
    icon: "doctor",
    label: "Ärzte",
    link: "/doctors",
    roles: ["superadmin"],
    showInMore: true,
  },
  {
    icon: "nurse",
    label: "Pflegefachkräfte",
    link: "/nurses",
    roles: ["superadmin"],
    showInMore: true,
  },
  {
    icon: "lab-technician",
    label: "Labortechniker",
    link: "/lab-technicians",
    activePrefix: "/lab-technicians",
    roles: ["superadmin"],
    showInMore: true,
  },
  {
    icon: "settings",
    label: "Admin",
    link: "/admin",
    roles: ["superadmin"],
    showInMore: true,
  },
  {
    icon: "logout",
    label: "Abmelden",
    link: "/login",
    roles: ["superadmin", "doctor", "nurse", "lab_technician"],
    showInMore: true,
  },
];

interface BottomNavigationProps {
  userRole: string;
}

export default function BottomNavigation({ userRole }: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  // Filter items by role
  const allUserItems = navItems.filter((item) => item.roles.includes(userRole));

  // Items shown in bottom nav (not in "More")
  const bottomNavItems = allUserItems.filter((item) => !item.showInMore);

  // Items shown in "More" drawer
  const moreItems = allUserItems.filter((item) => item.showInMore);

  // Check if we need a "More" button
  const hasMoreItems = moreItems.length > 0;

  const getCurrentValue = () => {
    // Check if current path matches any bottom nav item
    const index = bottomNavItems.findIndex((item) => {
      const activePath = item.activePrefix || item.link;
      return location.pathname.startsWith(activePath);
    });

    // If not found in bottom nav, check if it's in "More" items
    if (index < 0 && hasMoreItems) {
      const isInMore = moreItems.some((item) => {
        const activePath = item.activePrefix || item.link;
        return location.pathname.startsWith(activePath);
      });
      if (isInMore) {
        return bottomNavItems.length; // Return "More" button index
      }
    }

    return index >= 0 ? index : 0;
  };

  const renderIcon = (icon: string, isActive: boolean) => {
    const color = isActive ? "#fff" : "rgba(255, 255, 255, 0.85)";

    if (icon === "lab-technician") {
      return <LabTechnicianIcon width="24px" height="24px" color={color} />;
    }
    if (icon === "inventory") {
      return <Warehouse sx={{ width: "24px", height: "24px", color }} />;
    }
    if (icon === "laborzettel") {
      return <Assignment sx={{ width: "24px", height: "24px", color }} />;
    }
    if (icon === "request") {
      return (
        <MedicalInformation sx={{ width: "24px", height: "24px", color }} />
      );
    }
    if (icon === "more") {
      return <MoreHoriz sx={{ width: "24px", height: "24px", color }} />;
    }
    return <SvgIcon icon={icon} width="24px" height="24px" color={color} />;
  };

  const handleNavChange = (_: unknown, newValue: number) => {
    if (hasMoreItems && newValue === bottomNavItems.length) {
      // "More" button clicked
      setMoreDrawerOpen(true);
    } else {
      navigate(bottomNavItems[newValue].link);
    }
  };

  const handleMoreItemClick = (link: string) => {
    setMoreDrawerOpen(false);
    navigate(link);
  };

  return (
    <>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          borderTop: "none",
          background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
          borderRadius: "16px 16px 0 0",
          pb: "env(safe-area-inset-bottom, 0px)",
        }}
        elevation={8}
      >
        <MuiBottomNavigation
          value={getCurrentValue()}
          onChange={handleNavChange}
          showLabels
          sx={{
            height: 64,
            background: "transparent",
            "& .MuiBottomNavigationAction-root": {
              minWidth: "auto",
              padding: "6px 12px",
              position: "relative",
              transition: "all 0.2s ease-in-out",
              color: "rgba(255, 255, 255, 0.85)",
              "&.Mui-selected": {
                color: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "32px",
                  height: "3px",
                  backgroundColor: "#fff",
                  borderRadius: "0 0 3px 3px",
                },
              },
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "11px",
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.85)",
              transition: "font-weight 0.2s ease-in-out",
              "&.Mui-selected": {
                fontSize: "11px",
                fontWeight: 600,
                color: "#fff",
              },
            },
          }}
        >
          {bottomNavItems.map((item, index) => {
            const isActive = getCurrentValue() === index;
            return (
              <BottomNavigationAction
                key={item.link}
                label={item.label}
                icon={renderIcon(item.icon, isActive)}
              />
            );
          })}
          {hasMoreItems && (
            <BottomNavigationAction
              label="Mehr"
              icon={renderIcon(
                "more",
                getCurrentValue() === bottomNavItems.length,
              )}
            />
          )}
        </MuiBottomNavigation>
      </Paper>

      {/* More Drawer */}
      <Drawer
        anchor="bottom"
        open={moreDrawerOpen}
        onClose={() => setMoreDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            borderRadius: "16px 16px 0 0",
            maxHeight: "70vh",
            background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <img
            src={logo}
            style={{ height: "32px", width: "32px" }}
            alt="Logo"
          />
          <IconButton
            onClick={() => setMoreDrawerOpen(false)}
            sx={{ color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ pb: 2 }}>
          {moreItems.map((item) => {
            const activePath = item.activePrefix || item.link;
            const isActive = location.pathname.startsWith(activePath);

            return (
              <ListItem key={item.link} disablePadding>
                <ListItemButton
                  onClick={() => handleMoreItemClick(item.link)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.2)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {renderIcon(item.icon, isActive)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#fff" : "rgba(255, 255, 255, 0.85)",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}

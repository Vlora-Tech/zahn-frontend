import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Warehouse,
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
    label: "Labor-Auftrage",
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
  },
  {
    icon: "inventory",
    label: "Lagerverwaltung",
    link: "/inventory/materials",
    activePrefix: "/inventory",
    roles: ["superadmin", "lab_technician"],
  },
  {
    icon: "clinic",
    label: "Kliniken",
    link: "/clinics",
    roles: ["superadmin"],
  },
  { icon: "doctor", label: "Ärzte", link: "/doctors", roles: ["superadmin"] },
  {
    icon: "nurse",
    label: "Pflegefachkräfte",
    link: "/nurses",
    roles: ["superadmin"],
  },
  {
    icon: "lab-technician",
    label: "Labortechniker",
    link: "/lab-technicians",
    activePrefix: "/lab-technicians",
    roles: ["superadmin"],
  },
  { icon: "settings", label: "Admin", link: "/admin", roles: ["superadmin"] },
];

interface ResponsiveDrawerProps {
  open: boolean;
  onClose: () => void;
  userRole: string;
}

export function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        color: "rgba(0, 0, 0, 0.7)",
        padding: "8px",
      }}
    >
      <MenuIcon sx={{ fontSize: 28 }} />
    </IconButton>
  );
}

export default function ResponsiveDrawer({
  open,
  onClose,
  userRole,
}: ResponsiveDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  const handleNavigate = (link: string) => {
    navigate(link);
    onClose();
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
    return <SvgIcon icon={icon} width="24px" height="24px" color={color} />;
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: 280,
          background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <img src={logo} style={{ height: "40px", width: "40px" }} alt="Logo" />
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ flex: 1, pt: 2 }}>
        {filteredItems.map((item) => {
          const activePath = item.activePrefix || item.link;
          const isActive = location.pathname.startsWith(activePath);

          return (
            <ListItem key={item.link} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.link)}
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                  borderRight: isActive ? "3px solid #fff" : "none",
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
                      color: "#fff",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />

      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigate("/login")}
            sx={{
              py: 1.5,
              px: 2,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SvgIcon
                icon="logout"
                width="24px"
                height="24px"
                color="rgba(255, 255, 255, 0.85)"
              />
            </ListItemIcon>
            <ListItemText
              primary="Abmelden"
              sx={{
                "& .MuiListItemText-primary": {
                  color: "#fff",
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

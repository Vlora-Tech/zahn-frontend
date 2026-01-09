import { Box, Paper, Stack, Typography } from "@mui/material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteUser, useGetUserById } from "../../api/users/hooks";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";

export default function UserDetails() {
  const params = useParams();
  const userId = params?.id;
  const { data: user, isLoading } = useGetUserById(userId as string);
  const { mutate: deleteUser } = useDeleteUser();

  const navigate = useNavigate();

  const handleEditUser = () => {
    if (userId) {
      navigate(`/nurses/edit/${userId}`);
    }
  };
  const handleDeleteUser = () => {
    if (userId) {
      deleteUser(userId, {
        onSuccess() {
          navigate("/nurses");
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user && !isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Pflegefachkraft nicht gefunden</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="20px"
      width="100%"
      maxWidth="824px"
      mx="auto"
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: "600",
          fontSize: "24px",
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Pflegefachkraftinformationen
      </Typography>

      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          padding: "26px 40px",
          //   minHeight:"750px"
        }}
      >
        <Stack gap="42px">
          {[
            {
              label: "Name",
              value: user?.firstName + " " + user?.lastName,
            },
            {
              label: "Geschlecht",
              value:
                user?.gender === "male"
                  ? "Männlich"
                  : user?.gender === "female"
                    ? "Weiblich"
                    : user?.gender,
            },
            {
              label: "Klinik",
              value:
                typeof user?.clinic === "object" ? user?.clinic?.name : "-",
            },
            {
              label: "Username",
              value: user?.username,
            },
            {
              label: "E-Mail",
              value: user?.email || "-",
            },
            {
              label: "Telefonnummer",
              value: user?.phoneNumber || "-",
            },
            {
              label: "Notizen",
              value: user?.notes || "-",
            },
          ].map(({ label, value }) => (
            <Stack gap="16px" key={label}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "400",
                  fontSize: "16px",
                  color: "rgba(10, 77, 130, 1)",
                }}
              >
                {label}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: "500",
                  fontSize: "16px",
                  color: "rgba(0, 0, 0, 0.65)",
                }}
              >
                {value}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack flexDirection="row" justifyContent="space-between" mt="20px">
          <ButtonBlock
            onClick={() => {
              navigate("/clinics");
            }}
            style={{
              // background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
              borderRadius: "40px",
              height: "40px",
              color: "rgba(107, 107, 107, 1)",

              width: "143px",
              fontSize: "16px",

              fontWeight: "500",

              boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            Zurücksetzen
          </ButtonBlock>

          <Box
            sx={{
              display: "flex",
            }}
            gap="10px"
          >
            <ButtonBlock
              type="submit"
              style={{
                background: "rgba(247, 107, 107, 1)",
                boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                borderRadius: "40px",
                height: "40px",
                color: "white",
                width: "143px",
                fontSize: "16px",

                fontWeight: "500",
              }}
              onClick={handleDeleteUser}
            >
              Löschen
            </ButtonBlock>

            <ButtonBlock
              type="submit"
              style={{
                background: "rgba(10, 77, 130, 1)",
                boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                borderRadius: "40px",
                height: "40px",
                color: "white",
                width: "143px",
                fontSize: "16px",

                fontWeight: "500",
              }}
              onClick={handleEditUser}
            >
              Bearbeiten
            </ButtonBlock>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

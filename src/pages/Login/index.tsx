import { Form, Formik } from "formik";
import headerLogo from "../../assets/zahn-care-logo-wide.png";
import { Box, Paper, Stack, useTheme, useMediaQuery } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../api/auth/hooks";
import * as yup from "yup";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import { Fragment } from "react";

export const loginValidationSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export const loginInitialValues = {
  username: "",
  password: "",
};

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { mutate: loginMutate, status } = useLogin();

  return (
    <Formik
      initialValues={loginInitialValues}
      validationSchema={loginValidationSchema}
      onSubmit={(values) => {
        loginMutate(values, {
          onSuccess(data) {
            localStorage.setItem("accessToken", data?.access_token);
            navigate("/patients");
          },
        });
      }}
    >
      {(formikProps) => {
        console.log("Formik props:", formikProps);
        return (
          <Form>
            <Box
              display="flex"
              gap="20px"
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{
                minHeight: { xs: "100vh", sm: "auto" },
                background: {
                  xs: "rgba(255, 255, 255, 0.8)",
                  sm: "transparent",
                },
              }}
            >
              <Paper
                sx={{
                  width: { xs: "100%", sm: "487px" },
                  height: { xs: "100vh", sm: "738px" },
                  borderRadius: { xs: 0, sm: "10px" },
                  background: {
                    xs: "transparent",
                    sm: "rgba(244, 244, 244, 1)",
                  },
                  boxShadow: { xs: "none", sm: 1 },
                  padding: { xs: "48px 36px", sm: "26px 40px" },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  m: "auto",
                  gap: { xs: 4, sm: 0 },
                }}
              >
                {status === "pending" ? (
                  <LoadingSpinner />
                ) : (
                  <Fragment>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={headerLogo}
                          style={{
                            height: isMobile ? "60px" : "84px",
                            width: "auto",
                            objectFit: "contain",
                          }}
                          alt="Zahn Care Logo"
                        />
                      </Box>
                      <Stack gap="30px" pt={{ xs: "40px", sm: "70px" }}>
                        <TextFieldBlock
                          name="username"
                          label="Username"
                          startIcon={
                            <PersonOutlineIcon
                              sx={{ color: "rgba(10, 77, 130, 0.6)" }}
                            />
                          }
                          labelSx={{ fontSize: "16px", fontWeight: 500 }}
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: "16px",
                              fontWeight: 500,
                            },
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "rgba(10, 77, 130, 1)",
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(10, 77, 130, 1)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "rgba(10, 77, 130, 1)",
                              },
                            },
                          }}
                        />
                        <TextFieldBlock
                          name="password"
                          label="Password"
                          type="password"
                          startIcon={
                            <LockOutlinedIcon
                              sx={{ color: "rgba(10, 77, 130, 0.6)" }}
                            />
                          }
                          labelSx={{ fontSize: "16px", fontWeight: 500 }}
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: "16px",
                              fontWeight: 500,
                            },
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "rgba(10, 77, 130, 1)",
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(10, 77, 130, 1)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "rgba(10, 77, 130, 1)",
                              },
                            },
                          }}
                        />
                      </Stack>
                    </Box>
                    <ButtonBlock
                      type="submit"
                      startIcon={<LoginIcon />}
                      sx={{
                        background:
                          "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                        color: "white",
                        height: { xs: "44px", sm: "48px" },
                        minHeight: "44px",
                        px: "28px",
                        borderRadius: "40px",
                        width: "100%",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      Anmelden
                    </ButtonBlock>
                  </Fragment>
                )}
              </Paper>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}

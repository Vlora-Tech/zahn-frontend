import { Form, Formik } from "formik";
import headerLogo from "../../assets/zahn-care-logo-wide.png";
import { Box, Paper, Stack, useTheme, useMediaQuery } from "@mui/material";
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
              px={{ xs: 2, sm: 0 }}
              minHeight={{ xs: "100vh", sm: "auto" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              pt={{ xs: 4, sm: 0 }}
            >
              <Paper
                sx={{
                  width: { xs: "100%", sm: "738px" },
                  maxWidth: "738px",
                  height: { xs: "auto", sm: "800px" },
                  minHeight: { xs: "auto", sm: "800px" },
                  borderRadius: { xs: "10px", sm: "10px" },
                  background: "rgba(244, 244, 244, 1)",
                  padding: { xs: "24px 20px", sm: "26px 40px" },
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
                          justifyContent: { xs: "center", sm: "flex-start" },
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
                        <TextFieldBlock name="username" label="Username" />
                        <TextFieldBlock
                          name="password"
                          label="Password"
                          type="password"
                        />
                      </Stack>
                    </Box>
                    <ButtonBlock
                      type="submit"
                      sx={{
                        background:
                          "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                        color: "white",
                        height: { xs: "44px", sm: "40px" },
                        minHeight: "44px",
                        px: "28px",
                        borderRadius: "40px",
                        alignSelf: { xs: "stretch", sm: "flex-end" },
                        justifySelf: "flex-end",
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Absenden
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

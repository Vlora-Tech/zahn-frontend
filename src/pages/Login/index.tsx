import { Form, Formik } from "formik";
import headerLogo from "../../assets/zahn-care-logo-wide.png";
import { Box, Paper, Stack } from "@mui/material";
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

  const { mutate: loginMutate, status } = useLogin();

  return (
    <Formik
      initialValues={loginInitialValues}
      validationSchema={loginValidationSchema} // Add your validation schema here
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
            <Box display="flex" gap="20px">
              <Paper
                sx={{
                  // flexGrow: 1,
                  width: "738px",
                  height: "800px",
                  // minHeight: '100vh',
                  borderRadius: "10px",
                  background: "rgba(244, 244, 244, 1)",
                  // boxShadow: '-4px -4px 8px 0px rgba(0, 0, 0, 0.25)',
                  padding: "26px 40px",
                  minHeight: "800px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  m: "auto",
                }}
              >
                {status === "pending" ? (
                  <LoadingSpinner />
                ) : (
                  <Fragment>
                    <Box>
                      <img
                        src={headerLogo}
                        style={{
                          height: "84px",
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                      <Stack gap="30px" pt="70px">
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
                        height: "40px",
                        px: "28px",
                        borderRadius: "40px",
                        alignSelf: "flex-end",
                        justifySelf: "flex-end",
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

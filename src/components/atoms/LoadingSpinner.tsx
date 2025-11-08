import { CircularProgress, Stack, styled } from "@mui/material";

export const LoadingSpinner = () => {
  const StyledLoadingSpinner = styled(CircularProgress)(({ theme }) => ({
    color: theme.palette.primary.main,
  }));

  return (
    <Stack
      flex="1"
      height={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <StyledLoadingSpinner size={60} />
    </Stack>
  );
};

export default LoadingSpinner;

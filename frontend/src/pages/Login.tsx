import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { queryClient, trpc } from "../util/api";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Stack } from "@mui/material";

const FormSchema = z.object({
  username: z.string().trim().min(1).max(30),
  password: z.string().trim().min(1).max(30),
});

type FormSchema = z.infer<typeof FormSchema>;

export const Login = () => {
  const [_, navigate] = useLocation();
  const loginMutation = useMutation(
    trpc.user.login.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.user.isAuthenticated.queryKey(),
        });
        navigate("/posts");
      },
    }),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = handleSubmit((formValues) =>
    loginMutation.mutate(formValues),
  );

  return (
    <Container>
      <Typography variant="h1">Boring Board</Typography>
      <Typography variant="h2" gutterBottom>
        Login
      </Typography>
      <form onSubmit={onSubmit}>
        <Stack gap={1}>
          <TextField
            label="Username"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            {...register("password")}
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Typography>
            <Link href="/signup">Don't have an account yet? Sign up here</Link>
          </Typography>
          <Button
            variant="contained"
            type="submit"
            disabled={loginMutation.isPending}
          >
            Login
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { queryClient, trpc } from "../util/api";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Stack } from "@mui/material";

const FormSchema = z
  .object({
    username: z.string().trim().min(1).max(30),
    password: z.string().trim().min(1).max(30),
    passwordConfirm: z.string().trim().min(1).max(30),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });

type FormSchema = z.infer<typeof FormSchema>;

export const SignUp = () => {
  const [_, navigate] = useLocation();
  const signUpMutation = useMutation(
    trpc.user.create.mutationOptions({
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
    signUpMutation.mutate(formValues),
  );

  return (
    <Container>
      <Typography variant="h1">Boring Board</Typography>
      <Typography variant="h2" gutterBottom>
        Sign Up
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
          <TextField
            label="Confirm Password"
            type="password"
            {...register("passwordConfirm")}
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm?.message}
            fullWidth
          />
          <Typography>
            <Link href="/login">Already have an account? Login here</Link>
          </Typography>
          <Button
            variant="contained"
            type="submit"
            disabled={signUpMutation.isPending}
          >
            Sign Up
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

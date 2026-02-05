import { Paper, TextField, Box, Button } from "@mui/material";
import { MediaUploadButton } from "./MediaUploadButton";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const CreateCommentSchema = z.object({
  body: z.string().trim(),
  fileList: z.instanceof(FileList),
});

export type CreateCommentSchema = z.infer<typeof CreateCommentSchema>;

export const CommentCreateCard = ({
  onSubmit,
  disabled,
}: {
  onSubmit: (formValues: CreateCommentSchema, reset: () => void) => void;
  disabled: boolean;
}) => {
  const { register, handleSubmit, watch, reset } = useForm<CreateCommentSchema>(
    {
      resolver: zodResolver(CreateCommentSchema),
    },
  );

  return (
    <Paper sx={{ padding: 2 }}>
      <form
        onSubmit={handleSubmit((formValues) => onSubmit(formValues, reset))}
      >
        <TextField
          multiline
          minRows={2}
          maxRows={12}
          fullWidth
          placeholder="Type your comment here"
          {...register("body")}
        />
        <Box display="flex" justifyContent="space-between" paddingTop={2}>
          <MediaUploadButton
            fileName={watch("fileList")?.item(0)?.name}
            inputProps={register("fileList")}
          />
          <Button variant="contained" type="submit" disabled={disabled}>
            Comment
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

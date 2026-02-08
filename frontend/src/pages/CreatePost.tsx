import React from "react";
import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { MediaUploadButton } from "../components/MediaUploadButton";
import { trpc } from "../util/api";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const tagShape = z.string().toLowerCase().trim().max(180).min(1);

// TODO Gotta add title and body length to the database
const createPostForm = z.object({
  title: z.string().trim().min(1).max(300),
  body: z.string().trim().max(40000),
  tag: z.string().trim(),
  tags: z
    .array(
      z.object({
        value: tagShape,
      }),
    )
    .max(20)
    .refine(
      (items) =>
        new Set(items.map((tagObj) => tagObj.value)).size === items.length,
      {
        message: "Tags must be unique",
      },
    ),
  fileList: z.instanceof(FileList),
});

type CreatePostForm = z.infer<typeof createPostForm>;

export const CreatePost = () => {
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostForm),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

  const createPostMutation = useMutation(
    trpc.posts.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.posts.pathKey() });
        navigate(`/post/${data.postId}`);
      },
    }),
  );

  const onSubmit = handleSubmit((formValues) => {
    const formData = new FormData();
    formData.set("title", formValues.title);
    formData.set("body", formValues.body);
    formValues.tags.forEach((tagObject) => {
      formData.append("tags", tagObject.value);
    });
    if (formValues.fileList.length > 0) {
      formData.set("file", formValues.fileList.item(0) as File);
    }

    createPostMutation.mutate(formData);
  });

  {
    /* TODO run tagShape.parse() on watch("tag") */
  }
  const addTag = () => {
    append({ value: watch("tag").toLowerCase() });
    setValue("tag", "");
  };

  return (
    <>
      <Typography variant="h1" gutterBottom>
        Create Post
      </Typography>

      <form onSubmit={onSubmit}>
        <Stack gap={1}>
          <MediaUploadButton
            fileName={watch("fileList")?.item(0)?.name}
            inputProps={register("fileList")}
          />
          <TextField
            id="titleInput"
            fullWidth
            label="Title"
            placeholder="Your title goes here"
            error={!!errors.title}
            helperText={errors.title?.message}
            {...register("title")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
          <TextField
            id="bodyInput"
            fullWidth
            label="Body"
            placeholder="The content of your post goes here"
            multiline
            error={!!errors.body}
            helperText={errors.body?.message}
            {...register("body")}
          />
          <Box display="flex" gap={1}>
            <TextField
              id="tagInput"
              fullWidth
              label="Tags"
              placeholder="Enter a tag"
              error={!!errors.tags}
              multiline
              helperText={
                Array.isArray(errors.tags) ? (
                  <>
                    {errors.tags
                      .map((tagObj, index) => {
                        if (tagObj) {
                          return (
                            <React.Fragment key={`tag-${index}`}>
                              <span
                                style={{
                                  overflowWrap: "break-word",
                                  wordBreak: "break-all",
                                }}
                              >{`"${watch("tags")[index].value.slice(0, 180)}"`}</span>
                              {`${tagObj?.value?.message}\r\n`}
                              <br />
                            </React.Fragment>
                          );
                        }

                        return tagObj;
                      })
                      .filter(Boolean)}
                  </>
                ) : (
                  errors.tags?.message
                )
              }
              {...register("tag")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button
              variant="outlined"
              sx={{ minWidth: "128px" }}
              onClick={addTag}
            >
              Add Tag
            </Button>
          </Box>
          <Stack direction="row" gap={1} sx={{ flexWrap: "wrap" }}>
            {fields.map((field, index) => (
              <Chip
                key={field.id}
                label={field.value}
                variant="outlined"
                onDelete={() => remove(index)}
              />
            ))}
          </Stack>
          <Button
            variant="contained"
            type="submit"
            disabled={createPostMutation.isPending}
          >
            Post
          </Button>
        </Stack>
      </form>
    </>
  );
};

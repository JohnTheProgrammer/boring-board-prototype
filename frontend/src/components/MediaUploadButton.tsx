import React from "react";
import { PermMedia } from "@mui/icons-material";
import { Button } from "@mui/material";
import styled from "@emotion/styled";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const MediaUploadButton = ({
  inputProps,
  fileName,
}: {
  inputProps: React.JSX.IntrinsicElements["input"];
  fileName?: string;
}) => {
  return (
    <Button component="label" startIcon={<PermMedia />}>
      {fileName || "Add Media"}
      <VisuallyHiddenInput type="file" {...inputProps} />
    </Button>
  );
};

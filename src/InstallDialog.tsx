import React from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent } from "@mui/material";
import InstallDialogAction from "./InstallDialogAction";

interface InstallDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  logo?: string;
  features?: React.ReactNode;
  description?: React.ReactNode;
  platform: string;
}

const InstallDialog: React.FC<InstallDialogProps> = (props) => {
  return (
    <Dialog open={props.open} onClose={props.onClose} aria-labelledby="dialog-title">
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <DialogTitle id="dialog-title">{props.title || "Install Web App"}</DialogTitle>
        {!!props.logo && (<img style={{padding: '10px 5px 10px 0'}} width="50" src={props.logo} alt="logo" />)}
      </div>
      <DialogContent dividers={true}>
        <Box display="flex" alignItems="flex-start">
          {/*!!props.logo && (
            <Box mr={1}>
              <img width="100" src={props.logo} alt="logo" />
            </Box>
          )*/}
          {!!props.features && (
            <Box>
              <Typography style={{ fontWeight: 'bold' }} variant="subtitle1">Key Features:</Typography>
              <Typography variant="body2" component="div">
                {props.features}
              </Typography>
            </Box>
          )}
        </Box>
        {!!props.description && (
          <Box>
            <br />
            <Typography style={{ fontWeight: 'bold' }} variant="subtitle2">Description:</Typography>
            <Typography variant="body2" component="div">
              {props.description}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <InstallDialogAction platform={props.platform} onSubmit={props.onSubmit} onClose={props.onClose} />
    </Dialog>
  );
};

export default InstallDialog;
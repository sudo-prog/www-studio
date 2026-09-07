import { Alert, Snackbar } from "@mui/material";
import * as React from 'react';
import { useMyContext } from "../context/MyContext";

const Message = () => {
  return (
    <div>
      <Alert severity="error">This is an error Alert.</Alert>
    </div>
  );
};

// export default Message;
export { Message as InkMeMessage };

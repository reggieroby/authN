import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
} from "@mui/material";
import { useAppState } from "../appCtx";

export function NotFound() {
  const [
    {
      client: { badgeUrl },
    },
  ] = useAppState();

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          style={{ display: badgeUrl ? "initial" : "none", height: "50px" }}
          src={badgeUrl}
        />
        <h2 style={{ marginTop: "10px" }}>404</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Link
          to={`/login`}
          style={{ color: "blue", textDecoration: "none", alignSelf: "center" }}
          underline="none"
        >
          <Button variant="outlined">Login</Button>
        </Link>
      </div>
    </div>
  );
}

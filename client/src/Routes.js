import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { useAppState } from "./appCtx";
import { Login, Register, MFA, NotFound } from "./pages";

export function Routes() {
  const [{ basePath }] = useAppState();

  return (
    <BrowserRouter basename={basePath + "/ui"}>
      <RouterRoutes>
        <Route path="/login/:request_uri" element={<Login />} />
        <Route path="/register/:request_uri" element={<Register />} />
        <Route path="/mfa" element={<MFA />} />
        <Route path="/" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </BrowserRouter>
  );
}

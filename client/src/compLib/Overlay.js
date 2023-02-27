import { CircularProgress } from "@mui/material";
import React, { useMemo } from "react";
import styled from 'styled-components'

export function Overlay(props) {
  const {
    open,
    loading,
  } = useDefaultData(props)

  return (
    <Container className="OverlayRoot">
      {props.children}
      <Pane open={open}>
        <Content>
          {loading && <CircularProgress />}
        </Content>
      </Pane>
    </Container>
  );
}

export const defaultData = { open: false, loading: false }

function useDefaultData(props) {
  return useMemo(
    () => ({
      ...defaultData,
      ...props,
    }),
    [props],
  );
}

const Container = styled.div`
  position: relative;
  min-height: 2.5rem;
`
const Pane = styled.div`
  display: ${props => props.open ? "initial" : "none"};
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, .2);
`
const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`
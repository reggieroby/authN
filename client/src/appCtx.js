import React, { useContext, useEffect, useReducer } from "react";
import { status } from "./util";
const StateContext = React.createContext();
StateContext.displayName = "AppStateStore";

const StateStores = {
  basePath: null,
  oauth2: {
    mfa: null,
    mfaVerified: null,
    code: null,
    token: null,
    isRegistered: null,
    redirect_uri: null,
    state: null,
    redirect_url: null,
  },
  user: {
    email: null,
    password: null,
    cell: null,
  },
  client: {
    badgeUrl: null,
    mfaRequired: false,
  },
};
function init() {
  return { ...StateStores, basePath: window.AuthenticationServerPath };
}

function reducer(state, action) {
  let newState = null;
  switch (action.type) {
    case "updateUser":
      newState = {
        ...state,
        user: {
          ...state.user,
          ...action.user,
        },
      };
      break;
    case "updateClient":
      newState = {
        ...state,
        client: {
          ...state.client,
          ...action.client,
        },
      };
      break;
    case "updateOAuth2":
      let obj = {
        ...state.oauth2,
        ...action.oauth2,
      };
      let redirect_url = [obj.redirect_uri, obj.code, obj.state].every(
        (v) => v !== null
      )
        ? `${obj.redirect_uri}?code=${obj.code}&state=${obj.state}`
        : "";
      newState = {
        ...state,
        oauth2: { ...obj, redirect_url },
      };
      break;
    default:
      throw new Error();
  }
  return newState;
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, StateStores, init);

  useEffect(() => {
    if (state.basePath !== null) {
      fetch(`${state.basePath}/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(status)
        .then(({ badgeUrl, mfaRequired }) => {
          if (badgeUrl) {
            dispatch({
              type: "updateClient",
              client: { badgeUrl, mfaRequired },
            });
          }
        })
        .catch(console.error);
    }
  }, [state.basePath]);

  return (
    <StateContext.Provider value={[state, dispatch]}>
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  return useContext(StateContext);
}

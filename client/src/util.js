export async function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return await response.json();
  }
  const err = new Error(response.statusText);
  console.error({ message: err.message, ...err });
  throw err;
}

export const validateEmail = (email) => String(email)
  .toLowerCase()
  .match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
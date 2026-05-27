import { stripQueryParams } from "./url-utils.js";

export function initApp(doc) {
  const input = doc.querySelector('input[type="url"]');
  const output = doc.querySelector("output");

  input.addEventListener("input", () => {
    output.value = stripQueryParams(input.value);
  });
}

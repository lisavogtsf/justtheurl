import { stripQueryParams } from "./url-utils.js";

export function initApp(doc) {
  const input = doc.querySelector('input[type="url"]');
  const output = doc.querySelector("output");
  const copyBtn = doc.querySelector("button#copy");

  input.addEventListener("input", () => {
    output.value = stripQueryParams(input.value);
  });

  copyBtn.addEventListener("click", () => {
    doc.defaultView.navigator.clipboard.writeText(output.value);
  });

  const themeToggle = doc.querySelector("button#theme-toggle");
  themeToggle.addEventListener("click", () => {
    const html = doc.documentElement;
    if (html.getAttribute("data-theme") === "light") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", "light");
    }
  });
}

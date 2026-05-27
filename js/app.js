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

  const pasteBtn = doc.querySelector("button#paste");
  pasteBtn.addEventListener("click", async () => {
    const text = await doc.defaultView.navigator.clipboard.readText();
    input.value = text;
    input.dispatchEvent(new doc.defaultView.Event("input"));
  });

  const themeToggle = doc.querySelector("button#theme-toggle");
  const sunIcon = themeToggle.querySelector(".icon-sun");
  const moonIcon = themeToggle.querySelector(".icon-moon");

  themeToggle.addEventListener("click", () => {
    const html = doc.documentElement;
    if (html.getAttribute("data-theme") === "light") {
      html.removeAttribute("data-theme");
      moonIcon.setAttribute("hidden", "");
      sunIcon.removeAttribute("hidden");
    } else {
      html.setAttribute("data-theme", "light");
      sunIcon.setAttribute("hidden", "");
      moonIcon.removeAttribute("hidden");
    }
  });
}

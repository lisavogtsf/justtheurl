import { stripQueryParams } from "./url-utils.js";

export function initApp(doc) {
  const input = doc.querySelector('input[type="url"]');
  const output = doc.querySelector("output");
  const statusEl = doc.querySelector(".url-status");
  const copyBtn = doc.querySelector("button#copy");
  const copyLabel = copyBtn.querySelector(".copy-label");
  const pasteBtn = doc.querySelector("button#paste");
  const openBtn = doc.querySelector("button#open");
  const clearBtn = doc.querySelector("button#clear");
  const themeToggle = doc.querySelector("button#theme-toggle");
  const sunIcon = themeToggle.querySelector(".icon-sun");
  const moonIcon = themeToggle.querySelector(".icon-moon");

  function copyToClipboard(text) {
    doc.defaultView.navigator.clipboard?.writeText(text).catch(() => {});
  }

  function showCopiedFeedback() {
    copyLabel.textContent = "Copied ✓";
    setTimeout(() => {
      copyLabel.textContent = "Copy";
    }, 2000);
  }

  function updateStatus(state, paramCount) {
    statusEl.dataset.state = state;
    if (state === "stripped" && paramCount > 0) {
      statusEl.textContent = paramCount === 1 ? "1 param removed" : `${paramCount} params removed`;
    } else if (state === "clean") {
      statusEl.textContent = "already clean";
    } else if (state === "invalid") {
      statusEl.textContent = "not a valid URL";
    } else {
      statusEl.textContent = "";
    }
  }

  function clearAll() {
    input.value = "";
    output.value = "";
    updateStatus("empty", 0);
    input.focus();
  }

  input.addEventListener("input", () => {
    const { result, state, paramCount } = stripQueryParams(input.value);
    output.value = result;
    output.dataset.state = state;
    updateStatus(state, paramCount);
    if (state !== "invalid" && result) copyToClipboard(result);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearAll();
  });

  if (!doc.defaultView.navigator.clipboard?.readText) {
    pasteBtn.hidden = true;
  }
  pasteBtn.addEventListener("click", async () => {
    const text = await doc.defaultView.navigator.clipboard.readText();
    input.value = text;
    input.dispatchEvent(new doc.defaultView.Event("input"));
  });

  copyBtn.addEventListener("click", () => {
    copyToClipboard(output.value);
    showCopiedFeedback();
  });

  openBtn.addEventListener("click", () => {
    if (output.value) doc.defaultView.open(output.value, "_blank");
  });

  clearBtn.addEventListener("click", clearAll);

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

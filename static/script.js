let expression  = "";
let justEvaled  = false;
let sciMode     = false;

const exprEl   = document.getElementById("expression");
const resultEl = document.getElementById("result");


// ── Display ────────────────────────────────────────────────────────────────────

function updateDisplay() {
  exprEl.textContent   = expression || "";
  resultEl.textContent = resultEl.textContent || "0";
  resultEl.classList.remove("error");
}

function setResult(val, isError = false) {
  resultEl.textContent = val;
  resultEl.classList.toggle("error", isError);
}


// ── Input handlers ─────────────────────────────────────────────────────────────

function appendNum(n) {
  if (justEvaled) { expression = ""; justEvaled = false; }
  expression += n;
  updateDisplay();
}

function appendOp(op) {
  justEvaled = false;
  // Replace last operator if already ends with one
  if (/[\+\-\*\/]$/.test(expression)) {
    expression = expression.slice(0, -1);
  }
  expression += op;
  updateDisplay();
}

function appendDot() {
  if (justEvaled) { expression = "0"; justEvaled = false; }
  // Prevent double dot in current number
  const parts = expression.split(/[\+\-\*\/]/);
  const last  = parts[parts.length - 1];
  if (last.includes(".")) return;
  if (!last) expression += "0";
  expression += ".";
  updateDisplay();
}

function appendSci(fn) {
  if (justEvaled) { expression = ""; justEvaled = false; }
  expression += fn;
  updateDisplay();
}

function squared() {
  if (!expression) return;
  expression = `pow(${expression},2)`;
  updateDisplay();
}

function clearAll() {
  expression = "";
  justEvaled = false;
  exprEl.textContent   = "";
  resultEl.textContent = "0";
  resultEl.classList.remove("error");
}

function toggleSign() {
  if (!expression) return;
  if (expression.startsWith("-")) {
    expression = expression.slice(1);
  } else {
    expression = "-" + expression;
  }
  updateDisplay();
}

function percent() {
  if (!expression) return;
  try {
    const val = parseFloat(eval(expression));
    expression = String(val / 100);
    setResult(expression);
    exprEl.textContent = expression;
  } catch { /* ignore */ }
}


// ── Calculate ──────────────────────────────────────────────────────────────────

async function calculate() {
  if (!expression) return;

  exprEl.textContent = expression + " =";

  try {
    const res  = await fetch("/api/calculate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ expression }),
    });
    const data = await res.json();

    if (!res.ok) {
      setResult(data.error || "Error", true);
    } else {
      setResult(data.result);
      expression = String(data.result);
      justEvaled = true;
    }
  } catch {
    setResult("Network error", true);
  }
}


// ── Mode Toggle ────────────────────────────────────────────────────────────────

function toggleMode() {
  sciMode = !sciMode;
  const sciPad = document.getElementById("sciPad");
  const btn    = document.getElementById("modeToggle");
  sciPad.style.display = sciMode ? "grid" : "none";
  btn.classList.toggle("active", sciMode);
  btn.textContent = sciMode ? "BASIC" : "SCI";
}


// ── Keyboard support ───────────────────────────────────────────────────────────

document.addEventListener("keydown", e => {
  if (e.key >= "0" && e.key <= "9") appendNum(e.key);
  else if (e.key === "+") appendOp("+");
  else if (e.key === "-") appendOp("-");
  else if (e.key === "*") appendOp("*");
  else if (e.key === "/") { e.preventDefault(); appendOp("/"); }
  else if (e.key === ".") appendDot();
  else if (e.key === "Enter" || e.key === "=") calculate();
  else if (e.key === "Escape") clearAll();
  else if (e.key === "Backspace") {
    expression = expression.slice(0, -1);
    updateDisplay();
  }
});

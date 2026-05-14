import os
import math
from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data       = request.get_json(silent=True) or {}
    expression = data.get("expression", "").strip()

    if not expression:
        return jsonify({"error": "No expression provided."}), 400

    try:
        # Safe evaluation — only allow math functions and operators
        allowed = {
            "sin":   math.sin,
            "cos":   math.cos,
            "tan":   math.tan,
            "asin":  math.asin,
            "acos":  math.acos,
            "atan":  math.atan,
            "log":   math.log10,
            "ln":    math.log,
            "sqrt":  math.sqrt,
            "pi":    math.pi,
            "e":     math.e,
            "abs":   abs,
            "pow":   pow,
            "round": round,
        }
        result = eval(expression, {"__builtins__": {}}, allowed)

        # Handle float precision
        if isinstance(result, float):
            if result == int(result):
                result = int(result)
            else:
                result = round(result, 10)

        return jsonify({"result": result})

    except ZeroDivisionError:
        return jsonify({"error": "Cannot divide by zero"}), 400
    except Exception:
        return jsonify({"error": "Invalid expression"}), 400


# ── Entry ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)

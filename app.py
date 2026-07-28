import re

from flask import Flask, render_template, request, redirect, url_for

import config
import sheets_service

app = Flask(__name__)


# Simple verification of email format
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
# Slovak phone numbers accepts +421 or 0
# 9 digits, '-' and ' ' are allowed and are ignored
PHONE_PATTERN = re.compile(r"^(?:\+421|0)?\s*-?\d(?:[\s-]?\d){8}$")


def is_valid_email(email):
    return bool(EMAIL_PATTERN.match(email))


def is_valid_phone(telefon):
    cleaned = telefon.replace(" ", "").replace("-", "")
    return bool(PHONE_PATTERN.match(telefon)) and len(cleaned.lstrip("+")) >= 9


@app.route("/")
def index():
    data = sheets_service.get_landing_data()
    return render_template("index.html", **data)


@app.route("/submit", methods=["POST"])
def submit():
    meno = request.form.get("meno", "").strip()
    priezvisko = request.form.get("priezvisko", "").strip()
    email = request.form.get("email", "").strip()
    telefon = request.form.get("telefon", "").strip()

    # Checkbox in HTML sends value only if checked — if missing,
    # consent was not given and data can not be stored. Frontend (JS) already
    # controls 'required', but it can be bypassed (OFF JS, direct
    # POST requests), that is why check is necessary.
    suhlas = request.form.get("suhlas")

    if not suhlas:
        return redirect(url_for("index"))

    # Basic server-side validation
    if not meno or not priezvisko:
        return redirect(url_for("index"))

    if not is_valid_email(email):
        return redirect(url_for("index"))

    if not is_valid_phone(telefon):
        return redirect(url_for("index"))

    sheets_service.append_contact(meno, priezvisko, telefon, email)

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=config.DEBUG)
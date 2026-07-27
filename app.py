from flask import Flask, render_template, request, redirect, url_for

import config
import sheets_service

app = Flask(__name__)


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

    # Checkbox v HTML pošle hodnotu len ak je zaškrtnutý — ak chýba,
    # súhlas nebol udelený a údaje sa NESMÚ uložiť. Frontend (JS) síce
    # už kontroluje required, ale to sa dá obísť (vypnutý JS, priamy
    # POST požiadavok), preto je táto serverová kontrola nutná.
    suhlas = request.form.get("suhlas")

    if not suhlas:
        # Bez súhlasu nič neukladáme a len presmerujeme späť.
        # (Pre lepší UX by sa dalo pridať flash-správu, ktorá used­rovi
        # vysvetlí prečo sa formulár neodoslal — pozri poznámku nižšie.)
        return redirect(url_for("index"))

    sheets_service.append_contact(meno, priezvisko, telefon, email)

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=config.DEBUG)
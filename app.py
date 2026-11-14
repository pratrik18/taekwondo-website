from flask import Flask, render_template, send_from_directory

import config
import sheets_service

app = Flask(__name__)


@app.route("/")
def index():
    data = sheets_service.get_landing_data()
    return render_template("index.html", **data)

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('templates', 'sitemap.xml', mimetype='application/xml')

@app.route('/robots.txt')
def robots():
    return send_from_directory('templates', 'robots.txt')


if __name__ == "__main__":
    app.run(debug=config.DEBUG)

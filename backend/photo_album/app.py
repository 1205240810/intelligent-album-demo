import os

from flask import Flask

from routes import api


def create_app():
    app = Flask(__name__)
    app.register_blueprint(api)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = os.environ.get("CORS_ALLOW_ORIGIN", "*")
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return response

    return app


app = create_app()


if __name__ == "__main__":
    host = os.environ.get("FLASK_RUN_HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8080"))
    debug = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    app.run(host=host, port=port, debug=debug)

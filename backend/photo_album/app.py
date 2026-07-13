import os

from flask import Flask

from config import MAX_UPLOAD_MB
from routes import api


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.update(
        MAX_CONTENT_LENGTH=MAX_UPLOAD_MB * 1024 * 1024,
        JSON_AS_ASCII=False,
        CORS_ALLOW_ORIGIN=os.environ.get("CORS_ALLOW_ORIGIN", "*"),
    )
    if test_config:
        app.config.update(test_config)
    app.register_blueprint(api)

    @app.errorhandler(413)
    def upload_too_large(_error):
        limit_mb = app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)
        return {"error": f"图片不能超过 {limit_mb}MB"}, 413

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = app.config["CORS_ALLOW_ORIGIN"]
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

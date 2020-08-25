from flask import Flask

api = Flask(__name__)


@api.route("/")
def index():
    return "<h1>Hi</h1>"


if __name__ == "__main__":
    api.run(threaded=True, port=5000)
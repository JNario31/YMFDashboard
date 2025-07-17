import os
from . import create_app, socketio

app = create_app(os.getenv("APP_CONFIG", "production"))

@app.route('/')
def hello():
    return "Hello World!"

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=4000, debug=True)
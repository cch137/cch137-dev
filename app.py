from website import app
import gunicorn

# from flask_socketio import SocketIO
# socketio = SocketIO(app,async_mode='threading')

# socketio = SocketIO(app,
#     enginio_logger=True,
#     cors_allowed_origins='*'
# )

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
    # socketio.run(app,debug=True)

# Jigsaw
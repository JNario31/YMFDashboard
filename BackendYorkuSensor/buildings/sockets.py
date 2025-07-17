from .controllers import create_building, delete_building, get_all_buildings, get_building
from .. import socketio

@socketio.on('message')
def handle_message(data):
    print('received message: ' + str(data))
    socketio.emit('message', "hello")

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('add_building')
def handle_create_building(data):
    result_data, status_code = create_building(data)
    socketio.emit('building_add', {
        'data': result_data,
        'status_code': status_code
    })

@socketio.on('delete_building')
def handle_delete_building(data):
    result_data, status_code = delete_building(data)
    socketio.emit('building_deleted', {
        'data': result_data,
        'status_code': status_code
    })

@socketio.on('list_buildings')
def handle_list_buildings():
    print("Received 'list_buildings' event from client")  # Debug log
    result_data, status_code = get_all_buildings()
    socketio.emit('building_list', {
        'data': result_data,
        'status_code': status_code
        })

@socketio.on('get_building')
def handle_get_building(data):
    result_data, status_code = get_building(data)
    socketio.emit('gotten_building', {
        'data': result_data,
        'status_code': status_code
    })
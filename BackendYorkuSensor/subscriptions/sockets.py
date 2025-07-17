from .controllers import subscribe, unsubscribe, get_all_subscribers, get_alert_data, delete_alert_data
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

@socketio.on('add_subscriber')
def handle_create_subscriber(data):
    result_data, status_code = subscribe(data)
    socketio.emit('subscriber_add', {
        'data': result_data,
        'status_code': status_code
    })

@socketio.on('delete_subscriber')
def handle_delete_subscriber(data):
    result_data, status_code = unsubscribe(data)
    socketio.emit('subscriber_deleted', {
        'data': result_data,
        'status_code': status_code
    })

@socketio.on('list_subscribers')
def handle_list_subscribers():
    print("Received 'list_subscribers' event from client")  # Debug log
    result_data, status_code = get_all_subscribers()
    socketio.emit('subscribers_list', {
        'data': result_data,
        'status_code': status_code
        })
    
@socketio.on('get_alert_data')
def handle_get_alert_data(data):
    print("Received 'get_alert_data' event from client")
    result_data, status_code = get_alert_data(data)
    socketio.emit('alert_data', {
        'data': result_data,
        'status_code': status_code
    })

@socketio.on('delete_alert')
def handle_delete_alert(data):
    result_data, status_code = delete_alert_data(data)
    socketio.emit('delete_alert_data', {
        'data': result_data,
        'status_code': status_code
    })
import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print("Connected to the Socket.IO server!")

@sio.event
def connect_error(error):
    print(f"Connection error: {error}")

@sio.event
def disconnect():
    print("Disconnected from the Socket.IO server")

@sio.on('sensor_add')
def on_sensor_add_result(data):
    print(f"Received sensor result: {data}")

@sio.on('sensor_delete')
def on_sensor_delete_result(data):
    print(f"Received sensor result: {data}")

@sio.on('sensor_id')
def on_get_sensor_id_result(data):
    print(f"Received sensor id: {data}")

@sio.on('sensor_id')
def on_get_sensor_id(data):
    print(f"Received on get sensor id: {data}")

@sio.on('building_add')
def on_building_result(data):
    print(f"Received building result: {data}")

@sio.on('building_deleted')
def on_building_destroyed(data):
    print(f"Received destroy building result: {data}")

def run_test():
    server_url = 'http://localhost:4000'
    print(f"Attempting to connect to {server_url}...")
    try:
        sio.connect(server_url, transports=['websocket'])
        
        test_building_data = {"name": "Test_Lab"}

        test_sensor_data = {
            "name": "Test_sensor",
            "building_name": "Test_Lab"
            }

        print(f"Sending add_building event with data: {test_building_data}")
        sio.emit('add_building', test_building_data)
        
        # Wait a bit to receive any responses
        print("Waiting for responses...")
        time.sleep(5)
        
        print(f"Sending add_sensor event with data: {test_sensor_data}")
        sio.emit('add_sensor', test_sensor_data)

        print("Waiting for responses...")
        time.sleep(5)

        print(f"Sending get_sensor_id event with data: {test_sensor_data}")
        sio.emit('get_sensor_id', test_sensor_data)

        # print(f"Sending delete_sensor event with data: {test_sensor_data}")
        # sio.emit('delete_sensor', test_sensor_data)

        print("Waiting for responses...")
        time.sleep(5)

        # print(f"Sending delete_building event with data: {test_building_data}")
        # sio.emit('delete_building', test_building_data)

        # Wait a bit to receive any responses
        print("Waiting for responses...")
        time.sleep(5)

    except Exception as e:
        print(f"Error: {e}")

    finally:
        if sio.connected:
            print("Disconnecting...")
            sio.disconnect()

if __name__ == "__main__":
    run_test()
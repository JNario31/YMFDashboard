import socketio
import time
from datetime import datetime


class SensorTestClient:
    def __init__(self, server_url='http://localhost:4000'):
        self.sio = socketio.Client()
        self.server_url = server_url
        self.sensor_id = None
        
        # Event listeners
        self.setup_event_listeners()

    def setup_event_listeners(self):
        @self.sio.event
        def connect():
            print("Connected to the Socket.IO server!")

        @self.sio.event
        def connect_error(error):
            print(f"Connection error: {error}")

        @self.sio.event
        def disconnect():
            print("Disconnected from the Socket.IO server")

        @self.sio.on('building_add')
        def on_building_result(data):
            print(f"Received building result: {data}\n")

        @self.sio.on('add_sensor')
        def on_sensor_add_result(data):
            print(f"Received sensor result: {data}\n")

        @self.sio.on('sensor_id')
        def on_get_sensor_id(data):
            print(f"Received sensor ID: {data}\n")
            # Directly extract the sensor ID from the 'data' key
            self.sensor_id = data.get('data') if isinstance(data, dict) else data
            print(f"Extracted sensor ID: {self.sensor_id}")

        @self.sio.on('add_sensor_data')
        def on_add_sensor_data(data):
            print(f"Received on sensor data added: {data}\n")

        @self.sio.on('sensor_delete')
        def on_sensor_delete_result(data):
            print(f"Received sensor delete result: {data}\n")

        @self.sio.on('building_deleted')
        def on_building_destroyed(data):
            print(f"Received destroy building result: {data}\n")
        
        @self.sio.on('sensor_data')
        def on_get_sensor_data(data):
            print(f"Received sensor data: {data}\n")

    def run_test(self):
        try:
            # Connect to the server
            print(f"Attempting to connect to {self.server_url}...")
            self.sio.connect(self.server_url, transports=['websocket'])

            # Test data
            test_building_data = {"name": "Test_Lab"}
            test_sensor_data = {
                "name": "Test_sensor", 
                "building_name": "Test_Lab"
            }

            # Test sensor data payload
            test_sensor_data_payload = {
                "temperature": 22.5,
                "humidity": 45.3,
                "pressure": 1013.25,
                "airflow": 5.7,
            }

            # Add building
            print(f"Sending add_building event with data: {test_building_data}\n")
            self.sio.emit('add_building', test_building_data)
            time.sleep(2)

            # Add sensor
            print(f"Sending add_sensor event with data: {test_sensor_data}\n")
            self.sio.emit('add_sensor', test_sensor_data)
            time.sleep(2)

            # Get sensor ID
            print(f"Sending get_sensor_id event with data: {test_sensor_data}\n")
            self.sio.emit('get_sensor_id', test_sensor_data)
            
            # Wait for sensor ID to be received
            for _ in range(10):  # Wait up to 10 seconds
                if self.sensor_id is not None:
                    break
                time.sleep(1)
            
            if self.sensor_id is None:
                print("Failed to retrieve sensor ID")
                return

            # Add sensor data with automatically retrieved sensor ID
            test_sensor_data_payload['sensor_id'] = self.sensor_id
            print(f"Sending add_sensor_data event with data: {test_sensor_data_payload}\n")
            self.sio.emit('add_sensor_data', test_sensor_data_payload)
            time.sleep(2)

            #Get sensor data
            test_sensor_id = {'sensor_id': self.sensor_id}
            print(f"Sending sensor id {test_sensor_id} to get_sensor_data\n")
            self.sio.emit('get_sensor_data', test_sensor_id)
            time.sleep(2)

            # Delete sensor
            print(f"Sending delete_sensor event with data: {test_sensor_data}\n")
            self.sio.emit('delete_sensor', test_sensor_data)
            time.sleep(2)

            # Delete building
            print(f"Sending delete_building event with data: {test_building_data}\n")
            self.sio.emit('delete_building', test_building_data)
            time.sleep(2)

        except Exception as e:
            print(f"Error: {e}")
        finally:
            if self.sio.connected:
                print("Disconnecting...")
                self.sio.disconnect()

def main():
    client = SensorTestClient()
    client.run_test()

if __name__ == "__main__":
    main()
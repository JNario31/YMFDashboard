import socketio
import time
import random
from datetime import datetime
import json

# Hardcoded configuration
SERVER_URL = 'http://localhost:4000'
SENSOR_ID = '1'  # Hardcoded sensor ID to 1
DATA_INTERVAL = 2.0  # Send data every 2 seconds

# Create a Socket.IO client
sio = socketio.Client()

# Connection event handlers
@sio.event
def connect():
    print(f"Connected to server: {SERVER_URL}")
    sio.emit('get_sensor_data', {'sensor_id': SENSOR_ID})

@sio.event
def disconnect():
    print("Disconnected from server")

@sio.on('sensor_data')
def on_sensor_data(data):
    print(f"Received sensor data response: {json.dumps(data, indent=2)}")

@sio.on('test_email')
def on_test_email(data):
    print(f"Received socket: {data}")

@sio.on('surpassed_threshold')
def on_test(data):
    print(f"SURPASSED THRESHOLD: {data}")

def generate_sensor_data():
    """Generate realistic sensor data with some variation"""
    return {
        'sensor_id': SENSOR_ID,
        'temperature': round(random.uniform(18.0, 28.0), 1),  # 18-28°C
        'humidity': round(random.uniform(30.0, 70.0), 1),     # 30-70%
        'pressure': round(random.uniform(990.0, 1020.0), 1),  # 990-1020 hPa
        'airflow': round(random.uniform(0.1, 5.0), 1),        # 0.1-5.0 m/s
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }

def main():
    try:
        # Connect to the Socket.IO server
        print(f"Connecting to {SERVER_URL}...")
        sio.connect(SERVER_URL)
        
        # Send data periodically
        while True:
            try:
                sensor_data = generate_sensor_data()
                print(f"Sending data: {sensor_data}")
                sio.emit('add_sensor_data', sensor_data)
                
                # Wait for the specified interval
                time.sleep(DATA_INTERVAL)
            except Exception as e:
                print(f"Error sending data: {e}")
                time.sleep(1)  # Wait before retrying
                
    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        # Disconnect if the script is interrupted
        if sio.connected:
            sio.disconnect()

if __name__ == "__main__":
    main()
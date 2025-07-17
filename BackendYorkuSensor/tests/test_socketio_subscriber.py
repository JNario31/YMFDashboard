import socketio
import time

# Create a Socket.IO client
sio = socketio.Client()

# Define event handlers
@sio.event
def connect():
    print("Connected to the Socket.IO server!")

@sio.event
def connect_error(error):
    print(f"Connection error: {error}")

@sio.event
def disconnect():
    print("Disconnected from the Socket.IO server")

# Handler for 'message' events from the server
@sio.on('message')
def on_message(data):
    print(f"Received message: {data}")

# Handler for 'building_result' event
@sio.on('subscriber_add')
def on_subscribe_result(data):
    print(f"Received subscriber result: {data}")

@sio.on('subscriber_deleted')
def on_subscriber_deleted(data):
    print(f"Received destroy building result: {data}")

@sio.on('subscribers_list')
def on_list_subscribers(data):
    print(f"Received list_subscribers: {data}")

@sio.on('alert_data')
def on_alert_data(data):
    print(f"Received alert_data: {data}")

# Main function
def run_test():
    server_url = 'http://localhost:4000'
    print(f"Attempting to connect to {server_url}...")
    
    try:
        # Connect to the server with explicit websocket transport
        sio.connect(server_url, transports=['websocket'])

        # Send a test add_building request
        test_subscriber_data = {"email": "arpbruno325@gmail.com"}
        test_alert_data = {'time_range': '30d'}
        # test_subscriber_data = {"email": "exampleemail@gmail.com"}

        # Send a test add_building request      


        # STARTED COMMENTING HERE


        print(f"Sending add_subscriber event with data: {test_subscriber_data}")
        sio.emit('add_subscriber', test_subscriber_data)
        
        # Wait a bit to receive any responses
        print("Waiting for responses...")
        time.sleep(5)

        # # Send a test to list all buildings

        # print(f"Sending list_subscribers event")
        # sio.emit('list_subscribers')
        
        # # Wait a bit to receive any responses
        # print("Waiting for responses...")
        # time.sleep(5)

        #Send a test to delete_building request

        # print(f"Sending delete_subscriber event with data: {test_subscriber_data}")
        # sio.emit('delete_subscriber', test_subscriber_data)

        # # Wait a bit to receive any responses
        # print("Waiting for responses...")
        # time.sleep(5)

        # # Send a test to list all buildings

        # print(f"Sending list_subscribers event")
        # sio.emit('list_subscribers')
        
        # # Wait a bit to receive any responses
        # print("Waiting for responses...")
        # time.sleep(5)

        print(f"Sending get_alert_data event")
        sio.emit('get_alert_data', test_alert_data)
        
        # Wait a bit to receive any responses
        print("Waiting for responses...")
        time.sleep(10)
        
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        # Disconnect if connected
        if sio.connected:
            print("Disconnecting...")
            sio.disconnect()

if __name__ == "__main__":
    run_test()
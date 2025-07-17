import csv
from io import StringIO
import io
from flask import Blueprint, Response, abort
from .controllers import add_sensor_data, create_sensor, delete_sensor, get_sensor_data, get_sensor_id, get_building_sensors
from .. import socketio
from .models import Sensor, SensorData


bp = Blueprint('routes', __name__)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('add_sensor')
def handle_create_sensor(data):
    result_data, status_code = create_sensor(data)
    socketio.emit('sensor_add', {
        'data': result_data,
        'status_code': status_code
    })

@socketio.on('delete_sensor')
def handle_create_sensor(data):
    result_data, status_code = delete_sensor(data)
    socketio.emit('sensor_delete', {
        'data': result_data,
        'status_code': status_code
    })

@socketio.on('add_sensor_data')
def handle_create_sensor(data):
    result_data, status_code = add_sensor_data(data)
    socketio.emit("add_sensor_data", 
        {"data": result_data, 
         "status_code": status_code
    })
    

@socketio.on('get_sensor_id')
def handle_get_sensor_id(data):
    result_data, status_code = get_sensor_id(data)
    socketio.emit('sensor_id', {
        'data': result_data,
        'status_code': status_code
    })

@socketio.on('get_sensor_data')
def handle_get_sensor_data(data):
    result_data, status_code = get_sensor_data(data)
    socketio.emit('sensor_data', {
        'data': result_data,
        'status_code': status_code
    })
    
@socketio.on('get_building_sensors')
def handle_get_building_sensors(data):
    result_data, status_code = get_building_sensors(data)
    socketio.emit('building_sensors',{
        'data': result_data,
        'status_code': status_code
    })

@bp.route('/export/<int:sensor_id>', methods=['GET'])
def export_sensor_data(sensor_id):
    # 1) Look up the sensor (404 if not found)
    sensor = Sensor.query.get(sensor_id)
    if not sensor:
        abort(404, description="Sensor not found")

    # 2) Fetch & sort its data
    rows = (
        SensorData.query
        .filter_by(sensor_id=sensor_id)
        .order_by(SensorData.timestamp.asc())
        .all()
    )
    if not rows:
        abort(404, description="No data for this sensor")

    # 3) Build CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Timestamp', 'Temperature', 'Humidity', 'Pressure', 'Airflow'])
    for r in rows:
        writer.writerow([
            r.timestamp.isoformat(),
            r.temperature,
            r.humidity,
            r.pressure,
            r.airflow,
        ])

    # 4) Return it as a download
    csv_bytes = output.getvalue().encode('utf-8')
    filename = f"sensor_{sensor_id}_data.csv"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"',
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Length': str(len(csv_bytes)),
    }
    return Response(csv_bytes, headers=headers)

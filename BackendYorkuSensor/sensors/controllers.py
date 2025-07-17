from datetime import datetime, timedelta
from ..buildings.models import Building
from ..buildings.controllers import get_building_id
from ..subscriptions.models import Alerts
from .. import db
from .models import Sensor, SensorData
from dateutil.parser import isoparse
# import alert system
from ..subscriptions.alert_system import check_thresholds


from .. import socketio

def create_sensor(data):
    # Validate input data
    sensor_name = data.get('name')
    building_name = data.get('building_name')
    
    if not sensor_name or not building_name:
        return {'error': 'Sensor name or building name is required'}, 400
    
    # Get building ID
    building_id_result, status_code = get_building_id({'name': building_name})
    
    # Check if building ID retrieval was successful
    if status_code != 200:
        return building_id_result, status_code
    
    # Check if sensor already exists
    existing_sensor = Sensor.query.filter_by(
        name=sensor_name, 
        building_id=building_id_result
    ).first()
    
    if existing_sensor:
        return {'error': 'Sensor already exists'}, 400
    
    # Create and save new sensor
    new_sensor = Sensor(
        name=sensor_name, 
        building_id=building_id_result
    )
    
    try:
        db.session.add(new_sensor)
        db.session.commit()
        return {'message': 'Sensor added successfully'}, 201
    except Exception as e:
        db.session.rollback()
        return {'error': f'Failed to add sensor: {str(e)}'}, 500

def delete_sensor(data):
    sensor_name = data.get('name')
    building_name = data.get('building_name')
    if not sensor_name or not building_name:
        return {'error': 'Sensor name or building name is required'}, 400
    
    # Get building ID
    building_id_result, status_code = get_building_id({'name': building_name})
    
    # Check if building ID retrieval was successful
    if status_code != 200:
        return building_id_result, status_code
    
    # Check if sensor exists
    existing_sensor = Sensor.query.filter_by(
        name=sensor_name, 
        building_id=building_id_result
    ).first()

    if not existing_sensor:
        return {'error': 'Sensor does not exist'}, 404
    
    try:
        # First, delete all sensor data associated with this sensor
        SensorData.query.filter_by(sensor_id=existing_sensor.id).delete()

        db.session.delete(existing_sensor)
        db.session.commit()
        return{'message': 'Sensor deleted sucessfully along with all its sensor data'}, 201
    
    except Exception as e:
        db.session.rollback()
        return {
            'error': f'Failed to delete building: {str(e)}'
        }, 500
    

def get_building_sensors(data):
    building_id = data.get('id')  # Correctly extract 'id' from the request
    if not building_id:
        return {'error': 'building id is required'}, 400
    
    building = Building.query.get(building_id)
    if not building:
        return {'error': 'Building not found'}, 404

    sensors = Sensor.query.filter_by(building_id=building.id).all()
    
    return {
        "id": building.id,  # Ensure we return the building ID
        "sensors": [{"id": sensor.id, "name": sensor.name} for sensor in sensors]
    }, 200


def get_sensor_id(data):
    sensor_name = data.get('name')
    building_name = data.get('building_name')
    if not sensor_name or not building_name:
        return {'error': 'sensor name and building name is required'}, 400
    
    # Get building ID
    building_id_result, status_code = get_building_id({'name': building_name})
    existing_sensor = Sensor.query.filter_by(name=sensor_name, building_id=building_id_result).first()

    # Check if building ID retrieval was successful
    if status_code != 200:
        return building_id_result, status_code

    if not existing_sensor:
        return {'error': 'Sensor does not exist'}, 404
    
    sensor_id = existing_sensor.id

    return sensor_id, 200

def add_sensor_data(data):
    sensor_id = data.get('sensor_id')
    if not sensor_id:
        return {'error': 'sensor id is required'}, 400
    
    sensor = Sensor.query.get(sensor_id)
    if not sensor:
        return {'error': 'sensor does not exist'}, 400
    
    try:
        # Handle timestamp parsing
        timestamp_str = data.get('timestamp')
        timestamp = datetime.utcnow() if timestamp_str is None else isoparse(timestamp_str)
        
        new_sensor_data = SensorData(
            sensor_id=sensor_id,
            temperature=data.get('temperature'),
            humidity=data.get('humidity'),
            pressure=data.get('pressure'),
            airflow=data.get('airflow'),
            timestamp=timestamp
        )
        db.session.add(new_sensor_data)
        db.session.commit()

        # Check if sensor thresholds have been surpassed and send email if necessary
        check_thresholds(new_sensor_data)        
        
        sensor_payload = {
            "id" : new_sensor_data.sensor_id,
            "airflow": data.get('airflow'),
            "humidity": data.get('humidity'),
            "pressure": data.get('pressure'),
            "temperature": data.get('temperature'),
            "timestamp": timestamp.isoformat(),
        }
        
        # Emit the new data point as a real-time update
        socketio.emit("sensor_update", {"data": sensor_payload, "status_code": 200})

        return {'message': 'Sensor data added successfully'}, 201
    
    except Exception as e:
        db.session.rollback()
        return {'error': f'Failed to add sensor data: {str(e)}'}, 400

def get_sensor_data(data):
    try:
        sensor_id = data.get('sensor_id')
        time_range = data.get('time_range', '1h')  # Default to 1 hour if not provided
        limit = data.get('limit', 100)
        if not sensor_id:
            return {'error': 'sensor id is required'}, 400
        
        sensor = Sensor.query.get(sensor_id)

        if not sensor:
            return {'error': 'sensor does not exist'}, 400
        
        now = datetime.utcnow()
        time_mapping = {
            "1h": now - timedelta(hours=1),
            "24h": now - timedelta(days=1),
            "7d": now - timedelta(days=7),
            "30d": now - timedelta(days=30),
            "all-time": datetime.min
        }

        start_time = time_mapping.get(time_range, now - timedelta(hours=1))  # Default to 1 hour
        
        sensor_data = SensorData.query.filter(
            SensorData.sensor_id == sensor.id,
            SensorData.timestamp >= start_time
        ).order_by(SensorData.timestamp.asc()).limit(limit).all()

        formatted_data = [
            {
                "id": sensor_id, 
                "airflow": record.airflow,
                "humidity": record.humidity,
                "pressure": record.pressure,
                "temperature": record.temperature,
                "timestamp": record.timestamp.isoformat(),
            }
            for record in sensor_data
        ]

        return formatted_data, 200
    except Exception as e:
        return {'error': 'Data could not be retrieved'}, 400
    
def get_sensor_data_latest(data):
    try:
        sensor_id = data.get('sensor_id')
        if not sensor_id:
            return {'error': 'sensor id is required'}, 400
        
        sensor = Sensor.query.get(sensor_id)

        if not sensor:
            return {'error': 'sensor does not exist'}, 400
        
        now = datetime.utcnow()
        time_mapping = {
            "1h": now - timedelta(hours=1),
            "24h": now - timedelta(days=1),
            "7d": now - timedelta(days=7),
            "30d": now - timedelta(days=30),
            "all-time": datetime.min
        }

        start_time = time_mapping.get(time_range, now - timedelta(hours=1))  # Default to 1 hour
        
        sensor_data = SensorData.query.filter(
            SensorData.sensor_id == sensor.id,
            SensorData.timestamp >= start_time
        ).order_by(SensorData.timestamp.asc()).limit(limit).all()

        formatted_data = [
            {
                "airflow": record.airflow,
                "humidity": record.humidity,
                "pressure": record.pressure,
                "temperature": record.temperature,
                "timestamp": record.timestamp.isoformat(),
            }
            for record in sensor_data
        ]

        return formatted_data, 200
    except Exception as e:
        return {'error': 'Data could not be retrieved'}, 400
    
    
from ..sensors.models import Sensor
from .. import db
from .models import Building

def create_building(data):
    building_name = data.get('name')
    if not building_name:
        return {'error': 'Building name is required'}, 400
    
    if Building.query.filter_by(name=building_name).first():
        return {'error': 'Building already exists'}, 400
    
    db.session.add(Building(name=building_name))
    db.session.commit()
    return {'message': 'Building added successfully'}, 201

def delete_building(data):
    building_name = data.get('name')
    
    if not building_name:
        return {'error': 'Building name is required'}, 400
    
    # Find the building
    building = Building.query.filter_by(name=building_name).first()
    
    if not building:
        return {'error': 'Building not found'}, 404
    
    try:
        # First, delete all sensors associated with this building
        Sensor.query.filter_by(building_id=building.id).delete()
        
        # Then delete the building
        db.session.delete(building)
        db.session.commit()
        
        return {
            'message': f'Building "{building_name}" and all its sensors deleted successfully'
        }, 200
    
    except Exception as e:
        db.session.rollback()
        return {
            'error': f'Failed to delete building: {str(e)}'
        }, 500

def get_all_buildings():
    buildings = Building.query.all()
    response = [
        {
            'id': building.id,
            'name': building.name
        }
        for building in buildings
    ]

    return response, 200

def get_building_id(data):
    if not data or 'name' not in data:
        return {'error': 'Invalid input'}, 400
    
    building_name = data.get('name')
    building = Building.query.filter_by(name=building_name).first()
    
    if not building:
        return {'error': 'Building not found'}, 404
    
    return building.id, 200

def get_building(data):
    building_id_result, status_code = get_building_id(data)
    
    # If the first function returned an error
    if isinstance(building_id_result, dict):
        return building_id_result, status_code
    
    building = Building.query.get(building_id_result)
    
    if not building:
        return {'error': 'Building not found'}, 404
    
    response = {
        'id': building.id, 
        'name': building.name
    }
    
    return response, 200
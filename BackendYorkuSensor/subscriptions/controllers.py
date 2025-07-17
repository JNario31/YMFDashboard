from datetime import datetime, timedelta
from ..buildings.models import Building
from ..sensors.models import Sensor
from .models import Subscription, Alerts
from .services import fetch_alerts_with_building, fetch_last_alert_with_building
from .. import db

def subscribe(data):
    #subscriber = data
    email = data.get('email')
    if not email:
        return {'error': 'Email is required'}, 400
    
    if Subscription.query.filter_by(email=email).first():
        return {'error': 'Subscriber already exists'}, 400
    
    db.session.add(Subscription(email=email))
    db.session.commit()
    return {'message':'Successfully subscribed'}, 200

def unsubscribe(data):
    email = data.get('email')
    if not email:
        return {'error': 'Email is required'}, 400
    
    subscriber = Subscription.query.filter_by(email=email).first()
    if not subscriber:
        return {'error': 'Email does not exist'}, 400

    db.session.delete(subscriber)
    db.session.commit()

    return {'message': f'Subscriber successfully unsubscribed'}, 200

def get_all_subscribers():
    subscribers = Subscription.query.all()
    response = [
        {
            'id': sub.id,
            'email': sub.email
        }
        for sub in subscribers
    ]
    return response, 200
    
def get_alert_data(data):

    try:
        #time_range = data.get('time_range', '1h')

        now = datetime.utcnow()

        time_mapping = {
            "1h": now - timedelta(hours=1),
            "24h": now - timedelta(days=1),
            "7d": now - timedelta(days=7),
            "30d": now - timedelta(days=30),
            "all-time": datetime.min
        }
        time_range = "all-time"
        start_time = time_mapping.get(time_range, now - timedelta(hours=1))

        # results = (
        #     db.session
        #       .query(Alerts, Building.name.label("building_name"))
        #       .join(Sensor,   Alerts.sensor_id == Sensor.id)
        #       .join(Building, Sensor.building_id == Building.id)
        #       .filter(Alerts.date >= start_time)
        #       .order_by(Alerts.date.asc())
        #       .all()
        # )

        rows = fetch_alerts_with_building(start_time=start_time)

        formatted_data = [
            {
                "id": alert.id,
                "timestamp": alert.date.isoformat(),
                "sensor_id": alert.sensor_id,
                "alert_type": alert.alert_type,
                "value": alert.value,
                "building_name": building_name
            }
            for alert, building_name in rows
        ]

        return formatted_data, 200
    except Exception as e:
        return {'error': 'Data could not be retrieved'}, 400
    
def delete_alert_data(data):
    print(f"hi")
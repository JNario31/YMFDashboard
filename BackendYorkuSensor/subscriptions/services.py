from datetime import datetime
from .. import db
from ..sensors.models import Sensor
from ..buildings.models import Building
from .models import Alerts

def fetch_alerts_with_building(*,
    start_time: datetime = None,
    alert_type:  str     = None,
    sensor_id:   int     = None,     # NEW
    limit:       int     = None,
    order_desc:  bool    = False
):
    q = (
        db.session
          .query(Alerts, Building.name.label("building_name"))
          .join(Sensor,   Alerts.sensor_id   == Sensor.id)
          .join(Building, Sensor.building_id == Building.id)
    )
    if start_time:
        q = q.filter(Alerts.date >= start_time)
    if alert_type:
        q = q.filter(Alerts.alert_type == alert_type)
    if sensor_id is not None:               # NEW
        q = q.filter(Alerts.sensor_id == sensor_id)
    direction = Alerts.date.desc() if order_desc else Alerts.date.asc()
    q = q.order_by(direction)
    if limit:
        q = q.limit(limit)
    return q.all()


def fetch_last_alert_with_building(alert_type: str,
                                   sensor_id:  int = None):
    results = fetch_alerts_with_building(
        alert_type=alert_type,
        sensor_id=sensor_id,           # PASS THROUGH
        limit=1,
        order_desc=True
    )
    return results[0] if results else (None, None)

def fetch_alert_by_id_with_building(alert_id: int):
    """
    Return the single (Alerts, building_name) tuple for this alert_id,
    or (None, None) if not found.
    """
    row = (
        db.session
          .query(Alerts, Building.name.label("building_name"))
          .join(Sensor,   Alerts.sensor_id == Sensor.id)
          .join(Building, Sensor.building_id == Building.id)
          .filter(Alerts.id == alert_id)
          .first()
    )
    return row if row else (None, None)
from datetime import datetime
from .. import db

class Subscription(db.Model):
    __tablename__='subscribers'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)

class Alerts(db.Model):
    __tablename__='alerts'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    sensor_id = db.Column(db.Integer, nullable=False)
    alert_type = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Float, nullable=False)

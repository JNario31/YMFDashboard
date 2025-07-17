from .. import db

class Building(db.Model):
    __tablename__ = 'buildings'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    sensors = db.relationship('Sensor', backref='building', cascade='all, delete-orphan')
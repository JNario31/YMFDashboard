<<<<<<< HEAD
import os
from flask_migrate import Migrate
from flask.cli import FlaskGroup

from app import create_app, db
# Import models explicitly
from app.buildings.models import Building
from app.sensors.models import Sensor, SensorData
from app.subscriptions.models import Subscription

app = create_app(os.getenv('APP_CONFIG', 'production'))
migrate = Migrate(app, db)

cli = FlaskGroup(create_app=lambda: app)

if __name__ == '__main__':
=======
import os
from flask_migrate import Migrate
from flask.cli import FlaskGroup

from app import create_app, db
# Import models explicitly
from app.buildings.models import Building
from app.sensors.models import Sensor, SensorData
from app.subscriptions.models import Subscription

app = create_app(os.getenv('APP_CONFIG', 'production'))
migrate = Migrate(app, db)

cli = FlaskGroup(create_app=lambda: app)

if __name__ == '__main__':
>>>>>>> anthony
    cli()
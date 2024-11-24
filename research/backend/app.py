# app.py
from flask import Flask
from flask_mysqldb import MySQL
from config import Config
import logging
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.DEBUG,  # Set logging level
                    format='%(asctime)s [%(levelname)s] %(message)s',  # Format log output
                    datefmt='%Y-%m-%d %H:%M:%S')

# Create Flask app
app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
app.config['WTF_CSRF_ENABLED'] = False

# Initialize MySQL
mysql = MySQL(app)

# Import and register blueprints
from routes import api
app.register_blueprint(api)

# Error handlers for better logging
@app.errorhandler(404)
def not_found_error(error):
    app.logger.warning(f"404 Error: {error}")
    return {"error": "Resource not found"}, 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"500 Error: {error}")
    return {"error": "Internal server error"}, 500

if __name__ == '__main__':
    # Start the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)

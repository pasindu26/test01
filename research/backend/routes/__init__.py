from flask import Blueprint, request, jsonify, current_app as app
from forms import DataForm

api = Blueprint('api', __name__)

@api.route('/data', methods=['POST'])
def post_data():
    from app import mysql  # Import here to avoid circular import

    form = DataForm(request.form)

    if form.validate():
        ph_value = form.ph_value.data
        temperature = form.temperature.data
        location = form.location.data
        time = form.time.data
        date = form.date.data

        try:
            cur = mysql.connection.cursor()
            cur.execute("""
                INSERT INTO sensor_data (ph_value, temperature, location, time, date)
                VALUES (%s, %s, %s, %s, %s)
            """, (ph_value, temperature, location, time, date))
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Data inserted successfully'}), 201
        except Exception as e:
            app.logger.error(f"Error inserting data: {e}")
            return jsonify({'error': 'Internal Server Error'}), 500
    else:
        return jsonify({'errors': form.errors}), 400

@api.route('/data', methods=['GET'])
def get_data():
    from app import mysql  # Import here to avoid circular import

    date_filter = request.args.get('date')
    location_filter = request.args.get('location')

    try:
        cur = mysql.connection.cursor()
        query = "SELECT * FROM sensor_data"
        filters = []
        params = []

        if date_filter:
            filters.append("date = %s")
            params.append(date_filter)
        if location_filter:
            filters.append("location = %s")
            params.append(location_filter)

        if filters:
            query += " WHERE " + " AND ".join(filters)

        cur.execute(query, params)
        rows = cur.fetchall()

        # Handle cases where no rows are returned
        if not rows:
            return jsonify({'message': 'No data found'}), 404

        # Ensure cur.description is not None
        if cur.description:
            columns = [desc[0] for desc in cur.description]
            data = [dict(zip(columns, row)) for row in rows]
        else:
            data = []

        cur.close()
        return jsonify(data), 200
    except Exception as e:
        app.logger.error(f"Error retrieving data: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500



@api.route('/graph-data', methods=['GET'])
def get_graph_data():
    from app import mysql  # Import here to avoid circular import

    # Get query parameters
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    location = request.args.get('location')

    # Validate inputs
    if not start_date or not end_date or not location:
        return jsonify({'error': 'startDate, endDate, and location are required'}), 400

    try:
        cur = mysql.connection.cursor()

        # Query to get averaged daily values for a specific location
        query = """
            SELECT date, AVG(ph_value) AS ph_value
            FROM sensor_data
            WHERE date >= %s AND date <= %s AND location = %s
            GROUP BY date
            ORDER BY date
        """
        cur.execute(query, (start_date, end_date, location))
        rows = cur.fetchall()
        cur.close()

        # Convert data to JSON format
        data = [{'date': row[0], 'ph_value': row[1]} for row in rows]

        return jsonify(data), 200
    except Exception as e:
        app.logger.error(f"Error retrieving graph data: {e}", exc_info=True)
        return jsonify({'error': 'Internal Server Error'}), 500


@api.route('/compare-graph-data', methods=['GET'])
def compare_graph_data():
    from app import mysql  # Import here to avoid circular import

    # Get query parameters
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    locations = request.args.get('locations')  # Get locations as a comma-separated string

    # Validate inputs
    if not start_date or not end_date or not locations:
        return jsonify({'error': 'startDate, endDate, and locations are required'}), 400

    try:
        # Split locations into a list
        location_list = locations.split(',')

        cur = mysql.connection.cursor()

        # Query to get daily averages grouped by location and date
        query = f"""
            SELECT location, date, AVG(ph_value) AS ph_value
            FROM sensor_data
            WHERE date >= %s AND date <= %s AND location IN ({','.join(['%s'] * len(location_list))})
            GROUP BY location, date
            ORDER BY date, location
        """
        params = [start_date, end_date] + location_list
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()

        # Convert data to JSON format
        data = {}
        for row in rows:
            location, date, ph_value = row
            if location not in data:
                data[location] = []
            data[location].append({'date': date, 'ph_value': ph_value})

        return jsonify(data), 200
    except Exception as e:
        app.logger.error(f"Error retrieving comparison graph data: {e}", exc_info=True)
        return jsonify({'error': 'Internal Server Error'}), 500

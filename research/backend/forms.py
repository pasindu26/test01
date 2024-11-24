# forms.py
from flask_wtf import FlaskForm
from wtforms import FloatField, StringField
from wtforms.validators import DataRequired

class DataForm(FlaskForm):
    ph_value = FloatField('ph_value', validators=[DataRequired()])
    temperature = FloatField('temperature', validators=[DataRequired()])
    location = StringField('location', validators=[DataRequired()])
    time = StringField('time', validators=[DataRequired()])
    date = StringField('date', validators=[DataRequired()])

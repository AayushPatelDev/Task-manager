from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Task Model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    time = db.Column(db.String(10), nullable=False)
    date = db.Column(db.String(20), nullable=False, default=datetime.today().strftime('%Y-%m-%d'))
    completed = db.Column(db.Boolean, default=False)

# Create database
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    task_list = [{"id": task.id, "description": task.description, "time": task.time, "date": task.date, "completed": task.completed} for task in tasks]
    return jsonify(task_list)

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    new_task = Task(description=data['description'], time=data['time'], date=data['date'])
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task added!"}), 201

@app.route('/tasks/<int:task_id>', methods=['PATCH'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if task:
        task.completed = not task.completed
        db.session.commit()
        return jsonify({"message": "Task updated!"})
    return jsonify({"error": "Task not found"}), 404

# New route to clear completed tasks
@app.route('/tasks/clear', methods=['DELETE'])
def clear_tasks():
    # Delete all completed tasks
    completed_tasks = Task.query.filter_by(completed=True).all()
    for task in completed_tasks:
        db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Completed tasks cleared!"}), 200

if __name__ == '__main__':
    app.run(debug=True)
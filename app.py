from flask import Flask, request, jsonify
from grammar_calculator import parse_expression
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    expression = data.get('expression', '')
    try:
        tree = parse_expression(expression)
        return jsonify({'tree': tree})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)

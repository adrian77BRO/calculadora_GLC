from flask import Flask, request, jsonify
from ply import lex, yacc
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Tokens
tokens = (
    'NUMBER',
    'PLUS',
    'MINUS',
    'TIMES',
    'DIVIDE',
    'LPAREN',
    'RPAREN'
)

# Definición de los tokens
t_PLUS = r'\+'
t_MINUS = r'-'
t_TIMES = r'\*'
t_DIVIDE = r'/'
t_LPAREN = r'\('
t_RPAREN = r'\)'

def t_NUMBER(t):
    r'\d+(\.\d+)?'
    t.value = float(t.value)
    return t

t_ignore = ' \t'

def t_error(t):
    print(f"Illegal character '{t.value[0]}'")
    t.lexer.skip(1)

lexer = lex.lex()

# Gramática
def p_expression_plus(p):
    "expression : expression PLUS term"
    p[0] = (p[1], '+', p[3])

def p_expression_minus(p):
    "expression : expression MINUS term"
    p[0] = (p[1], '-', p[3])

def p_expression_term(p):
    "expression : term"
    p[0] = p[1]

def p_term_times(p):
    "term : term TIMES factor"
    p[0] = (p[1], '*', p[3])

def p_term_divide(p):
    "term : term DIVIDE factor"
    p[0] = (p[1], '/', p[3])

def p_term_factor(p):
    "term : factor"
    p[0] = p[1]

def p_factor_num(p):
    "factor : NUMBER"
    p[0] = p[1]

def p_factor_expr(p):
    "factor : LPAREN expression RPAREN"
    p[0] = p[2]

def p_error(p):
    print("Syntax error!")

parser = yacc.yacc()

@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.json
    expression = data.get("expression", "")

    # Tokenización
    lexer.input(expression)
    tokens = []
    while tok := lexer.token():
        tokens.append({"type": tok.type, "value": tok.value})

    # Construir estadísticas
    stats = {
        "numbers": sum(1 for token in tokens if token["type"] == "NUMBER"),
        "operators": sum(1 for token in tokens if token["type"] in {"PLUS", "MINUS", "TIMES", "DIVIDE"}),
    }

    # Parsear la expresión
    tree = parser.parse(expression)

    return jsonify({"tree": tree, "tokens": tokens, "stats": stats})

if __name__ == "__main__":
    app.run(debug=True)

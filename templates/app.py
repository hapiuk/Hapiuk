from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process-command', methods=['POST'])
def process_command():
    data = request.get_json()
    command = data.get('command', '').strip().lower()
    response, action = handle_command(command)
    return jsonify({'response': response, 'action': action})

def handle_command(command):
    action = None

    if command == 'help':
        response = ('Available commands: help, services, about, contact, clear, '
                    'style [dos|win98|xp|terminal|apple|hapiuk]')
    elif command == 'services':
        response = 'We offer website building, hosting, and basic support services.'
    elif command == 'about':
        response = 'Hapiuk is your go-to for all things web: development, hosting, and support.'
    elif command == 'contact':
        response = 'Reach us at contact@hapiuk.com.'
    elif command == 'clear':
        response = ''
        action = 'clear'
    elif command.startswith('style '):
        style = command.split(' ')[1]
        if style in ['dos', 'win98', 'xp', 'terminal', 'apple', 'hapiuk']:
            response = f'Switched to {style.replace("-", " ").title()} style.'
            action = f'style-{style}'
        else:
            response = 'Unknown style. Try: dos, win98, xp, terminal, apple, hapiuk.'
    else:
        response = f'Command not recognized: {command}'

    return response, action

if __name__ == '__main__':
    app.run(debug=True)

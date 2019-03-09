from flask import Flask, render_template


app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/info/')
def info():
    return render_template('info.html')


@app.route('/burn')
def burn():
    return render_template('burn.html')


if __name__ == '__main__':
    app.run()
from flask import Flask, render_template


app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/info/<token>')
def info(token):
    return render_template('info.html', token=token)


if __name__ == '__main__':
    app.run()
from flask import Flask, Response
import prometheus_client
from prometheus_client import Gauge

app = Flask(__name__)

DEPLOY_STATUS = Gauge('deploy_status', 'Status do Deploy')

@app.route('/metrics')
def metrics():
    DEPLOY_STATUS.set(1)  # 1 para sucesso, 0 para falha
    return Response(prometheus_client.generate_latest(), mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9091)

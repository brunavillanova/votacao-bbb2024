# Importa as bibliotecas necessárias
from flask import Flask, Response
import prometheus_client
from prometheus_client import Gauge

# Cria uma instância do Flask
app = Flask(__name__)

# Cria uma métrica Gauge chamada 'deploy_status' para monitorar o status do deploy
DEPLOY_STATUS = Gauge('deploy_status', 'Status do Deploy')

# Define uma rota para expor as métricas do Prometheus
@app.route('/metrics')
def metrics():
    # Define o valor da métrica 'deploy_status' (1 para sucesso, 0 para falha)
    DEPLOY_STATUS.set(1)  # 1 para sucesso, 0 para falha
    # Gera e retorna as métricas no formato de texto plano
    return Response(prometheus_client.generate_latest(), mimetype='text/plain')

# Executa o aplicativo Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9091)

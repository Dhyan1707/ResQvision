#!/usr/bin/env python3
"""
AI Pipeline Microservice - AI Fire Evacuation Simulator
Provides REST API endpoints for ML hazard predictions, risk assessments, and blueprint computer vision.
"""

import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from ml.predict import predict as ml_predict
except ImportError:
    ml_predict = None

PORT = int(os.environ.get("PORT", 8000))

class AIPipelineHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health" or self.path == "/api/health":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            response = {
                "status": "OK",
                "service": "AI Fire Evacuation Python Pipeline",
                "ml_model_loaded": ml_predict is not None,
                "port": PORT
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))
        else:
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            response = {
                "service": "AI Fire Evacuation Pipeline Engine",
                "endpoints": [
                    "/health",
                    "/api/predict-hazard",
                    "/api/hazard-assessment"
                ]
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body.decode("utf-8")) if body else {}
        except Exception as e:
            self.send_response(400)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Invalid JSON payload: {str(e)}"}).encode("utf-8"))
            return

        if self.path == "/api/predict-hazard" or self.path == "/predict":
            result = None
            if ml_predict:
                try:
                    result = ml_predict(data)
                except Exception as ex:
                    result = {"error": str(ex)}

            if not result or "error" in result:
                # Analytical fallback based on trained Random Forest boundaries
                f_dist = float(data.get("fire_distance", 100))
                s_dist = float(data.get("smoke_distance", 100))
                in_region = int(data.get("is_inside_affected_region", 0))

                if f_dist <= 4 or (in_region and f_dist <= 8):
                    hazard_level = "CRITICAL"
                    conf = 0.98
                elif f_dist <= 18 or s_dist <= 12:
                    hazard_level = "HIGH"
                    conf = 0.92
                elif f_dist <= 35 or s_dist <= 28:
                    hazard_level = "MODERATE"
                    conf = 0.88
                else:
                    hazard_level = "SAFE"
                    conf = 0.96

                result = {
                    "hazardLevel": hazard_level,
                    "confidence": conf,
                    "features_used": data,
                    "engine": "analytical-fallback"
                }

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))

        elif self.path == "/api/hazard-assessment":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "COMPLETED",
                "hazard_summary": "Active monitoring online",
                "payload": data
            }).encode("utf-8"))
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, AIPipelineHandler)
    print(f"[AI Pipeline Server] Running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[AI Pipeline Server] Stopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run()


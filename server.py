#!/usr/bin/env python3
"""
Simple HTTP server to demonstrate the AI Masterclass premium transformation
"""

import http.server
import socketserver
import webbrowser
import os
import json
from urllib.parse import urlparse, parse_qs

class AIClassHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        
        # Serve the main preview page
        if parsed_path.path == '/' or parsed_path.path == '/index.html':
            self.serve_preview()
        # API endpoints for demo
        elif parsed_path.path.startswith('/api/'):
            self.serve_api(parsed_path.path)
        else:
            # Serve static files
            super().do_GET()
    
    def serve_preview(self):
        """Serve the premium preview page"""
        try:
            with open('preview.html', 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.send_header('Content-Length', len(content.encode('utf-8')))
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except FileNotFoundError:
            self.send_error(404, "Preview file not found")
    
    def serve_api(self, path):
        """Serve mock API responses for demo"""
        # Mock course data
        courses_data = {
            "success": True,
            "data": [
                {
                    "id": "1",
                    "title": "Level 1: Foundation - Basic AI Interaction",
                    "description": "Understand AI capabilities and develop fundamental interaction skills. Perfect for beginners starting their AI journey.",
                    "level": 1,
                    "estimated_hours": 8,
                    "status": "published"
                },
                {
                    "id": "2", 
                    "title": "Level 2: Prompting Mastery - Advanced Techniques",
                    "description": "Master sophisticated prompting techniques and prompt engineering. Learn to create powerful AI workflows.",
                    "level": 2,
                    "estimated_hours": 10,
                    "status": "published"
                },
                {
                    "id": "3",
                    "title": "Level 3: Tool Integration - AI-Powered Development",
                    "description": "Master AI-powered development tools and integrate them into workflows. Build professional AI solutions.",
                    "level": 3,
                    "estimated_hours": 12,
                    "status": "published"
                }
            ]
        }
        
        # Mock user data
        user_data = {
            "success": True,
            "data": {
                "id": "1",
                "first_name": "Demo",
                "last_name": "User",
                "email": "demo@aimasterclass.com",
                "role": "learner"
            }
        }
        
        # Route API calls
        if path == '/api/courses':
            response_data = courses_data
        elif path == '/api/user':
            response_data = user_data
        else:
            response_data = {"success": False, "message": "Endpoint not found"}
        
        # Send JSON response
        response_json = json.dumps(response_data, indent=2)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(response_json.encode('utf-8')))
        self.end_headers()
        self.wfile.write(response_json.encode('utf-8'))

def start_server(port=8000):
    """Start the demo server"""
    try:
        with socketserver.TCPServer(("", port), AIClassHandler) as httpd:
            print(f"🚀 AI Masterclass Premium Demo Server")
            print(f"📍 Server running at: http://localhost:{port}")
            print(f"🎨 Premium transformation ready to view!")
            print(f"📱 Mobile responsive design included")
            print(f"✨ Hover effects and animations active")
            print(f"\n🔗 Open http://localhost:{port} in your browser")
            print(f"⏹️  Press Ctrl+C to stop the server\n")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{port}')
                print("🌐 Browser should open automatically...")
            except:
                print("💡 Please manually open http://localhost:{port} in your browser")
            
            httpd.serve_forever()
            
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use. Trying port {port + 1}...")
            start_server(port + 1)
        else:
            print(f"❌ Error starting server: {e}")
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")

if __name__ == "__main__":
    # Change to the directory containing preview.html
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("🎯 Starting AI Masterclass Premium Demo...")
    start_server()

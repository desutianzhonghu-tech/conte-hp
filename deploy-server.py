#!/usr/bin/env python3
"""
conte.jpeg — ローカルデプロイサーバー
編集モードから直接ファイル保存＋Git公開を行う
"""

import http.server
import json
import os
import subprocess
import urllib.parse

SITE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = 9999

class DeployHandler(http.server.SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        """CORS preflight"""
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path

        if path == '/save':
            self._handle_save(publish=False)
        elif path == '/publish':
            self._handle_save(publish=True)
        else:
            self.send_error(404)

    def _handle_save(self, publish=False):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            data = json.loads(body)

            filename = data.get('filename', '')
            html = data.get('html', '')

            if not filename or not html:
                self._respond(400, {'error': 'filename and html required'})
                return

            # Security: only allow saving to known paths
            allowed = self._get_allowed_path(filename)
            if not allowed:
                self._respond(400, {'error': f'Invalid filename: {filename}'})
                return

            # Save file
            filepath = os.path.join(SITE_DIR, allowed)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)

            result = {'saved': allowed}

            # Git publish
            if publish:
                git_result = self._git_publish()
                result['git'] = git_result

            self._respond(200, result)

        except Exception as e:
            self._respond(500, {'error': str(e)})

    def _get_allowed_path(self, filename):
        """Only allow saving to known site files"""
        allowed_files = [
            'index.html',
            'gallery.html',
            'philosophy.html',
            'contact.html',
        ]
        # Also allow blog/xxx.html
        if filename.startswith('blog/') and filename.endswith('.html'):
            # Sanitize
            parts = filename.split('/')
            if len(parts) == 2 and parts[1].replace('.html', '').replace('-', '').isalnum():
                return filename

        if filename in allowed_files:
            return filename
        return None

    def _git_publish(self):
        """Git add, commit, push"""
        try:
            # Check for changes
            subprocess.run(
                ['git', 'add', '-A'],
                cwd=SITE_DIR, capture_output=True, check=True
            )

            diff = subprocess.run(
                ['git', 'diff', '--cached', '--quiet'],
                cwd=SITE_DIR, capture_output=True
            )

            if diff.returncode == 0:
                return {'status': 'no_changes'}

            subprocess.run(
                ['git', 'commit', '-m', 'Update site'],
                cwd=SITE_DIR, capture_output=True, check=True
            )

            push = subprocess.run(
                ['git', 'push', 'origin', 'main'],
                cwd=SITE_DIR, capture_output=True, text=True
            )

            if push.returncode == 0:
                return {'status': 'published'}
            else:
                return {'status': 'push_failed', 'error': push.stderr}

        except subprocess.CalledProcessError as e:
            return {'status': 'error', 'error': e.stderr.decode() if e.stderr else str(e)}

    def _respond(self, code, data):
        self.send_response(code)
        self._cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, format, *args):
        """Suppress standard logs, only show important ones"""
        if '/save' in str(args) or '/publish' in str(args):
            super().log_message(format, *args)


if __name__ == '__main__':
    os.chdir(SITE_DIR)
    server = http.server.HTTPServer(('127.0.0.1', PORT), DeployHandler)
    print(f'conte.jpeg deploy server running on http://127.0.0.1:{PORT}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')

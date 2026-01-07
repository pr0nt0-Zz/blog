#!/usr/bin/env python3
"""
Flask application for CTF writeup blog with PDF upload functionality.
"""
import os
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import json

app = Flask(__name__, static_folder='.', template_folder='.')
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
ADMIN_PASSWORD_HASH = generate_password_hash('admin123')  # Change this password!

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Metadata file to store PDF information
METADATA_FILE = os.path.join(UPLOAD_FOLDER, 'metadata.json')

def load_metadata():
    """Load PDF metadata from file."""
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_metadata(metadata):
    """Save PDF metadata to file."""
    with open(METADATA_FILE, 'w') as f:
        json.dump(metadata, f, indent=2)

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the index page."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files."""
    return send_from_directory('.', path)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handle admin login."""
    if request.method == 'POST':
        password = request.form.get('password')
        if check_password_hash(ADMIN_PASSWORD_HASH, password):
            session['logged_in'] = True
            return redirect(url_for('ctf_page'))
        return render_template('login.html', error='Invalid password')
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Handle admin logout."""
    session.pop('logged_in', None)
    return redirect(url_for('ctf_page'))

@app.route('/ctf.html')
def ctf_page():
    """Serve the CTF page."""
    return render_template('ctf.html', is_admin=session.get('logged_in', False))

@app.route('/api/pdfs')
def list_pdfs():
    """API endpoint to list all uploaded PDFs."""
    metadata = load_metadata()
    return jsonify(metadata)

@app.route('/api/check-auth')
def check_auth():
    """Check if user is authenticated."""
    return jsonify({'is_admin': session.get('logged_in', False)})

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle PDF file upload (admin only)."""
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    if file_length > MAX_FILE_SIZE:
        return jsonify({'error': 'File too large (max 16MB)'}), 400
    file.seek(0)
    
    # Save file
    filename = secure_filename(file.filename)
    # Add timestamp to avoid conflicts
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Update metadata
    metadata = load_metadata()
    metadata.append({
        'filename': filename,
        'title': title or filename,
        'description': description,
        'upload_date': datetime.now().isoformat(),
        'size': file_length
    })
    save_metadata(metadata)
    
    return jsonify({'success': True, 'filename': filename})

@app.route('/uploads/<filename>')
def download_file(filename):
    """Serve uploaded PDF files."""
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=False)

@app.route('/api/delete/<filename>', methods=['POST'])
def delete_file(filename):
    """Delete a PDF file (admin only)."""
    if not session.get('logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Load metadata
    metadata = load_metadata()
    
    # Find and remove the file entry
    metadata = [m for m in metadata if m['filename'] != filename]
    save_metadata(metadata)
    
    # Delete the actual file
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    
    return jsonify({'success': True})

if __name__ == '__main__':
    print("=" * 60)
    print("CTF Blog Server Starting...")
    print("=" * 60)
    print(f"Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"Default admin password: admin123")
    print("IMPORTANT: Change the password in app.py (ADMIN_PASSWORD_HASH)")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)

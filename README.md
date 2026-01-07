# CTF Writeups Blog

A personal blog focused on CTF (Capture The Flag) writeups with secure PDF upload functionality.

## Features

- 🔐 Password-protected admin panel
- 📤 PDF upload system for CTF writeups
- 📄 Dynamic PDF display and management
- 🎨 Dark mode with glassmorphism design
- 📱 Responsive layout

## Setup

### Requirements

- Python 3.8+
- Flask 3.0.0
- Werkzeug 3.0.1

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd blog
```

2. Install dependencies:
```bash
pip3 install -r requirements.txt
```

3. **IMPORTANT**: Change the default admin password in `app.py`:
```python
# Line 16 in app.py
ADMIN_PASSWORD_HASH = generate_password_hash('your-secure-password')
```

4. Run the application:
```bash
python3 app.py
```

5. Access the blog at `http://localhost:5000`

## Usage

### Admin Access

1. Navigate to `/login`
2. Enter your admin password
3. Upload CTF writeups via the form on the CTF page

### Public Access

- View all uploaded CTF writeups
- Download PDF files
- Browse writeup descriptions

## File Structure

```
blog/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── index.html          # Homepage (About)
├── ctf.html            # CTF writeups page
├── login.html          # Admin login
├── styles.css          # All CSS styles
├── script.js           # Theme toggle & animations
├── ctf.js              # PDF loading & upload logic
├── kitty.png           # Favicon
└── uploads/            # PDF storage (auto-created)
```

## Security

- Password hashing using Werkzeug
- Session-based authentication
- File type validation (PDF only)
- File size limits (16MB max)
- Filename sanitization
- Protected admin endpoints

## Customization

1. **About Section**: Edit `index.html` to add your information
2. **Social Links**: Update footer links in `index.html`
3. **Admin Password**: Change in `app.py` (IMPORTANT!)
4. **Styling**: Modify `styles.css` for theme customization

## License

MIT License - Feel free to use and modify!

## Author

Muhammad Zailan - Networking & Cybersecurity Student from Malaysia

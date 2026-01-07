/**
 * CTF page JavaScript - handles dynamic PDF loading and upload
 */

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        return data.is_admin;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

// Load and display PDFs
async function loadPDFs() {
    try {
        const response = await fetch('/api/pdfs');
        const pdfs = await response.json();

        const grid = document.getElementById('pdf-grid');

        if (pdfs.length === 0) {
            grid.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text);">
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">📁 No writeups yet</p>
          <p style="opacity: 0.7;">Upload your first CTF writeup to get started!</p>
        </div>
      `;
            return;
        }

        // Sort by upload date (newest first)
        pdfs.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));

        grid.innerHTML = pdfs.map(pdf => {
            const uploadDate = new Date(pdf.upload_date);
            const dateStr = uploadDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const fileSize = (pdf.size / 1024).toFixed(0) + ' KB';

            return `
        <article class="pdf-card">
          <div class="pdf-icon">📄</div>
          <div class="pdf-content">
            <h3>${escapeHtml(pdf.title)}</h3>
            ${pdf.description ? `<p class="pdf-description">${escapeHtml(pdf.description)}</p>` : ''}
            <div class="pdf-meta">
              <span>📅 ${dateStr}</span>
              <span>📊 ${fileSize}</span>
            </div>
          </div>
          <div class="pdf-actions">
            <a href="/uploads/${pdf.filename}" target="_blank" class="pdf-btn pdf-btn-view">
              View PDF
            </a>
            <a href="/uploads/${pdf.filename}" download class="pdf-btn pdf-btn-download">
              Download
            </a>
            ${window.isAdmin ? `
              <button onclick="deletePDF('${pdf.filename}')" class="pdf-btn pdf-btn-delete">
                Delete
              </button>
            ` : ''}
          </div>
        </article>
      `;
        }).join('');

    } catch (error) {
        console.error('Failed to load PDFs:', error);
        document.getElementById('pdf-grid').innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #ff6b6b;">
        <p>Failed to load writeups. Please refresh the page.</p>
      </div>
    `;
    }
}

// Upload form handler
async function handleUpload(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('upload-btn-text');
    const spinner = document.getElementById('upload-spinner');

    // Show loading state
    submitBtn.style.display = 'none';
    spinner.style.display = 'inline';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            // Success - reload PDFs and reset form
            alert('✅ Writeup uploaded successfully!');
            form.reset();
            await loadPDFs();
        } else {
            alert('❌ Upload failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ Upload failed: ' + error.message);
    } finally {
        // Reset button state
        submitBtn.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

// Delete PDF
async function deletePDF(filename) {
    if (!confirm('Are you sure you want to delete this writeup?')) {
        return;
    }

    try {
        const response = await fetch(`/api/delete/${filename}`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('✅ Writeup deleted successfully!');
            await loadPDFs();
        } else {
            alert('❌ Delete failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('❌ Delete failed: ' + error.message);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize page
async function init() {
    const isAdmin = await checkAuth();
    window.isAdmin = isAdmin;

    // Show admin controls
    const adminControls = document.getElementById('admin-controls');
    if (isAdmin) {
        adminControls.innerHTML = `
      <span style="color: var(--accent); font-size: 0.9rem; margin-right: 0.5rem;">
        Admin
      </span>
      <a href="/logout" style="color: var(--text); font-size: 0.9rem;">Logout</a>
    `;
        document.getElementById('upload-section').style.display = 'block';
        document.getElementById('upload-form').addEventListener('submit', handleUpload);
    } else {
        adminControls.innerHTML = `
      <a href="/login" style="color: var(--accent); font-size: 0.9rem;">Admin Login</a>
    `;
    }

    // Load PDFs
    await loadPDFs();
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);

import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Image, Meta
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

# --- Load environment variables ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# --- Flask setup ---
app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, '../frontend/dist'),
    static_url_path='/'
)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    if Meta.query.get(1) is None:
        db.session.add(Meta(id=1, expire_at=None))
        db.session.commit()

# --- Upload endpoint ---
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'no file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'no selected file'}), 400
    try:
        res = cloudinary.uploader.upload(file, folder='single_user_gallery')
        optimized_url = res['secure_url'].replace('/upload/', '/upload/w_800,q_auto,f_auto/')
        img = Image(public_id=res['public_id'], url=optimized_url)
        db.session.add(img)

        meta = Meta.query.get(1)
        if meta.expire_at is None:
            meta.expire_at = datetime.utcnow() + timedelta(hours=96)
            db.session.add(meta)
        db.session.commit()
        return jsonify({'msg': 'uploaded', 'public_id': res['public_id'], 'url': optimized_url})
    except Exception as e:
        return jsonify({'error': 'upload failed', 'detail': str(e)}), 500

# --- Admin delete endpoint ---
@app.route('/admin/delete/<int:image_id>', methods=['DELETE'])
def admin_delete(image_id):
    token = request.headers.get("Admin-Token")
    if token != ADMIN_PASSWORD:
        return jsonify({'error': 'Unauthorized'}), 401

    img = Image.query.get(image_id)
    if not img:
        return jsonify({'error': 'not found'}), 404

    try:
        cloudinary.uploader.destroy(img.public_id)
    except Exception as e:
        return jsonify({'error': 'Cloudinary delete failed', 'detail': str(e)}), 500

    db.session.delete(img)
    db.session.commit()
    return jsonify({'msg': 'deleted'})

# --- Disable normal delete endpoint ---
@app.route('/delete/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    return jsonify({'error': 'Use admin delete'}), 403

# --- Public endpoints ---
@app.route('/images')
def images():
    imgs = Image.query.order_by(Image.uploaded_at.desc()).all()
    return jsonify([{'id': i.id, 'public_id': i.public_id, 'url': i.url} for i in imgs])

# --- Serve React frontend ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# --- Run app ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

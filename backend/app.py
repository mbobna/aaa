import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Image, Meta
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

# Load .env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    if Meta.query.get(1) is None:
        db.session.add(Meta(id=1, expire_at=None))
        db.session.commit()

# --- API ---
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'no file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'no selected file'}), 400

    try:
        res = cloudinary.uploader.upload(file, folder='single_user_gallery')
    except Exception as e:
        return jsonify({'error': 'upload failed', 'detail': str(e)}), 500

    img = Image(public_id=res['public_id'], url=res['secure_url'])
    db.session.add(img)

    meta = Meta.query.get(1)
    if meta.expire_at is None:
        meta.expire_at = datetime.utcnow() + timedelta(hours=72)
        db.session.add(meta)

    db.session.commit()
    return jsonify({'msg': 'uploaded', 'public_id': res['public_id'], 'url': res['secure_url']})

@app.route('/images')
def images():
    imgs = Image.query.order_by(Image.uploaded_at.desc()).all()
    return jsonify([{'id': i.id, 'public_id': i.public_id, 'url': i.url} for i in imgs])

@app.route('/delete/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    img = Image.query.get(image_id)
    if not img:
        return jsonify({'error': 'not found'}), 404
    try:
        cloudinary.uploader.destroy(img.public_id)
    except:
        pass
    db.session.delete(img)
    db.session.commit()
    return jsonify({'msg': 'deleted'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

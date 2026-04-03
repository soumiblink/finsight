from io import BytesIO

from PIL import Image

from django.core.files import File
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.db.models.fields.files import ImageFieldFile


def delete_photoURL(photoURL: ImageFieldFile, user: User):
    """Delete the image file from local storage."""
    try:
        if photoURL and photoURL.name:
            photoURL.delete(save=False)
    except Exception as e:
        print(f"Could not delete photo: {e}")


def resize_photo(photo: ImageFieldFile, user: User, resize: bool = True):
    """Resize and re-save image to local storage."""
    try:
        img = Image.open(photo).convert("RGB")
        if img.size > (512, 512) and resize:
            img.thumbnail((512, 512))
        output = BytesIO()
        img.save(output, format="JPEG")
        output.seek(0)
        content_file = ContentFile(output.read())
        file = File(content_file)
        photo_name = photo.name.split("/")[-1]
        photo.save(f"{user.username}/{photo_name}", file, save=False)
    except Exception as e:
        print(f"Could not resize photo: {e}")

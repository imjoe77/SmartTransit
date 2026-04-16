from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import traceback
from detector import analyze_frame

app = FastAPI()

# Allow cross-origin requests from Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FrameData(BaseModel):
    image: str


@app.get("/")
def home():
    return {"message": "Fatigue Detection Service Running", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-frame")
def analyze(data: FrameData):
    try:
        # The image may come as raw base64 or as a data-URI.
        # Strip the "data:image/...;base64," prefix if present.
        raw = data.image
        if "," in raw:
            raw = raw.split(",", 1)[1]

        image_data = base64.b64decode(raw)

        if len(image_data) < 100:
            return {
                "fatigued": False,
                "ear": None,
                "face_detected": False,
                "reason": "Image data too small / corrupt"
            }

        # Send to detector
        result = analyze_frame(image_data)
        return result

    except Exception as e:
        traceback.print_exc()
        return {
            "error": str(e),
            "fatigued": False,
            "ear": None,
            "face_detected": False,
            "reason": f"Server error: {str(e)}"
        }
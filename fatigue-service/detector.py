import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh

# MediaPipe landmark indices for left and right eye
LEFT_EYE  = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33,  160, 158, 133, 153, 144]

# Persistent FaceMesh instance — avoid re-creating on every call
# (the model init is expensive; reuse saves ~200ms per frame)
_face_mesh = None

def _get_face_mesh():
    """Lazily initialise FaceMesh so the heavy model load only happens once."""
    global _face_mesh
    if _face_mesh is None:
        _face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=False,        # Faster tracking for frame sequences
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
    return _face_mesh


def eye_aspect_ratio(landmarks, eye_indices, image_width, image_height):
    points = []
    for idx in eye_indices:
        lm = landmarks[idx]
        points.append((lm.x * image_width, lm.y * image_height))

    # Vertical distances
    v1 = np.linalg.norm(np.array(points[1]) - np.array(points[5]))
    v2 = np.linalg.norm(np.array(points[2]) - np.array(points[4]))

    # Horizontal distance
    h  = np.linalg.norm(np.array(points[0]) - np.array(points[3]))

    if h == 0:
        return 0.0

    ear = (v1 + v2) / (2.0 * h)
    return round(float(ear), 4)


def analyze_frame(image_bytes: bytes) -> dict:
    """Analyze a single JPEG frame for driver fatigue using Eye Aspect Ratio."""

    # Decode image
    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame  = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if frame is None:
        return {
            "fatigued": False,
            "ear": None,
            "face_detected": False,
            "reason": "Could not decode image"
        }

    h, w = frame.shape[:2]

    # ── Up-scale tiny frames so MediaPipe can find a face ──────────────
    MIN_DIM = 480
    if w < MIN_DIM or h < MIN_DIM:
        scale = max(MIN_DIM / w, MIN_DIM / h)
        frame = cv2.resize(frame, None, fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)
        h, w = frame.shape[:2]

    # Improve detection: enhance contrast for poor webcam lighting
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l_ch = clahe.apply(l_ch)
    lab = cv2.merge([l_ch, a_ch, b_ch])
    enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    # Also try with brightness boost for very dark images
    rgb = cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)

    face_mesh = _get_face_mesh()
    results = face_mesh.process(rgb)

    # If first attempt fails, try original without enhancement
    if not results.multi_face_landmarks:
        rgb_orig = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_orig)

    # If still no face, try with brightness boost
    if not results.multi_face_landmarks:
        bright = cv2.convertScaleAbs(frame, alpha=1.3, beta=30)
        rgb_bright = cv2.cvtColor(bright, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_bright)

    if not results.multi_face_landmarks:
        return {
            "fatigued": False,
            "ear": None,
            "face_detected": False,
            "reason": "No face detected in frame"
        }

    landmarks = results.multi_face_landmarks[0].landmark

    left_ear  = eye_aspect_ratio(landmarks, LEFT_EYE,  w, h)
    right_ear = eye_aspect_ratio(landmarks, RIGHT_EYE, w, h)
    avg_ear   = round(float((left_ear + right_ear) / 2.0), 4)

    # Below 0.19 = strict drowsy threshold (~85% closed)
    fatigued = bool(avg_ear < 0.19)

    return {
        "fatigued": fatigued,
        "ear": float(avg_ear),
        "left_ear": float(left_ear),
        "right_ear": float(right_ear),
        "face_detected": True,
        "confidence": "high" if avg_ear < 0.20 else "medium" if avg_ear < 0.25 else "low",
        "reason": "Eye aspect ratio below drowsy threshold" if fatigued else "Driver appears alert"
    }
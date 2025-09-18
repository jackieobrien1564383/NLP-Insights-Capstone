import os, threading, csv, io, requests

# Public constants (keep order stable)
MODALITY_ORDER = ["vision","audition","touch","taste","smell",
                  "interoception","hand","mouth","head","foot","torso"]

# Accept common header names
MODALITY_SYNONYMS = {
    "vision":["vision","visual"],
    "audition":["audition","auditory","hearing"],
    "touch":["touch","haptic","tactile"],
    "taste":["taste","gustatory"],
    "smell":["smell","olfactory","olfaction"],
    "interoception":["interoception","interoceptive"],
    "hand":["hand","arm","upperlimb","hand_arm"],
    "mouth":["mouth","throat","orofacial","oral"],
    "head":["head"],
    "foot":["foot","leg","lowerlimb","foot_leg"],
    "torso":["torso","trunk"],
}
WORD_COLUMNS = {"word","item","cue","lemma"}
MODALITY_COLUMNS = {"modality","dimension","channel"}
SCORE_COLUMNS = {"rating","response","score","value"}

NORMS = None   # dict[str, list[float|None]] kept in-memory for fast lookups
READY = False
_LOCK = threading.Lock()

def _canon_mod(x:str|None):
    s = (x or "").strip().lower()
    for k, vs in MODALITY_SYNONYMS.items():
        if s in vs: return k
    return None

def _detect_wide(headers):
    found = set()
    for h in headers:
        m = _canon_mod(h)
        if m: found.add(m)
    return len(found) >= 3

def _first(headers, pool:set[str]):
    L = [h.lower() for h in headers]
    for h in L:
        if h in pool: return h
    return None

def _download_csv_bytes():
    url = os.environ.get("SM_CSV_URL")
    if not url:
        raise RuntimeError("Set SM_CSV_URL to the Lancaster CSV URL (OSF).")
    r = requests.get(url, timeout=90)
    r.raise_for_status()
    return r.content

def _build_norms_from_csv_bytes(b: bytes):
    global NORMS
    # First pass: read headers
    stream = io.StringIO(b.decode("utf-8", errors="ignore"))
    reader = csv.DictReader(stream)
    headers = reader.fieldnames or []
    wide = _detect_wide(headers)

    norms = {}

    if wide:
        word_col = _first(headers, WORD_COLUMNS)
        mod_heads = [h for h in headers if _canon_mod(h)]
        for row in csv.DictReader(io.StringIO(b.decode("utf-8", errors="ignore"))):
            w = (row.get(word_col) or "").strip().lower()
            if not w: continue
            arr = [None]*len(MODALITY_ORDER)
            for h in mod_heads:
                idx = MODALITY_ORDER.index(_canon_mod(h))
                try:
                    v = float(row.get(h)) if row.get(h) not in (None, "") else None
                except ValueError:
                    v = None
                if v is not None: arr[idx] = v
            if any(v is not None for v in arr): norms[w] = arr
    else:
        word_col = _first(headers, WORD_COLUMNS)
        mod_col  = _first(headers, MODALITY_COLUMNS)
        val_col  = _first(headers, SCORE_COLUMNS)
        buckets: dict[str, dict[str, list[float]]] = {}
        for row in csv.DictReader(io.StringIO(b.decode("utf-8", errors="ignore"))):
            w = (row.get(word_col) or "").strip().lower()
            m = _canon_mod(row.get(mod_col))
            try:
                v = float(row.get(val_col))
            except (TypeError, ValueError):
                v = None
            if not w or not m or v is None: continue
            buckets.setdefault(w, {}).setdefault(m, []).append(v)
        for w, mb in buckets.items():
            arr = [None]*len(MODALITY_ORDER)
            for m, vals in mb.items():
                idx = MODALITY_ORDER.index(m)
                arr[idx] = sum(vals)/len(vals)
            if any(v is not None for v in arr): norms[w] = arr

    NORMS = norms

def warm_start():
    # non-blocking background load so boot is snappy on Render
    def _job():
        global READY
        try:
            csv_bytes = _download_csv_bytes()
            _build_norms_from_csv_bytes(csv_bytes)
            READY = True
        except Exception as e:
            # Don't crash the app; stay lazy-loadable.
            print("[sensorimotor] Warm start failed:", e, flush=True)
    threading.Thread(target=_job, daemon=True).start()

def ensure_loaded():
    # Lazy load if warm_start didn’t run yet or failed
    global READY
    if READY and NORMS is not None:
        return
    with _LOCK:
        if READY and NORMS is not None:
            return
        csv_bytes = _download_csv_bytes()
        _build_norms_from_csv_bytes(csv_bytes)
        READY = True

def lookup(words:list[str]):
    """Return (matched_count, profile_list[11])."""
    ensure_loaded()
    totals = [0.0]*len(MODALITY_ORDER)
    matched = 0
    for w in words:
        rec = NORMS.get((w or "").lower())
        if not rec: continue
        matched += 1
        for i, v in enumerate(rec):
            if v is not None:
                totals[i] += v
    profile = [ (totals[i]/matched if matched else 0.0) for i in range(len(MODALITY_ORDER)) ]
    return matched, profile

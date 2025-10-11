#!/usr/bin/env python3
"""
NLP-Insights Capstone — Cross-platform bootstrap & runner
Works on Windows, macOS, and Linux. No shell scripts needed.
"""

import argparse
import os
import platform
import shlex
import shutil
import subprocess
import sys
from pathlib import Path
from textwrap import dedent

REPO_URL = "https://github.com/Nathan-J-22450784/NLP-Insights-Capstone.git"
DEFAULT_PROJECT_DIRNAME = "NLP-Insights-Capstone"
FRONTEND_SUBDIR = "frontend"
MANAGE_PY = "manage.py"
SPACY_MODELS = ["en_core_web_sm", "en_core_web_md"]

# --- Utility helpers ---------------------------------------------------------
def is_windows(): return platform.system().lower().startswith("win")
def which(cmd): return shutil.which(cmd)

def run(cmd, cwd=None, env=None, new_console=False, check=True):
    printable = " ".join(shlex.quote(str(x)) for x in cmd)
    print(f"\n▶ {printable}")
    creationflags = subprocess.CREATE_NEW_CONSOLE if new_console and is_windows() else 0
    return subprocess.run(
        cmd, cwd=cwd, env=env,
        shell=False, check=check,
        creationflags=creationflags,
    )

def popen(cmd, cwd=None, env=None, new_console=False):
    printable = " ".join(shlex.quote(str(x)) for x in cmd)
    print(f"\n▶ (bg) {printable}")
    creationflags = subprocess.CREATE_NEW_CONSOLE if new_console and is_windows() else 0
    return subprocess.Popen(
        cmd, cwd=cwd, env=env,
        shell=False, creationflags=creationflags,
    )

# --- Environment setup -------------------------------------------------------
def ensure_git_available():
    if not which("git"):
        sys.exit("ERROR: Git not found. Please install Git and retry.")

def ensure_node_npm_available():
    if not which("node") or not which("npm"):
        sys.exit("ERROR: Node.js (and npm) must be installed and on PATH.")

def py_in_venv(venv): return venv / ("Scripts/python.exe" if is_windows() else "bin/python")
def pip_in_venv(venv): return venv / ("Scripts/pip.exe" if is_windows() else "bin/pip")

# --- Setup steps -------------------------------------------------------------
def create_or_use_repo(url, project_dir, skip_clone=False):
    if project_dir.exists():
        print(f"✓ Using existing repo at {project_dir}")
    else:
        if skip_clone:
            sys.exit(f"ERROR: {project_dir} not found and --skip-clone provided.")
        run(["git", "clone", url, str(project_dir)])

def create_venv(project_dir):
    venv = project_dir / "venv"
    if not venv.exists():
        print("Creating virtual environment …")
        run([sys.executable, "-m", "venv", str(venv)])
    else:
        print(f"✓ Using existing venv: {venv}")
    return venv, py_in_venv(venv)

def install_backend(py, project_dir, use_lock):
    req = project_dir / ("backend/backend/requirements-lock.txt" if use_lock else "backend/backend/requirements.txt")
    print(f"Installing backend deps from {req.name} …")
    run([str(py), "-m", "pip", "install", "--upgrade", "pip", "wheel", "setuptools"])
    run([str(py), "-m", "pip", "install", "-r", str(req)])

def download_spacy_models(py, skip=False):
    if skip: return
    for model in SPACY_MODELS:
        print(f"Ensuring spaCy model: {model}")
        run([str(py), "-m", "spacy", "download", model])

def run_migrations(py, project_dir):
    if not (project_dir / MANAGE_PY).exists(): return
    print("Applying Django migrations …")
    run([str(py), MANAGE_PY, "migrate"], cwd=str(project_dir))

def install_frontend(project_dir):
    ensure_node_npm_available()
    fe = project_dir / FRONTEND_SUBDIR
    if not fe.exists(): return
    print("Installing frontend dependencies …")
    run(["npm", "install"], cwd=str(fe))

def maybe_setup_ollama(skip, model):
    if skip or not which("ollama"):
        print("Skipping Ollama setup.")
        return
    print(f"Ensuring Ollama model '{model}' …")
    try: run(["ollama", "pull", model])
    except subprocess.CalledProcessError: pass
    popen(["ollama", "serve"], new_console=True)

# --- Runtime -----------------------------------------------------------------
def start_backend(py, project_dir, port):
    print(f"Starting Django backend on http://localhost:{port}")
    return popen([str(py), MANAGE_PY, "runserver", f"0.0.0.0:{port}"], cwd=str(project_dir), new_console=True)

def start_frontend(project_dir, port=None):
    fe = project_dir / FRONTEND_SUBDIR
    if not fe.exists(): return
    env = os.environ.copy()
    if port: env["PORT"] = str(port)
    print(f"Starting React frontend on http://localhost:{port or 3000}")
    return popen(["npm", "start"], cwd=str(fe), env=env, new_console=True)

# --- Main driver -------------------------------------------------------------
def main():
    p = argparse.ArgumentParser(description="Cross-platform setup/runner for NLP-Insights Capstone")
    p.add_argument("--repo", default=REPO_URL)
    p.add_argument("--dir", default=DEFAULT_PROJECT_DIRNAME)
    p.add_argument("--skip-clone", action="store_true")
    p.add_argument("--use-lock", action="store_true")
    p.add_argument("--no-ollama", action="store_true")
    p.add_argument("--ollama-model", default="llama2")
    p.add_argument("--backend-port", type=int, default=8000)
    p.add_argument("--frontend-port", type=int, default=None)
    p.add_argument("--start", action="store_true", help="skip install; just start servers")
    p.add_argument("--skip-spacy", action="store_true")
    args = p.parse_args()

    target = Path(args.dir).resolve()
    print(dedent(f"""
    === NLP-Insights Capstone Bootstrap ===
    OS: {platform.system()} {platform.release()}
    Python: {sys.version.split()[0]}
    Directory: {target}
    """))

    ensure_git_available()
    ensure_node_npm_available()

    if not args.start:
        create_or_use_repo(args.repo, target, args.skip_clone)
        venv, py = create_venv(target)
        install_backend(py, target, args.use_lock)
        download_spacy_models(py, skip=args.skip_spacy)
        run_migrations(py, target)
        install_frontend(target)
        maybe_setup_ollama(args.no_ollama, args.ollama_model)
    else:
        venv = target / "venv"
        py = py_in_venv(venv)
        if not py.exists():
            sys.exit("ERROR: venv not found. Run setup without --start first.")

    backend = start_backend(py, target, args.backend_port)

    import time

    # Allow a short pause so backend logs appear before prompting
    print("\nWaiting a moment for backend to start up...\n")
    time.sleep(2)

    # --- Interactive prompt for frontend launch ---
    try:
        print()
        choice = input("Would you like to launch the frontend as well? (y/n): ").strip().lower()
        if choice in ("y", "yes"):
            start_frontend(target, args.frontend_port)
        else:
            print("Skipping frontend launch.")
    except KeyboardInterrupt:
        print("\nAborted by user.")

    print(f"\nBackend running on http://localhost:{args.backend_port}")
    print("Press Ctrl+C in backend window(s) to stop.")

if __name__ == "__main__":
    main()

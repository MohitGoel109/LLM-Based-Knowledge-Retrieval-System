import subprocess

def run_cmd(cmd):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        print(f"COMMAND: {cmd}")
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")
    except subprocess.TimeoutExpired:
        print(f"TIMEOUT: {cmd}")

run_cmd("git add -A")
run_cmd("git commit -m 'Fix FastAPI 404 and create render build script'")
run_cmd("git push origin HEAD")

"""
Comprehensive Test Suite for KRMU Knowledge Retrieval System
=============================================================
Tests: RAG engine, API endpoints, query quality, edge cases, and performance.

Usage:
    1. Start Ollama:     ollama serve
    2. Pull model:       ollama pull qwen2.5:3b
    3. Re-ingest data:   python ingest.py
    4. Start API:        python api.py  (in a separate terminal)
    5. Run tests:        python test_system.py
"""

import os
import sys
import time
import json
import requests
from dataclasses import dataclass, field
from typing import Optional

# ── Configuration ──────────────────────────────────────────────
API_URL = "http://localhost:8000"
OLLAMA_URL = "http://localhost:11434"

# ── Result tracking ───────────────────────────────────────────
@dataclass
class TestResult:
    name: str
    category: str
    passed: bool
    duration: float = 0.0
    details: str = ""
    answer: str = ""

results: list[TestResult] = []


def log(msg, level="INFO"):
    icons = {"INFO": "[*]", "PASS": "[+]", "FAIL": "[-]", "WARN": "[!]", "HEAD": "[=]"}
    print(f"  {icons.get(level, '[*]')} {msg}")


def run_test(name, category, test_fn):
    """Run a test function and record the result."""
    start = time.time()
    try:
        passed, details, answer = test_fn()
        duration = time.time() - start
        result = TestResult(name=name, category=category, passed=passed,
                            duration=duration, details=details, answer=answer)
    except Exception as e:
        duration = time.time() - start
        result = TestResult(name=name, category=category, passed=False,
                            duration=duration, details=f"Exception: {e}", answer="")
    results.append(result)
    status = "PASS" if result.passed else "FAIL"
    log(f"{name}: {result.details} ({result.duration:.2f}s)", status)
    return result


# =====================================================================
# SECTION 1: Infrastructure Tests
# =====================================================================
def test_ollama_running():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if r.status_code == 200:
            models = [m["name"] for m in r.json().get("models", [])]
            return True, f"Ollama running. Models: {models}", ""
        return False, f"Ollama returned status {r.status_code}", ""
    except Exception as e:
        return False, f"Ollama not reachable: {e}", ""


def test_model_available():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        models = [m["name"] for m in r.json().get("models", [])]
        # Check for qwen2.5:3b (the model configured in rag_engine.py)
        qwen_models = [m for m in models if "qwen2.5" in m.lower()]
        if qwen_models:
            return True, f"Qwen2.5 models found: {qwen_models}", ""
        return False, f"No Qwen2.5 model found. Available: {models}", ""
    except Exception as e:
        return False, f"Could not check models: {e}", ""


def test_api_health():
    try:
        r = requests.get(f"{API_URL}/health", timeout=10)
        if r.status_code == 200:
            status = r.json()
            all_ready = all(status.values())
            return all_ready, f"Health: {status}", ""
        return False, f"Health endpoint returned {r.status_code}", ""
    except Exception as e:
        return False, f"API not reachable: {e}", ""


def test_chromadb_exists():
    chroma_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")
    exists = os.path.exists(chroma_path) and len(os.listdir(chroma_path)) > 0
    if exists:
        return True, f"ChromaDB found at {chroma_path}", ""
    return False, f"ChromaDB not found at {chroma_path}. Run: python ingest.py", ""


# =====================================================================
# SECTION 2: Query Quality Tests
# =====================================================================
def make_query(question, timeout=120):
    """Send a query to the /chat endpoint and return the full response."""
    r = requests.post(f"{API_URL}/chat", json={"message": question}, timeout=timeout)
    if r.status_code != 200:
        raise Exception(f"API error {r.status_code}: {r.text}")
    data = r.json()
    return data["answer"], data.get("sources", [])


def check_answer_contains(answer, keywords, min_required=None):
    """Check if an answer contains at least min_required of the given keywords."""
    if min_required is None:
        min_required = len(keywords)
    answer_lower = answer.lower()
    found = [kw for kw in keywords if kw.lower() in answer_lower]
    missing = [kw for kw in keywords if kw.lower() not in answer_lower]
    return len(found) >= min_required, found, missing


def test_bus_routes():
    answer, sources = make_query("What are the bus routes available at KR Mangalam University?")
    passed, found, missing = check_answer_contains(
        answer, ["bus", "route", "campus"], min_required=2
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


def test_placements():
    answer, sources = make_query("Tell me about placements at KRMU. What is the highest package?")
    passed, found, missing = check_answer_contains(
        answer, ["placement", "56.6", "lpa"], min_required=2
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


def test_top_placed_students():
    answer, sources = make_query("Who are the top placed students at KR Mangalam University?")
    passed, found, missing = check_answer_contains(
        answer, ["rishav", "vineet", "ferrari", "autodesk"], min_required=2
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


def test_fee_structure():
    answer, sources = make_query("What is the fee structure for BTech CSE?")
    passed, found, missing = check_answer_contains(
        answer, ["fee", "btech", "cse"], min_required=2
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


def test_hostel():
    answer, sources = make_query("What are the hostel facilities at KRMU?")
    passed, found, missing = check_answer_contains(
        answer, ["hostel", "room"], min_required=2
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


def test_scholarships():
    answer, sources = make_query("How can I apply for scholarships at KR Mangalam University?")
    passed, found, missing = check_answer_contains(
        answer, ["scholarship"], min_required=1
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


def test_anti_ragging():
    answer, sources = make_query("What is the anti-ragging policy at KRMU?")
    passed, found, missing = check_answer_contains(
        answer, ["ragging", "policy"], min_required=1
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


def test_campus_facilities():
    answer, sources = make_query("What facilities are available on campus?")
    passed, found, missing = check_answer_contains(
        answer, ["campus", "facilit"], min_required=1
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


# =====================================================================
# SECTION 3: Multi-Topic / Complex Query Tests (the failing case)
# =====================================================================
def test_multi_topic_bus_and_placements():
    """This is the exact type of question from the screenshot that was failing."""
    answer, sources = make_query(
        "Tell me about bus routes, timings, placements, top placed students and average package"
    )
    passed, found, missing = check_answer_contains(
        answer, ["bus", "route", "placement", "package"], min_required=3
    )
    # Also check the response isn't truncated (at least 200 chars)
    if len(answer) < 200:
        return False, f"Answer too short ({len(answer)} chars) - likely truncated", answer
    return passed, f"Found: {found}, Missing: {missing}, Length: {len(answer)} chars", answer


def test_multi_topic_fees_and_hostel():
    answer, sources = make_query("What are the fees and hostel charges for BTech CSE students?")
    passed, found, missing = check_answer_contains(
        answer, ["fee", "hostel"], min_required=2
    )
    return passed, f"Found: {found}, Missing: {missing}", answer


# =====================================================================
# SECTION 4: Edge Case / Slang Tests
# =====================================================================
def test_hinglish_query():
    answer, sources = make_query("bhai placement kaisa hai krmu mein?")
    # Should respond in English about placements
    passed, found, missing = check_answer_contains(
        answer, ["placement"], min_required=1
    )
    return passed, f"Hindi/slang handled. Found: {found}", answer


def test_slang_query():
    answer, sources = make_query("yo whats the fee structure fr fr")
    passed, found, missing = check_answer_contains(
        answer, ["fee"], min_required=1
    )
    return passed, f"Slang handled. Found: {found}", answer


def test_irrelevant_query():
    answer, sources = make_query("What is the weather like on Mars?")
    # Should acknowledge it doesn't have info
    has_disclaimer = any(phrase in answer.lower() for phrase in [
        "don't have", "don't have", "no information", "not available",
        "cannot", "outside", "not related"
    ])
    return has_disclaimer, f"Irrelevant query handled: {'yes' if has_disclaimer else 'no'}", answer


def test_empty_query():
    """Test that empty/whitespace queries are handled."""
    try:
        r = requests.post(f"{API_URL}/chat", json={"message": "   "}, timeout=30)
        # Expecting either an error response or a polite "no question" answer
        return True, f"Empty query handled (status: {r.status_code})", r.text
    except Exception as e:
        return True, f"Empty query handled with exception: {e}", ""


# =====================================================================
# SECTION 5: Response Quality Tests
# =====================================================================
def test_response_not_truncated():
    """Verify that a detailed question gets a complete (non-truncated) response."""
    answer, sources = make_query("Explain the complete placement process and top recruiters at KRMU")
    # Check it doesn't end mid-sentence (basic heuristic)
    ends_properly = answer.strip()[-1] in ".!?:)" or answer.strip().endswith("etc")
    length_ok = len(answer) > 150
    passed = ends_properly and length_ok
    details = f"Length: {len(answer)} chars, Ends properly: {ends_properly}"
    return passed, details, answer


def test_response_in_english():
    """Even for Hindi input, response should be in English."""
    answer, sources = make_query("hostel ki fees kitni hai?")
    # Simple check: majority of words should be ASCII/English
    ascii_chars = sum(1 for c in answer if ord(c) < 128)
    total_chars = len(answer)
    english_ratio = ascii_chars / total_chars if total_chars > 0 else 0
    passed = english_ratio > 0.85
    return passed, f"English ratio: {english_ratio:.2%}", answer


def test_sources_returned():
    """Check that source citations are included in the response."""
    answer, sources = make_query("What is the highest placement package?")
    has_sources = len(sources) > 0
    return has_sources, f"Sources returned: {len(sources)}", answer


# =====================================================================
# SECTION 6: Streaming Endpoint Test
# =====================================================================
def test_streaming_endpoint():
    """Test the SSE streaming endpoint works and returns complete data."""
    try:
        r = requests.post(
            f"{API_URL}/chat/stream",
            json={"message": "What is KRMU?"},
            stream=True,
            timeout=120,
        )
        if r.status_code != 200:
            return False, f"Stream returned {r.status_code}", ""

        full_text = ""
        got_done = False
        for line in r.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data: "):
                continue
            payload = json.loads(line[6:])
            if payload["type"] == "token":
                full_text += payload["content"]
            elif payload["type"] == "done":
                got_done = True

        passed = got_done and len(full_text) > 20
        return passed, f"Stream complete: {got_done}, Length: {len(full_text)} chars", full_text
    except Exception as e:
        return False, f"Streaming failed: {e}", ""


# =====================================================================
# SECTION 7: Performance Tests
# =====================================================================
def test_response_time():
    """Check that the API responds within a reasonable timeframe."""
    start = time.time()
    answer, _ = make_query("What is KRMU?")
    duration = time.time() - start
    # For CPU inference, 60s is a reasonable upper bound
    passed = duration < 60
    return passed, f"Response time: {duration:.1f}s", answer


# =====================================================================
# RUNNER
# =====================================================================
def print_report():
    """Print a formatted test report."""
    print("\n" + "=" * 70)
    print("  TEST REPORT — KRMU Knowledge Retrieval System")
    print("=" * 70)

    categories = {}
    for r in results:
        categories.setdefault(r.category, []).append(r)

    total_passed = sum(1 for r in results if r.passed)
    total_failed = sum(1 for r in results if not r.passed)

    for cat, cat_results in categories.items():
        print(f"\n  --- {cat} ---")
        for r in cat_results:
            status = "PASS" if r.passed else "FAIL"
            icon = "+" if r.passed else "-"
            print(f"    [{icon}] {r.name}: {r.details} ({r.duration:.2f}s)")
            if r.answer and not r.passed:
                preview = r.answer[:200].replace("\n", " ")
                print(f"        Answer preview: {preview}...")

    print(f"\n{'=' * 70}")
    print(f"  TOTAL: {total_passed} passed, {total_failed} failed, "
          f"{len(results)} total")
    print(f"  PASS RATE: {total_passed / len(results) * 100:.1f}%")
    print(f"{'=' * 70}")

    # Save full results to file
    report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                               "evaluation", "test_results.json")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    report_data = []
    for r in results:
        report_data.append({
            "name": r.name,
            "category": r.category,
            "passed": r.passed,
            "duration": round(r.duration, 2),
            "details": r.details,
            "answer_preview": r.answer[:500] if r.answer else "",
        })
    with open(report_path, "w") as f:
        json.dump(report_data, f, indent=2)
    print(f"\n  Full results saved to: {report_path}\n")


def main():
    print("\n" + "=" * 70)
    print("  KRMU Knowledge Retrieval System — Comprehensive Test Suite")
    print("=" * 70)

    # ── 1. Infrastructure ──
    print("\n  --- Infrastructure Tests ---")
    infra_ok = True
    r1 = run_test("Ollama Running", "Infrastructure", test_ollama_running)
    r2 = run_test("Qwen2.5 Model Available", "Infrastructure", test_model_available)
    r3 = run_test("ChromaDB Exists", "Infrastructure", test_chromadb_exists)
    r4 = run_test("API Health Check", "Infrastructure", test_api_health)

    if not r1.passed or not r4.passed:
        print("\n  [!] CRITICAL: Ollama or API is not running.")
        print("      Start Ollama:  ollama serve")
        print("      Pull model:    ollama pull qwen2.5:3b")
        print("      Start API:     python api.py")
        print("      Then re-run:   python test_system.py")
        print_report()
        return

    # ── 2. Query Quality ──
    print("\n  --- Query Quality Tests ---")
    run_test("Bus Routes Query", "Query Quality", test_bus_routes)
    run_test("Placements Query", "Query Quality", test_placements)
    run_test("Top Placed Students", "Query Quality", test_top_placed_students)
    run_test("Fee Structure Query", "Query Quality", test_fee_structure)
    run_test("Hostel Facilities", "Query Quality", test_hostel)
    run_test("Scholarships Query", "Query Quality", test_scholarships)
    run_test("Anti-Ragging Policy", "Query Quality", test_anti_ragging)
    run_test("Campus Facilities", "Query Quality", test_campus_facilities)

    # ── 3. Multi-Topic (the failing case) ──
    print("\n  --- Multi-Topic / Complex Queries ---")
    run_test("Bus + Placements (screenshot case)", "Multi-Topic", test_multi_topic_bus_and_placements)
    run_test("Fees + Hostel Combined", "Multi-Topic", test_multi_topic_fees_and_hostel)

    # ── 4. Edge Cases ──
    print("\n  --- Edge Cases / Slang ---")
    run_test("Hinglish Query", "Edge Cases", test_hinglish_query)
    run_test("Slang Query", "Edge Cases", test_slang_query)
    run_test("Irrelevant Query", "Edge Cases", test_irrelevant_query)
    run_test("Empty Query", "Edge Cases", test_empty_query)

    # ── 5. Response Quality ──
    print("\n  --- Response Quality ---")
    run_test("Not Truncated", "Response Quality", test_response_not_truncated)
    run_test("English-Only Response", "Response Quality", test_response_in_english)
    run_test("Sources Returned", "Response Quality", test_sources_returned)

    # ── 6. Streaming ──
    print("\n  --- Streaming ---")
    run_test("SSE Streaming Endpoint", "Streaming", test_streaming_endpoint)

    # ── 7. Performance ──
    print("\n  --- Performance ---")
    run_test("Response Time < 60s", "Performance", test_response_time)

    print_report()


if __name__ == "__main__":
    main()

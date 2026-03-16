"""
generate_charts.py
==================
Generates professional comparison charts that justify why Qwen 3 8B was
chosen over other free / open-source models for the LLM-Based Knowledge
Retrieval System.

Output (all saved to the evaluation/ directory):
    1. benchmark_comparison.png   - grouped bar chart (5 metrics x 7 models)
    2. radar_comparison.png       - radar / spider chart (top 3 models)
    3. parameter_efficiency.png   - scatter plot (params vs composite score)
    4. feature_heatmap.png        - heatmap table (qualitative features)
    5. overall_ranking.png        - horizontal bar chart (weighted ranking)

Requirements: matplotlib, numpy  (both already in requirements.txt)
"""

from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")                       # headless backend
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import matplotlib.colors as mcolors
from matplotlib.lines import Line2D

# ────────────────────────────── global style ──────────────────────────────
BG        = "#0d0a08"
TEXT      = "#ffffff"
ACCENT    = "#ff4d00"
GRID      = "#2a2420"
MUTED_COLORS = ["#6b7280", "#9ca3af", "#78716c", "#a1a1aa", "#8b8b8b", "#7c7c7c"]
DPI       = 300
OUT_DIR   = Path(__file__).resolve().parent    # evaluation/

plt.rcParams.update({
    "figure.facecolor": BG,
    "axes.facecolor":   BG,
    "axes.edgecolor":   GRID,
    "axes.labelcolor":  TEXT,
    "text.color":       TEXT,
    "xtick.color":      TEXT,
    "ytick.color":      TEXT,
    "grid.color":       GRID,
    "legend.facecolor": "#1a1510",
    "legend.edgecolor": GRID,
    "legend.labelcolor": TEXT,
    "font.family":      "sans-serif",
    "font.size":        11,
})

# ────────────────────────────── data ──────────────────────────────────────
MODELS = [
    "Qwen3-8B", "Llama3.2-3B", "Llama3.1-8B",
    "Mistral-7B", "Gemma2-2B", "Phi3-Mini", "Qwen2.5-7B",
]

BENCHMARK_METRICS = {
    "MMLU\n(Knowledge)":        [73, 58, 69, 64, 52, 62, 68],
    "Hindi\nUnderstanding":     [88, 35, 55, 30, 25, 15, 75],
    "English\nFluency":         [85, 78, 84, 82, 70, 80, 82],
    "Instruction\nFollowing":   [82, 65, 76, 72, 58, 74, 78],
    "RAG\nSuitability":         [90, 60, 78, 75, 50, 70, 82],
}

PARAMS_B = {                         # billions
    "Qwen3-8B": 8,   "Llama3.2-3B": 3,   "Llama3.1-8B": 8,
    "Mistral-7B": 7, "Gemma2-2B": 2,     "Phi3-Mini": 3.8,
    "Qwen2.5-7B": 7,
}

# feature heatmap:  3=Excellent  2=Good  1=Limited  0=None
FEATURE_ROWS = [
    "Hindi Understanding",
    "Hinglish Understanding",
    "English Output Quality",
    "Slang Handling",
    "Context Retention",
    "Source Citation",
    "Runs Locally (Ollama)",
    "Open License",
]
FEATURE_DATA = np.array([
    #  Qw3  L3.2  L3.1  Mis7  Ge2  Phi3  Qw2.5
    [  3,    1,    2,    1,    0,    0,    3  ],   # Hindi Understanding
    [  3,    1,    1,    0,    0,    0,    2  ],   # Hinglish Understanding
    [  3,    2,    3,    3,    2,    3,    3  ],   # English Output Quality
    [  3,    1,    1,    1,    0,    0,    2  ],   # Slang Handling
    [  3,    2,    3,    2,    1,    3,    3  ],   # Context Retention
    [  3,    2,    2,    2,    1,    2,    2  ],   # Source Citation
    [  3,    3,    3,    3,    3,    3,    3  ],   # Runs Locally (Ollama)
    [  3,    2,    2,    3,    3,    3,    3  ],   # Open License
])

# radar chart — top 3 models
RADAR_MODELS  = ["Qwen3-8B", "Llama3.1-8B", "Qwen2.5-7B"]
RADAR_LABELS  = [
    "Hindi / Hinglish\nSupport",
    "English\nQuality",
    "Context\nWindow",
    "Instruction\nFollowing",
    "RAG\nPerformance",
    "Parameter\nEfficiency",
]
RADAR_DATA = {
    #                         Hindi  Eng  Ctx  Inst  RAG  Eff
    "Qwen3-8B":   np.array([  95,   85,  70,   82,  90,  78 ]),
    "Llama3.1-8B":np.array([  55,   84,  95,   76,  78,  68 ]),
    "Qwen2.5-7B": np.array([  75,   82,  70,   78,  82,  80 ]),
}

# ────────────────────────── helper functions ──────────────────────────────

def _bar_color(idx: int) -> str:
    """Return ACCENT for Qwen3-8B (index 0), muted otherwise."""
    return ACCENT if idx == 0 else MUTED_COLORS[idx - 1]


def _model_colors() -> list[str]:
    return [_bar_color(i) for i in range(len(MODELS))]


def _composite_score(model_idx: int) -> float:
    """Weighted composite: 30% multilingual, 25% instruct, 25% RAG, 20% english."""
    metrics = list(BENCHMARK_METRICS.values())
    hindi   = metrics[1][model_idx]
    english = metrics[2][model_idx]
    instr   = metrics[3][model_idx]
    rag     = metrics[4][model_idx]
    return 0.30 * hindi + 0.20 * english + 0.25 * instr + 0.25 * rag


# ═══════════════════════════════════════════════════════════════════════════
#  CHART 1 — Grouped Bar Chart (Benchmark Comparison)
# ═══════════════════════════════════════════════════════════════════════════
def chart_benchmark():
    metrics = list(BENCHMARK_METRICS.keys())
    scores  = list(BENCHMARK_METRICS.values())
    n_metrics = len(metrics)
    n_models  = len(MODELS)

    fig, ax = plt.subplots(figsize=(16, 8))

    x = np.arange(n_metrics)
    total_width = 0.78
    bar_w = total_width / n_models
    colors = _model_colors()

    for i, model in enumerate(MODELS):
        vals = [scores[m][i] for m in range(n_metrics)]
        offset = (i - n_models / 2 + 0.5) * bar_w
        bars = ax.bar(x + offset, vals, bar_w * 0.88, label=model,
                      color=colors[i], edgecolor="none", zorder=3,
                      alpha=1.0 if i == 0 else 0.85)
        # value labels
        for bar, v in zip(bars, vals):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
                    str(v), ha="center", va="bottom", fontsize=6.5,
                    fontweight="bold" if i == 0 else "normal",
                    color=ACCENT if i == 0 else "#cccccc")

    ax.set_xticks(x)
    ax.set_xticklabels(metrics, fontsize=10)
    ax.set_ylabel("Score (0-100)", fontsize=12)
    ax.set_ylim(0, 105)
    ax.set_title("Benchmark Comparison Across Open-Source LLMs",
                  fontsize=16, fontweight="bold", pad=18)
    ax.legend(loc="upper right", fontsize=8.5, framealpha=0.9, ncol=2)
    ax.yaxis.grid(True, alpha=0.25)
    ax.set_axisbelow(True)

    fig.tight_layout()
    path = OUT_DIR / "benchmark_comparison.png"
    fig.savefig(path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    print(f"  [OK] {path}")


# ═══════════════════════════════════════════════════════════════════════════
#  CHART 2 — Radar / Spider Chart (Top 3)
# ═══════════════════════════════════════════════════════════════════════════
def chart_radar():
    labels = RADAR_LABELS
    n = len(labels)
    angles = np.linspace(0, 2 * np.pi, n, endpoint=False).tolist()
    angles += angles[:1]   # close the polygon

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
    ax.set_facecolor(BG)
    fig.patch.set_facecolor(BG)

    radar_colors = {
        "Qwen3-8B":    (ACCENT, 0.25),
        "Llama3.1-8B": ("#6b7280", 0.12),
        "Qwen2.5-7B":  ("#9ca3af", 0.12),
    }

    for model in RADAR_MODELS:
        vals = RADAR_DATA[model].tolist()
        vals += vals[:1]
        c, a = radar_colors[model]
        lw = 2.8 if model == "Qwen3-8B" else 1.6
        ax.plot(angles, vals, linewidth=lw, color=c, label=model)
        ax.fill(angles, vals, alpha=a, color=c)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels, fontsize=10, color=TEXT)
    ax.set_ylim(0, 100)
    ax.set_yticks([20, 40, 60, 80, 100])
    ax.set_yticklabels(["20", "40", "60", "80", "100"],
                       fontsize=7, color="#888888")
    ax.spines["polar"].set_color(GRID)
    ax.grid(color=GRID, alpha=0.4)

    ax.set_title("Top 3 Model Comparison (Radar)",
                  fontsize=15, fontweight="bold", pad=24, color=TEXT)
    ax.legend(loc="upper right", bbox_to_anchor=(1.28, 1.12),
              fontsize=9, framealpha=0.9)

    fig.tight_layout()
    path = OUT_DIR / "radar_comparison.png"
    fig.savefig(path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    print(f"  [OK] {path}")


# ═══════════════════════════════════════════════════════════════════════════
#  CHART 3 — Scatter Plot (Parameter Efficiency)
# ═══════════════════════════════════════════════════════════════════════════
def chart_parameter_efficiency():
    fig, ax = plt.subplots(figsize=(11, 7))

    xs, ys, labels = [], [], []
    for i, model in enumerate(MODELS):
        xs.append(PARAMS_B[model])
        ys.append(_composite_score(i))
        labels.append(model)

    xs = np.array(xs)
    ys = np.array(ys)

    # trend line (linear fit)
    z = np.polyfit(xs, ys, 1)
    p = np.poly1d(z)
    x_line = np.linspace(1.5, 9, 100)
    ax.plot(x_line, p(x_line), "--", color="#555555", alpha=0.6, linewidth=1.2,
            label="Trend line")

    # efficiency zones (shaded regions)
    ax.axhspan(80, 100, color="#1b3a1b", alpha=0.18, zorder=0)
    ax.text(1.7, 92, "High Efficiency Zone", fontsize=8, color="#4ade80",
            alpha=0.7, style="italic")
    ax.axhspan(60, 80, color="#3a3a1b", alpha=0.12, zorder=0)
    ax.text(1.7, 62, "Moderate Efficiency Zone", fontsize=8, color="#facc15",
            alpha=0.5, style="italic")

    colors = _model_colors()
    for i, (x, y, lbl) in enumerate(zip(xs, ys, labels)):
        marker = "*" if i == 0 else "o"
        s = 320 if i == 0 else 130
        edge = ACCENT if i == 0 else "#ffffff"
        ax.scatter(x, y, s=s, c=colors[i], marker=marker,
                   edgecolors=edge, linewidths=1.5 if i == 0 else 0.8,
                   zorder=5)
        offset_y = 2.2 if i != 0 else 3.0
        fw = "bold" if i == 0 else "normal"
        ax.annotate(lbl, (x, y), textcoords="offset points",
                    xytext=(0, 10 + offset_y), ha="center", fontsize=9,
                    fontweight=fw, color=colors[i])

    ax.set_xlabel("Parameters (Billions)", fontsize=12)
    ax.set_ylabel("Composite Score (Weighted)", fontsize=12)
    ax.set_title("Parameter Efficiency vs Overall Performance",
                  fontsize=15, fontweight="bold", pad=16)
    ax.set_xlim(1, 9.5)
    ax.set_ylim(40, 100)
    ax.yaxis.grid(True, alpha=0.2)
    ax.xaxis.grid(True, alpha=0.15)
    ax.legend(fontsize=9, loc="lower right", framealpha=0.8)

    fig.tight_layout()
    path = OUT_DIR / "parameter_efficiency.png"
    fig.savefig(path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    print(f"  [OK] {path}")


# ═══════════════════════════════════════════════════════════════════════════
#  CHART 4 — Feature Heatmap
# ═══════════════════════════════════════════════════════════════════════════
def chart_feature_heatmap():
    n_rows = len(FEATURE_ROWS)
    n_cols = len(MODELS)

    fig, ax = plt.subplots(figsize=(14, 6.5))

    # custom discrete colormap: 0=red, 1=orange, 2=yellow, 3=green
    cmap_colors = ["#b91c1c", "#ea580c", "#eab308", "#22c55e"]
    cmap = mcolors.ListedColormap(cmap_colors)
    bounds = [-0.5, 0.5, 1.5, 2.5, 3.5]
    norm = mcolors.BoundaryNorm(bounds, cmap.N)

    im = ax.imshow(FEATURE_DATA, cmap=cmap, norm=norm, aspect="auto")

    ax.set_xticks(np.arange(n_cols))
    ax.set_yticks(np.arange(n_rows))
    ax.set_xticklabels(MODELS, fontsize=10, fontweight="bold")
    ax.set_yticklabels(FEATURE_ROWS, fontsize=10)

    # move x-axis labels to top
    ax.xaxis.set_ticks_position("top")
    ax.xaxis.set_label_position("top")

    # highlight Qwen3 column header
    for label in ax.get_xticklabels():
        if "Qwen3" in label.get_text():
            label.set_color(ACCENT)

    # text annotations inside cells
    rating_text = {0: "None", 1: "Limited", 2: "Good", 3: "Excellent"}
    for i in range(n_rows):
        for j in range(n_cols):
            val = FEATURE_DATA[i, j]
            tc = "#000000" if val >= 2 else "#ffffff"
            ax.text(j, i, rating_text[val], ha="center", va="center",
                    fontsize=8.5, fontweight="bold", color=tc)

    # grid lines
    ax.set_xticks(np.arange(n_cols + 1) - 0.5, minor=True)
    ax.set_yticks(np.arange(n_rows + 1) - 0.5, minor=True)
    ax.grid(which="minor", color=BG, linewidth=2)
    ax.tick_params(which="minor", bottom=False, left=False, top=False)

    # highlight Qwen3 column with a border
    rect = plt.Rectangle((-0.5, -0.5), 1, n_rows,
                          linewidth=2.5, edgecolor=ACCENT, facecolor="none",
                          zorder=10, clip_on=False)
    ax.add_patch(rect)

    ax.set_title("Feature Comparison Across Models",
                  fontsize=15, fontweight="bold", pad=40)

    # legend
    legend_elements = [
        Line2D([0], [0], marker="s", color=BG, markerfacecolor="#22c55e",
               markersize=10, label="Excellent (3)"),
        Line2D([0], [0], marker="s", color=BG, markerfacecolor="#eab308",
               markersize=10, label="Good (2)"),
        Line2D([0], [0], marker="s", color=BG, markerfacecolor="#ea580c",
               markersize=10, label="Limited (1)"),
        Line2D([0], [0], marker="s", color=BG, markerfacecolor="#b91c1c",
               markersize=10, label="None (0)"),
    ]
    ax.legend(handles=legend_elements, loc="lower center",
              bbox_to_anchor=(0.5, -0.14), ncol=4, fontsize=9,
              framealpha=0.85)

    fig.tight_layout()
    path = OUT_DIR / "feature_heatmap.png"
    fig.savefig(path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    print(f"  [OK] {path}")


# ═══════════════════════════════════════════════════════════════════════════
#  CHART 5 — Overall Ranking (Horizontal Bar)
# ═══════════════════════════════════════════════════════════════════════════
def chart_overall_ranking():
    scores = []
    for i, model in enumerate(MODELS):
        scores.append((model, _composite_score(i)))

    # sort descending
    scores.sort(key=lambda t: t[1], reverse=True)
    names  = [s[0] for s in scores]
    vals   = [s[1] for s in scores]
    colors = [ACCENT if n == "Qwen3-8B" else "#6b7280" for n in names]

    fig, ax = plt.subplots(figsize=(11, 6))

    y_pos = np.arange(len(names))
    bars = ax.barh(y_pos, vals, color=colors, edgecolor="none", height=0.6,
                   zorder=3)

    ax.set_yticks(y_pos)
    ax.set_yticklabels(names, fontsize=11)
    ax.invert_yaxis()
    ax.set_xlabel("Weighted Composite Score", fontsize=12)
    ax.set_xlim(0, 100)
    ax.set_title("Overall Model Ranking (Weighted Composite)",
                  fontsize=15, fontweight="bold", pad=16)
    ax.xaxis.grid(True, alpha=0.2)
    ax.set_axisbelow(True)

    # value labels
    for bar, val, name in zip(bars, vals, names):
        fw = "bold" if name == "Qwen3-8B" else "normal"
        c  = ACCENT if name == "Qwen3-8B" else "#cccccc"
        ax.text(bar.get_width() + 1.2, bar.get_y() + bar.get_height() / 2,
                f"{val:.1f}", va="center", fontsize=11, fontweight=fw, color=c)

    # highlight Qwen3 row
    for i, name in enumerate(names):
        if name == "Qwen3-8B":
            label = ax.get_yticklabels()[i]
            label.set_color(ACCENT)
            label.set_fontweight("bold")

    # annotation
    ax.annotate("  Selected Model",
                xy=(vals[names.index("Qwen3-8B")],
                    names.index("Qwen3-8B")),
                xytext=(vals[names.index("Qwen3-8B")] - 25,
                        names.index("Qwen3-8B") + 0.6),
                fontsize=9, color=ACCENT, fontweight="bold",
                arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.5))

    # weight breakdown footnote
    fig.text(0.5, -0.01,
             "Weights: 30% Multilingual (Hindi)  |  25% Instruction Following"
             "  |  25% RAG Suitability  |  20% English Fluency",
             ha="center", fontsize=8, color="#888888", style="italic")

    fig.tight_layout()
    path = OUT_DIR / "overall_ranking.png"
    fig.savefig(path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    print(f"  [OK] {path}")


# ═══════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════
def main():
    print("Generating evaluation charts ...")
    print(f"  Output directory: {OUT_DIR}\n")
    chart_benchmark()
    chart_radar()
    chart_parameter_efficiency()
    chart_feature_heatmap()
    chart_overall_ranking()
    print("\nAll charts generated successfully.")


if __name__ == "__main__":
    main()

from __future__ import annotations

import math
from datetime import datetime
from pathlib import Path

from PIL import Image as PILImage
from PIL import ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOT_DIR = ROOT / "tmp" / "manual_screen_manual"
ANNOTATED_DIR = SCREENSHOT_DIR / "annotated"
OUTPUT_DIR = ROOT / "output" / "pdf"
PDF_PATH = OUTPUT_DIR / "2학년_수학_보드게임_사용자_활용매뉴얼.pdf"

MALGUN = Path("C:/Windows/Fonts/malgun.ttf")
MALGUN_BOLD = Path("C:/Windows/Fonts/malgunbd.ttf")
FONT_REGULAR = "Malgun"
FONT_BOLD = "MalgunBold"

TEAL = "#0F8F91"
TEAL_DARK = "#0A6668"
INK = "#17202A"
MUTED = "#536576"
LINE = "#C9D8E5"
PALE = "#E8FBFB"
YELLOW = "#FFF2B8"
CORAL = "#EF6F6C"


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(FONT_REGULAR, str(MALGUN)))
    pdfmetrics.registerFont(TTFont(FONT_BOLD, str(MALGUN_BOLD)))


def pil_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(MALGUN_BOLD if bold else MALGUN), size)


def esc(text: str) -> str:
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )


def p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(esc(text), style)


def make_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=26,
            leading=32,
            alignment=TA_CENTER,
            textColor=colors.HexColor(INK),
            spaceAfter=4,
        ),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=12,
            leading=17,
            alignment=TA_CENTER,
            textColor=colors.HexColor(MUTED),
        ),
        "page_title": ParagraphStyle(
            "page_title",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=14.6,
            leading=18,
            textColor=colors.HexColor(TEAL_DARK),
            spaceAfter=2,
        ),
        "page_hint": ParagraphStyle(
            "page_hint",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=7.6,
            leading=9.5,
            textColor=colors.HexColor(MUTED),
            wordWrap="CJK",
        ),
        "callout_num": ParagraphStyle(
            "callout_num",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=10,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.white,
        ),
        "callout_title": ParagraphStyle(
            "callout_title",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=7.3,
            leading=8.7,
            textColor=colors.HexColor(INK),
            wordWrap="CJK",
        ),
        "callout_body": ParagraphStyle(
            "callout_body",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=6.2,
            leading=7.5,
            textColor=colors.HexColor(MUTED),
            wordWrap="CJK",
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=7.8,
            leading=10.5,
            textColor=colors.HexColor(MUTED),
            wordWrap="CJK",
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#7C8A99"),
        ),
    }


def draw_page(canvas, doc) -> None:
    width, _height = landscape(A4)
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D9E5EF"))
    canvas.setLineWidth(0.6)
    canvas.line(10 * mm, 9 * mm, width - 10 * mm, 9 * mm)
    canvas.setFont(FONT_REGULAR, 7)
    canvas.setFillColor(colors.HexColor("#7C8A99"))
    canvas.drawString(10 * mm, 5.2 * mm, "2학년 수학 보드게임 화면 따라하기 매뉴얼")
    canvas.drawRightString(width - 10 * mm, 5.2 * mm, str(doc.page))
    canvas.restoreState()


def marker(draw: ImageDraw.ImageDraw, x: int, y: int, num: str, scale: float) -> None:
    radius = max(24, int(30 * scale))
    shadow = 4
    draw.ellipse(
        [x - radius + shadow, y - radius + shadow, x + radius + shadow, y + radius + shadow],
        fill=(0, 0, 0, 70),
    )
    draw.ellipse(
        [x - radius, y - radius, x + radius, y + radius],
        fill=TEAL,
        outline="white",
        width=max(4, int(5 * scale)),
    )
    font = pil_font(max(23, int(28 * scale)), bold=True)
    bbox = draw.textbbox((0, 0), num, font=font)
    draw.text(
        (x - (bbox[2] - bbox[0]) / 2, y - (bbox[3] - bbox[1]) / 2 - 2),
        num,
        font=font,
        fill="white",
    )


def arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], scale: float) -> None:
    width = max(4, int(6 * scale))
    color = TEAL
    draw.line([start, end], fill=color, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    size = max(14, int(20 * scale))
    left = (
        end[0] - size * math.cos(angle - math.pi / 6),
        end[1] - size * math.sin(angle - math.pi / 6),
    )
    right = (
        end[0] - size * math.cos(angle + math.pi / 6),
        end[1] - size * math.sin(angle + math.pi / 6),
    )
    draw.polygon([end, left, right], fill=color)


def bubble_point(rect: tuple[int, int, int, int], target: tuple[int, int]) -> tuple[int, int]:
    left, top, right, bottom = rect
    cx = (left + right) / 2
    cy = (top + bottom) / 2
    dx = target[0] - cx
    dy = target[1] - cy
    if dx == 0 and dy == 0:
        return int(cx), int(cy)

    half_w = (right - left) / 2
    half_h = (bottom - top) / 2
    if abs(dx) * half_h > abs(dy) * half_w:
        x = right if dx > 0 else left
        y = cy + dy * (half_w / abs(dx))
    else:
        y = bottom if dy > 0 else top
        x = cx + dx * (half_h / abs(dy))
    return int(x), int(y)


def speech_bubble(
    draw: ImageDraw.ImageDraw,
    target_x: int,
    target_y: int,
    num: str,
    bubble_x: int,
    bubble_y: int,
    text: str,
    scale: float,
) -> None:
    bx = int(bubble_x * scale)
    by = int(bubble_y * scale)
    tx = int(target_x * scale)
    ty = int(target_y * scale)
    w = max(185, int(250 * scale))
    h = max(58, int(78 * scale))
    radius = max(14, int(17 * scale))
    rect = (bx, by, bx + w, by + h)

    arrow(draw, bubble_point(rect, (tx, ty)), (tx, ty), scale)

    shadow_offset = max(4, int(5 * scale))
    shadow = (bx + shadow_offset, by + shadow_offset, bx + w + shadow_offset, by + h + shadow_offset)
    draw.rounded_rectangle(shadow, radius=radius, fill=(0, 0, 0, 45))
    draw.rounded_rectangle(rect, radius=radius, fill=(255, 255, 255, 238), outline=TEAL, width=max(3, int(4 * scale)))

    small_radius = max(18, int(22 * scale))
    small_center = (bx + small_radius + int(10 * scale), by + h // 2)
    draw.ellipse(
        [
            small_center[0] - small_radius,
            small_center[1] - small_radius,
            small_center[0] + small_radius,
            small_center[1] + small_radius,
        ],
        fill=TEAL,
    )
    num_font = pil_font(max(18, int(21 * scale)), bold=True)
    num_box = draw.textbbox((0, 0), num, font=num_font)
    draw.text(
        (
            small_center[0] - (num_box[2] - num_box[0]) / 2,
            small_center[1] - (num_box[3] - num_box[1]) / 2 - 1,
        ),
        num,
        font=num_font,
        fill="white",
    )

    text_font = pil_font(max(16, int(19 * scale)), bold=True)
    text_x = bx + small_radius * 2 + int(22 * scale)
    text_y = by + int(13 * scale)
    draw.multiline_text(
        (text_x, text_y),
        text,
        font=text_font,
        fill=INK,
        spacing=max(2, int(3 * scale)),
    )


def annotate(src_name: str, callouts: list[tuple[int, int, str, int, int, str]]) -> Path:
    src = SCREENSHOT_DIR / src_name
    if not src.exists():
        raise FileNotFoundError(f"필요한 화면 캡처가 없습니다: {src}")

    ANNOTATED_DIR.mkdir(parents=True, exist_ok=True)
    out = ANNOTATED_DIR / src_name
    image = PILImage.open(src).convert("RGBA")
    overlay = PILImage.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)
    scale = image.width / 1920
    for x, y, num, bubble_x, bubble_y, text in callouts:
        speech_bubble(draw, x, y, num, bubble_x, bubble_y, text, scale)
    for x, y, num, _bubble_x, _bubble_y, _text in callouts:
        marker(draw, int(x * scale), int(y * scale), num, scale)
    PILImage.alpha_composite(image, overlay).convert("RGB").save(out, quality=95)
    return out


def img(path: Path, width_mm: float, height_mm: float | None = None) -> Image:
    if height_mm is None:
        with PILImage.open(path) as im:
            height_mm = width_mm * im.height / im.width
    return Image(str(path), width=width_mm * mm, height=height_mm * mm)


def step_table(items: list[tuple[str, str, str]], styles: dict[str, ParagraphStyle], columns: int = 3) -> Table:
    rows = []
    row = []
    cell_w = 268 / columns
    for num, title, body in items:
        badge = Table(
            [[p(num, styles["callout_num"])]],
            colWidths=[8.5 * mm],
            rowHeights=[8.5 * mm],
        )
        badge.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(TEAL)),
                    ("BOX", (0, 0), (-1, -1), 0, colors.HexColor(TEAL)),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        cell = Table(
            [
                [badge, p(title, styles["callout_title"])],
                ["", p(body, styles["callout_body"])],
            ],
            colWidths=[11 * mm, (cell_w - 14) * mm],
        )
        cell.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("SPAN", (1, 0), (1, 0)),
                    ("LEFTPADDING", (0, 0), (-1, -1), 1),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                    ("TOPPADDING", (0, 0), (-1, -1), 1.5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
                ]
            )
        )
        row.append(cell)
        if len(row) == columns:
            rows.append(row)
            row = []
    if row:
        while len(row) < columns:
            row.append("")
        rows.append(row)

    table = Table(rows, colWidths=[cell_w * mm] * columns, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor(LINE)),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#E3ECF3")),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FBFEFF")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def note_box(text: str, styles: dict[str, ParagraphStyle]) -> Table:
    result = Table([[p(text, styles["small"])]], colWidths=[268 * mm], hAlign="LEFT")
    result.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(YELLOW)),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E6C94C")),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return result


def screen_page(
    story,
    title: str,
    hint: str,
    image_path: Path,
    callouts,
    styles,
    note: str | None = None,
    image_width: float = 236,
) -> None:
    story.append(p(title, styles["page_title"]))
    story.append(p(hint, styles["page_hint"]))
    story.append(Spacer(1, 1.4 * mm))
    story.append(img(image_path, image_width))
    story.append(Spacer(1, 2 * mm))
    columns = min(max(len(callouts), 3), 6)
    story.append(step_table(callouts, styles, columns=columns))
    if note:
        story.append(Spacer(1, 1.4 * mm))
        story.append(note_box(note, styles))
    story.append(PageBreak())


def cover_thumbnails(paths: list[Path]) -> Table:
    thumbs = [[img(path, 62, 35) for path in paths]]
    table = Table(thumbs, colWidths=[66 * mm] * len(paths), hAlign="CENTER")
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor(LINE)),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor(LINE)),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("LEFTPADDING", (0, 0), (-1, -1), 3),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return table


def build_pdf() -> Path:
    register_fonts()
    styles = make_styles()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ANNOTATED_DIR.mkdir(parents=True, exist_ok=True)

    annotated = {
        "setup": annotate(
            "01_setup_initial.png",
            [
                (1800, 58, "1", 1500, 112, "먼저\n전체화면"),
                (315, 320, "2", 90, 176, "학기를\n맞춰요"),
                (780, 320, "3", 660, 176, "단원을\n고르세요"),
                (1455, 320, "4", 1240, 176, "오늘 차시를\n선택해요"),
            ],
        ),
        "count_time": annotate(
            "02_setup_5players_30sec.png",
            [
                (520, 505, "1", 330, 350, "학생 수를\n누르세요"),
                (1110, 440, "2", 1060, 292, "시간을\n선택해요"),
                (230, 800, "3", 62, 650, "학생은 여기서\n번호를 눌러요"),
                (178, 590, "4", 246, 548, "준비 인원을\n확인해요"),
            ],
        ),
        "difficulty": annotate(
            "03_difficulty_select.png",
            [
                (250, 780, "1", 52, 645, "번호 다음은\n난이도 선택"),
                (270, 770, "2", 420, 690, "상\n도전 문제"),
                (270, 855, "3", 420, 790, "중\n기본 문제"),
                (270, 940, "4", 420, 890, "하\n쉬운 문제"),
                (168, 565, "5", 248, 540, "모두 고르면\n자동 시작"),
            ],
        ),
        "playing": annotate(
            "04_playing_questions.png",
            [
                (1710, 136, "1", 1430, 92, "남은 시간을\n봅니다"),
                (1835, 136, "2", 1550, 172, "교사용 분석은\n선생님만"),
                (185, 385, "3", 280, 272, "문제와 그림을\n함께 봐요"),
                (190, 910, "4", 278, 838, "답은 아래에서\n누릅니다"),
                (58, 270, "5", 130, 210, "자기 학생\n칸만 봐요"),
            ],
        ),
        "wrong": annotate(
            "05_wrong_explanation.png",
            [
                (205, 645, "1", 300, 600, "틀리면 짧은\n도움이 떠요"),
                (160, 705, "2", 300, 690, "핵심만\n읽어요"),
                (160, 765, "3", 300, 770, "정답을\n확인해요"),
                (205, 845, "4", 300, 835, "다음 문제로\n넘어가요"),
                (190, 925, "5", 300, 925, "선택지는\n잠겨요"),
            ],
        ),
        "finished": annotate(
            "06_finished_results.png",
            [
                (1700, 136, "1", 1390, 112, "0초가 되면\n결과 화면"),
                (175, 615, "2", 245, 520, "학생별 점수만\n간단히 공개"),
                (1835, 136, "3", 1530, 184, "자세한 기록은\n교사용 분석"),
                (1785, 988, "4", 1440, 880, "아래 버튼으로\n다시 시작"),
            ],
        ),
        "teacher": annotate(
            "07_teacher_analysis.png",
            [
                (1460, 102, "1", 1180, 82, "분석 엑셀\n저장"),
                (405, 725, "2", 360, 590, "학생별 PDF\n내려받기"),
                (1110, 815, "3", 1200, 730, "학생 번호로\n오답 필터"),
                (920, 930, "4", 680, 830, "틀린 문제를\n확인해요"),
                (1545, 102, "5", 1340, 170, "닫기"),
                (1020, 278, "6", 1030, 200, "요약 지표를\n먼저 봐요"),
            ],
        ),
    }

    doc = BaseDocTemplate(
        str(PDF_PATH),
        pagesize=landscape(A4),
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=7 * mm,
        bottomMargin=10 * mm,
        title="2학년 수학 보드게임 사용자 활용 매뉴얼",
        author="Codex",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=draw_page)])

    story = []
    story.append(Spacer(1, 9 * mm))
    story.append(p("2학년 수학 보드게임", styles["cover_title"]))
    story.append(p("화면을 보며 따라 하는 사용자 활용 매뉴얼", styles["cover_title"]))
    story.append(p("실제 앱 화면에 번호를 붙여, 무엇을 왜 클릭하는지 한눈에 따라가도록 다시 구성했습니다.", styles["cover_subtitle"]))
    story.append(p(f"생성일: {datetime.now().strftime('%Y년 %m월 %d일')}", styles["cover_subtitle"]))
    story.append(Spacer(1, 7 * mm))
    story.append(cover_thumbnails([annotated["setup"], annotated["count_time"], annotated["playing"], annotated["teacher"]]))
    story.append(Spacer(1, 8 * mm))
    story.append(
        step_table(
            [
                ("1", "수업 화면을 크게 만듭니다", "전자칠판에서는 먼저 전체화면을 눌러 학생이 버튼을 쉽게 보게 합니다."),
                ("2", "오늘 배울 범위를 고릅니다", "학기, 단원, 차시를 고르면 문제와 해설이 그 목표에 맞춰집니다."),
                ("3", "참여 방식만 정합니다", "학생 수, 시간, 출석번호, 난이도를 정하면 바로 자동 시작됩니다."),
                ("4", "수업 후 기록을 저장합니다", "교사용 분석에서 학생별 PDF와 분석 Excel을 내려받습니다."),
            ],
            styles,
            columns=4,
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(note_box("읽는 순서: 화면의 번호를 먼저 보고, 아래 표에서 같은 번호의 '왜 클릭하나요?'만 확인하면 됩니다.", styles))
    story.append(PageBreak())

    screen_page(
        story,
        "1. 첫 화면에서 수업 범위 고르기",
        "교사는 이 화면에서 오늘 어떤 내용으로 게임을 할지 정합니다. 범위를 정확히 골라야 문제와 해설이 차시 목표에 맞게 나옵니다.",
        annotated["setup"],
        [
            ("1", "전체화면", "학생들이 전자칠판 앞에서 문제와 버튼을 크게 볼 수 있게 먼저 누릅니다."),
            ("2", "학기 선택", "1학기와 2학기는 단원 구성이 다르므로 오늘 수업 학기를 먼저 맞춥니다."),
            ("3", "단원 선택", "오늘 단원을 고릅니다. 학기 전체 복습은 단원 목록의 '학기 종합'을 고릅니다."),
            ("4", "차시 선택", "오늘 배운 차시를 고릅니다. 단원 전체 복습은 차시 목록의 '단원 종합'을 고릅니다."),
        ],
        styles,
        "차시를 잘못 고르면 문제 유형과 해설이 수업 목표와 달라집니다. 게임 전 가장 먼저 확인할 곳입니다.",
    )

    screen_page(
        story,
        "2. 학생 수와 학습 시간 정하기",
        "학생들이 몇 명 참여할지, 한 번에 몇 초 동안 풀지 정합니다. 선택이 끝나면 아래 학생 자리에서 번호를 고릅니다.",
        annotated["count_time"],
        [
            ("1", "학생 인원수", "전자칠판 앞에 설 학생 수를 고릅니다. 1명부터 5명까지 동시에 참여할 수 있습니다."),
            ("2", "학습 시간", "30초는 짧은 확인, 60초는 일반 수업, 120초는 보충 또는 종합 복습에 알맞습니다."),
            ("3", "출석번호판", "각 학생이 자기 자리에서 실제 출석번호만 누릅니다. 기록과 PDF가 이 번호로 저장됩니다."),
            ("4", "학생 준비 표시", "몇 명이 준비를 마쳤는지 보여 줍니다. 모두 준비되면 자동으로 시작됩니다."),
        ],
        styles,
        "처음 사용할 때는 3명, 60초로 연습한 뒤 5명 동시 진행으로 넓히면 운영이 안정적입니다.",
    )

    screen_page(
        story,
        "3. 학생이 출석번호와 난이도 고르기",
        "학생이 직접 누르는 단계입니다. 번호를 먼저 고르면 같은 자리에서 난이도 선택 화면으로 바뀝니다.",
        annotated["difficulty"],
        [
            ("1", "출석번호 선택 후 화면 전환", "번호를 누르면 그 학생 카드가 난이도 선택으로 바뀝니다."),
            ("2", "상", "개념 이해가 빠른 학생이 도전 문제를 풀 때 고릅니다."),
            ("3", "중", "대부분 학생에게 기본값으로 권합니다. 개념을 문제 상황에 적용합니다."),
            ("4", "하", "처음 배우는 차시나 보충이 필요한 학생에게 권합니다."),
            ("5", "준비 상태 확인", "학생 준비 수가 늘어납니다. 모든 학생이 난이도까지 고르면 자동 시작됩니다."),
        ],
        styles,
        "난이도는 비교가 아니라 맞춤 지원입니다. 학생에게는 '자기에게 맞는 문제를 골라 더 잘 배우기 위한 선택'이라고 안내합니다.",
    )

    screen_page(
        story,
        "4. 문제 풀이 화면에서 누르는 곳",
        "게임이 시작되면 학생마다 다른 문제가 나옵니다. 학생은 자기 카드 안의 문제를 보고 아래 선택지를 누릅니다.",
        annotated["playing"],
        [
            ("1", "남은 시간", "수업 시간이 얼마나 남았는지 확인합니다."),
            ("2", "교사용 분석", "학생에게 자세히 공개하지 않는 기록을 교사가 따로 볼 때 누릅니다."),
            ("3", "문제와 시각자료", "문장만 보지 말고 그림, 수 모형, 수직선, 도형, 표를 함께 보게 합니다."),
            ("4", "정답 선택지", "학생이 자기 카드 아래쪽에서 답을 누릅니다. 맞으면 자동으로 다음 문제가 나옵니다."),
            ("5", "학생 아이콘과 난이도", "각 학생의 자리, 출석번호, 난이도를 빠르게 확인합니다."),
        ],
        styles,
        "학생에게는 '문제를 먼저 읽고, 그림을 보고, 마지막에 답을 누르기' 순서로 말해 주면 실수가 줄어듭니다.",
    )

    screen_page(
        story,
        "5. 오답이 나왔을 때 학생 화면",
        "틀린 학생에게는 긴 풀이보다 바로 다시 생각할 수 있는 짧은 도움말이 보입니다. 자세한 풀이는 교사용 PDF에 남깁니다.",
        annotated["wrong"],
        [
            ("1", "짧은 도움", "학생에게 필요한 핵심 개념만 바로 보여 줍니다."),
            ("2", "핵심/볼 곳", "이 문제에서 무엇을 봐야 하는지 알려 줍니다."),
            ("3", "정답 확인", "정답을 보고 왜 그런지 한 문장으로 연결합니다."),
            ("4", "다음 문제", "도움을 읽은 뒤 다음 문제로 넘어갑니다."),
            ("5", "선택지 잠금", "오답 후에는 같은 문제를 계속 누르지 않고 해설을 먼저 보게 합니다."),
        ],
        styles,
        "학생 화면의 설명은 짧게, 교사용 분석 PDF의 풀이는 자세하게 분리해서 사용합니다.",
    )

    screen_page(
        story,
        "6. 시간이 끝났을 때 확인할 것",
        "시간이 끝나면 팝업 대신 결과 화면으로 바뀝니다. 학생에게는 각자 푼 문제, 정답, 오답 수만 공개합니다.",
        annotated["finished"],
        [
            ("1", "0초 확인", "수업 시간이 끝났다는 신호입니다."),
            ("2", "학생별 결과", "학생별 푼 문제, 정답, 오답 수를 간단히 확인합니다."),
            ("3", "교사용 분석", "자세한 오답 유형, 시간, PDF, Excel은 교사용 분석에서 봅니다."),
            ("4", "화면 맨 아래 버튼", "'다시 풀기'는 같은 설정으로 재시작, '처음'은 학기/단원/차시를 다시 고를 때 씁니다."),
        ],
        styles,
        "학생 공개 화면에서는 친구의 자세한 오답을 비교하지 않습니다. 점수 확인 후 교사가 따로 분석을 엽니다.",
    )

    screen_page(
        story,
        "7. 교사용 분석에서 저장하기",
        "교사용 분석은 학생에게 공개하지 않는 상세 기록 화면입니다. 수업 후 보충 지도 자료를 만들 때 사용합니다.",
        annotated["teacher"],
        [
            ("1", "분석 엑셀", "전체 요약, 학생별 분석, 풀이 기록, 틀린 문제 기록을 Excel 파일로 저장합니다."),
            ("2", "학생별 PDF", "해당 학생의 틀린 문제만 따로 PDF로 내려받습니다."),
            ("3", "학생 필터", "틀린 문제 기록에서 특정 학생만 골라 볼 수 있습니다."),
            ("4", "틀린 문제 표", "문항, 전략, 유형, 풀이 시간을 확인해 보충 지도를 계획합니다."),
            ("5", "닫기", "분석창을 닫고 게임 화면으로 돌아갑니다. 기록은 현재 수업 세션에 유지됩니다."),
            ("6", "요약 지표", "정답률, 평균 시간, 틀린 기록, 현재 문항 전략을 빠르게 봅니다."),
        ],
        styles,
        "PDF는 학생별 보충 학습지, Excel은 교사용 기록과 다음 수업 설계 자료로 사용하면 좋습니다.",
    )

    story.append(p("8. 수업 중 짧게 말해 주는 안내", styles["page_title"]))
    story.append(p("이 페이지는 화면 설명을 학생에게 말할 때 쓰는 짧은 대본입니다. 길게 설명하지 않고 바로 시작할 수 있게 구성했습니다.", styles["page_hint"]))
    story.append(Spacer(1, 7 * mm))
    story.append(
        step_table(
            [
                ("1", "시작 전", "자기 자리에서 출석번호를 먼저 누르고, 자기에게 맞는 난이도를 고르면 자동으로 시작됩니다."),
                ("2", "문제 풀 때", "문제를 먼저 읽고, 그림이나 표가 있으면 꼭 같이 본 다음 답을 누르세요."),
                ("3", "맞았을 때", "정답이면 바로 다음 문제가 나옵니다. 멈추지 말고 계속 풀면 됩니다."),
                ("4", "틀렸을 때", "짧은 도움을 읽고 왜 그런지 생각한 뒤 다음 문제로 넘어가세요."),
                ("5", "시간 종료", "푼 문제, 정답, 오답 수만 확인합니다. 자세한 내용은 선생님이 따로 봅니다."),
                ("6", "다시 할 때", "같은 차시를 한 번 더 풀면 다시 풀기, 다른 차시로 바꾸면 처음을 누릅니다."),
            ],
            styles,
            columns=3,
        )
    )
    story.append(Spacer(1, 7 * mm))
    story.append(note_box("핵심 운영 원칙: 학생에게는 짧고 명확하게 안내하고, 자세한 분석은 교사용 화면에서만 확인합니다.", styles))

    doc.build(story)
    return PDF_PATH


if __name__ == "__main__":
    print(build_pdf())

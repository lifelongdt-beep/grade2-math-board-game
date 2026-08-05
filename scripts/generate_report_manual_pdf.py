from __future__ import annotations

import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Iterable

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PDF_PATH = OUTPUT_DIR / "2학년_수학_보드게임_분석보고서_및_활용매뉴얼.pdf"
CURRICULUM_PATH = ROOT / "src" / "data" / "curriculum.ts"
APP_PATH = ROOT / "src" / "App.tsx"
TEACHER_PANEL_PATH = ROOT / "src" / "components" / "TeacherPanel.tsx"
QUESTION_FACTORY_PATH = ROOT / "src" / "data" / "questionFactory.ts"
TEST_PATH = ROOT / "src" / "data" / "questionFactory.test.ts"
BACKGROUND_PATH = ROOT / "public" / "assets" / "math-adventure-bg.png"

FONT_REGULAR = "Malgun"
FONT_BOLD = "MalgunBold"


def register_fonts() -> None:
    font_dir = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont(FONT_REGULAR, str(font_dir / "malgun.ttf")))
    pdfmetrics.registerFont(TTFont(FONT_BOLD, str(font_dir / "malgunbd.ttf")))


def para(text: str, style: ParagraphStyle) -> Paragraph:
    safe = (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )
    return Paragraph(safe, style)


def bullets(items: Iterable[str], style: ParagraphStyle) -> ListFlowable:
    return ListFlowable(
        [ListItem(para(item, style), leftIndent=8, bulletColor=colors.HexColor("#0F6F70")) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=14,
        bulletFontName=FONT_BOLD,
        bulletFontSize=7,
    )


def parse_curriculum() -> list[dict[str, object]]:
    text = CURRICULUM_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()
    lessons: list[dict[str, object]] = []
    current_unit: dict[str, object] | None = None
    current_lesson: dict[str, object] | None = None
    in_curriculum = False

    unit_re = re.compile(r"unit\('([^']+)',\s*(\d+),\s*'([^']+)'")
    field_re = re.compile(r"^\s*(title|objective|achievement|textbookFocus|workbookFocus):\s*'(.+)',\s*$")
    tags_re = re.compile(r"^\s*tags:\s*\[(.+)\],\s*$")

    for line in lines:
        if "export const curriculum" in line:
            in_curriculum = True
        if not in_curriculum:
            continue

        unit_match = unit_re.search(line)
        if unit_match:
            current_unit = {
                "semester": unit_match.group(1),
                "unit_no": int(unit_match.group(2)),
                "unit_title": unit_match.group(3),
                "lesson_no": 0,
            }
            current_lesson = None
            continue

        if current_unit is None:
            continue

        field_match = field_re.match(line)
        if field_match:
            key, value = field_match.groups()
            if key == "title":
                current_unit["lesson_no"] = int(current_unit["lesson_no"]) + 1
                current_lesson = {
                    "semester": current_unit["semester"],
                    "unit_no": current_unit["unit_no"],
                    "unit_title": current_unit["unit_title"],
                    "lesson_no": current_unit["lesson_no"],
                    "title": value,
                }
                lessons.append(current_lesson)
            elif current_lesson is not None:
                current_lesson[key] = value
            continue

        tags_match = tags_re.match(line)
        if tags_match and current_lesson is not None:
            tags = [item.strip().strip("'") for item in tags_match.group(1).split(",")]
            current_lesson["tags"] = tags

    return lessons


def source_flags() -> dict[str, bool]:
    app = APP_PATH.read_text(encoding="utf-8")
    teacher = TEACHER_PANEL_PATH.read_text(encoding="utf-8")
    factory = QUESTION_FACTORY_PATH.read_text(encoding="utf-8")
    tests = TEST_PATH.read_text(encoding="utf-8")
    return {
        "fullscreen": "requestFullscreen" in app,
        "sound": "playSuccessSound" in app,
        "student_icons": "playerIcons" in app,
        "unit_review": "단원 종합" in app,
        "semester_review": "학기 종합" in app,
        "wrong_pdf": "downloadWrongPdf" in teacher,
        "excel": "downloadAnalysisExcel" in teacher,
        "grade2_language": "advancedTermsForSecondGrade" in tests and "enforceSecondGradeLanguage" in factory,
        "visuals": "QuestionVisualGraphic" in app and "visualForGeneratedQuestion" in factory,
    }


def build_styles():
    base = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=23,
            leading=30,
            textColor=colors.HexColor("#13202D"),
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontName=FONT_REGULAR,
            fontSize=11,
            leading=17,
            textColor=colors.HexColor("#546575"),
            alignment=TA_CENTER,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=17,
            leading=23,
            textColor=colors.HexColor("#0F6F70"),
            spaceBefore=8,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=13,
            leading=18,
            textColor=colors.HexColor("#17202A"),
            spaceBefore=8,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=9.2,
            leading=14.2,
            textColor=colors.HexColor("#17202A"),
            alignment=TA_LEFT,
            wordWrap="CJK",
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#536576"),
            wordWrap="CJK",
        ),
        "tiny": ParagraphStyle(
            "tiny",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=6.8,
            leading=9.2,
            textColor=colors.HexColor("#17202A"),
            wordWrap="CJK",
        ),
        "table_head": ParagraphStyle(
            "table_head",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=7.3,
            leading=9,
            textColor=colors.white,
            alignment=TA_CENTER,
            wordWrap="CJK",
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=6.8,
            leading=8.8,
            textColor=colors.HexColor("#17202A"),
            wordWrap="CJK",
        ),
        "label": ParagraphStyle(
            "label",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=8.2,
            leading=11,
            textColor=colors.HexColor("#0F6F70"),
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
    return styles


def make_metric_table(data: list[tuple[str, str]], styles) -> Table:
    rows = []
    for label, value in data:
        rows.append([para(label, styles["label"]), para(value, styles["body"])])
    table = Table(rows, colWidths=[36 * mm, 128 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#D9E5EF")),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#E8EEF5")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E9FBFB")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def make_simple_table(headers: list[str], rows: list[list[str]], styles, widths: list[float]) -> Table:
    table_data = [[para(item, styles["table_head"]) for item in headers]]
    for row in rows:
        table_data.append([para(item, styles["table_cell"]) for item in row])
    table = Table(table_data, colWidths=[width * mm for width in widths], repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F6F70")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#C8D8E5")),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#DDE7F0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FBFD")]),
            ]
        )
    )
    return table


def draw_page(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor("#D9E5EF"))
    canvas.setLineWidth(0.6)
    canvas.line(18 * mm, 18 * mm, width - 18 * mm, 18 * mm)
    canvas.setFont(FONT_REGULAR, 7)
    canvas.setFillColor(colors.HexColor("#7C8A99"))
    canvas.drawString(18 * mm, 11.5 * mm, "2학년 수학 보드게임 분석 보고서 및 활용 매뉴얼")
    canvas.drawRightString(width - 18 * mm, 11.5 * mm, f"{doc.page}")
    canvas.restoreState()


def add_section(story, title: str, styles):
    story.append(para(title, styles["h1"]))


def add_subsection(story, title: str, styles):
    story.append(para(title, styles["h2"]))


def build_pdf() -> Path:
    register_fonts()
    styles = build_styles()
    lessons = parse_curriculum()
    flags = source_flags()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    unit_counter = Counter((lesson["semester"], lesson["unit_no"], lesson["unit_title"]) for lesson in lessons)
    semester_counter = Counter(str(lesson["semester"]) for lesson in lessons)
    tag_counter = Counter(tag for lesson in lessons for tag in lesson.get("tags", []))
    total_lessons = len(lessons)
    base_question_count = total_lessons * 3 * 20

    doc = BaseDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=17 * mm,
        bottomMargin=23 * mm,
        title="2학년 수학 보드게임 분석 보고서 및 활용 매뉴얼",
        author="Codex",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=draw_page)])

    story = []

    story.append(Spacer(1, 14 * mm))
    if BACKGROUND_PATH.exists():
        story.append(Image(str(BACKGROUND_PATH), width=150 * mm, height=58 * mm, kind="proportional"))
        story.append(Spacer(1, 6 * mm))
    story.append(para("2학년 수학 보드게임", styles["title"]))
    story.append(para("분석 보고서 및 활용 매뉴얼", styles["title"]))
    story.append(
        para(
            f"대상: 초등학교 2학년 수학 수업 / 생성일: {datetime.now().strftime('%Y년 %m월 %d일')}",
            styles["subtitle"],
        )
    )
    story.append(Spacer(1, 7 * mm))
    story.append(
        make_metric_table(
            [
                ("문서 목적", "교사가 수업 전에 앱의 교육적 의도와 기능을 빠르게 이해하고, 전자칠판 수업에서 바로 운영할 수 있도록 분석 보고서와 활용 절차를 함께 제시합니다."),
                ("앱 성격", "1-5명 학생이 동시에 전자칠판 앞에서 문제를 풀고, 교사가 실시간 분석과 오답 자료를 확인하는 2학년 수학 참여형 보드게임입니다."),
                ("문항 범위", f"현재 교육과정 데이터 기준 {len(unit_counter)}개 단원, {total_lessons}개 차시, 차시별 난이도 3단계 x 20문항 구조입니다."),
                ("산출 기능", "교사용 분석 화면, 학생별 오답 PDF, 전체 분석 Excel, 단원 종합과 학기 종합 랜덤 풀이를 지원합니다."),
            ],
            styles,
        )
    )
    story.append(PageBreak())

    add_section(story, "1. 요약 분석", styles)
    story.append(
        para(
            "이 게임은 초등학교 2학년 수학 교육과정의 차시별 목표를 바탕으로, 전자칠판에서 짧은 시간 안에 여러 학생이 동시에 참여하도록 설계된 수업 도구입니다. "
            "학생 화면은 문제와 선택지를 크게 보여 주고, 교사 화면은 풀이 기록을 분석하여 정답률, 풀이 시간, 오답 유형, 취약 전략을 확인하도록 구성되어 있습니다.",
            styles["body"],
        )
    )
    story.append(Spacer(1, 3 * mm))
    story.append(
        make_metric_table(
            [
                ("교육과정 범위", f"2학년 1학기 {semester_counter['2-1']}차시, 2학년 2학기 {semester_counter['2-2']}차시"),
                ("기본 문항 풀", f"{total_lessons}차시 x 난이도 3단계 x 20문항 = {base_question_count:,}문항"),
                ("난이도 설계", "하: 기본 개념 확인 / 중: 적용 / 상: 조건을 함께 보고 판단하는 도전형"),
                ("학생 참여", "1-5명 동시 플레이, 출석번호 선택, 학생별 난이도 선택, 학생별 다른 문제 제시"),
                ("피드백", "정답은 즉시 다음 문제로 이동하고 성공 소리와 아이콘 반응을 제공, 오답은 학생 화면에서 짧은 핵심 도움을 표시"),
                ("평가 자료", "교사용 팝업에서 학생별 요약, 오답 유형, 전략, 시간 분석, 학생별 오답 PDF와 Excel 다운로드 제공"),
            ],
            styles,
        )
    )
    add_subsection(story, "핵심 강점", styles)
    story.append(
        bullets(
            [
                "학생이 전자칠판 앞에서 직접 선택하므로 참여도가 높고, 교사는 즉시 형성평가 자료를 얻을 수 있습니다.",
                "차시 선택, 단원 종합, 학기 종합을 모두 지원해 도입, 전개, 정리, 복습 수업에 모두 활용할 수 있습니다.",
                "오답 후 학생에게는 짧고 직관적인 도움을, 교사에게는 자세한 풀이와 분석 자료를 분리해서 제공합니다.",
                "문항 생성 단계에 2학년 수준 용어 검수와 선행학습 방지 테스트가 포함되어 있습니다.",
            ],
            styles["body"],
        )
    )

    add_subsection(story, "주의할 점", styles)
    story.append(
        bullets(
            [
                "전자칠판 수업에서는 학생이 화면 아래쪽에서 조작하므로 전체화면을 켠 뒤 선택 영역이 충분히 크게 보이는지 먼저 확인합니다.",
                "수업 기록은 현재 세션 기준으로 유지됩니다. 수업을 다시 시작하거나 설정으로 돌아가기 전 필요한 PDF와 Excel을 내려받습니다.",
                "문항은 교육과정 기준에 맞게 자동 생성되지만, 평가용으로 사용할 때는 교사가 차시 목표와 난이도를 사전에 확인하는 것이 좋습니다.",
            ],
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "2. 교육과정 및 문항 설계 분석", styles)
    story.append(
        para(
            "앱의 교육과정 데이터는 `src/data/curriculum.ts`에 단원, 차시, 학습 목표, 성취기준, 교과서 초점, 수학익힘 초점으로 구조화되어 있습니다. "
            "문제 생성기는 이 차시 정보를 기반으로 문항 유형과 해설을 구성합니다.",
            styles["body"],
        )
    )
    story.append(Spacer(1, 3 * mm))
    unit_rows = []
    for (semester, unit_no, unit_title), count in sorted(unit_counter.items()):
        unit_rows.append([str(semester), f"{unit_no}. {unit_title}", f"{count}차시", f"{count * 60:,}문항"])
    story.append(make_simple_table(["학기", "단원", "차시 수", "기본 문항 수"], unit_rows, styles, [22, 72, 30, 34]))

    add_subsection(story, "내용 영역 태그", styles)
    tag_rows = [[tag, f"{count}차시 연결"] for tag, count in sorted(tag_counter.items())]
    story.append(make_simple_table(["태그", "연결 차시"], tag_rows, styles, [52, 48]))
    story.append(Spacer(1, 3 * mm))
    story.append(
        para(
            "태그는 수와 연산, 도형, 측정, 자료와 가능성, 규칙 찾기 영역을 구분하는 내부 기준입니다. 한 차시에 여러 태그가 붙으면 복합 문항이나 종합 문항에서 여러 개념을 섞어 출제할 수 있습니다.",
            styles["body"],
        )
    )

    add_subsection(story, "선행학습 방지와 2학년 용어 검수", styles)
    story.append(
        bullets(
            [
                "문제 생성 마지막 단계에서 문제, 보기, 정답, 해설, 전략, 시각자료 라벨을 2학년 수준 표현으로 정리합니다.",
                "나눗셈, 분수, 소수, 각도, 평행, 대칭, 방정식, 미지수 등 2학년 범위를 넘는 용어는 테스트에서 검출됩니다.",
                "덧셈과 뺄셈 문항은 두 자리 수 범위의 직접 계산을 유지하도록 자동 검수합니다.",
            ],
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "3. 기능 분석", styles)
    feature_rows = [
        ["수업 설정", "학기, 단원, 차시, 단원 종합, 학기 종합, 인원수, 학습 시간을 선택합니다."],
        ["학생 준비", "각 학생이 같은 자리에서 출석번호를 선택한 뒤 난이도 상/중/하를 고릅니다. 모든 학생이 준비되면 자동 시작합니다."],
        ["동시 플레이", "1-5명의 학생에게 서로 다른 문제가 제시됩니다. 정답을 맞히면 별도 버튼 없이 바로 다음 문제로 넘어갑니다."],
        ["오답 도움", "오답 시 학생 화면에는 핵심 개념, 볼 곳, 정답, 짧은 이유가 표시됩니다."],
        ["성공 반응", "정답 시 성공 소리와 학생별 아이콘 반응이 나타납니다."],
        ["교사용 분석", "전체 정답률, 평균 풀이 시간, 틀린 기록, 학생별 푼 문제/정답/오답/취약 유형/취약 전략을 확인합니다."],
        ["자료 다운로드", "학생별 틀린 문제 PDF와 전체 분석 Excel을 내려받습니다."],
        ["전체화면", "수업 설정과 게임 화면 모두 전체화면을 지원합니다."],
    ]
    story.append(make_simple_table(["기능", "설명"], feature_rows, styles, [36, 124]))

    add_subsection(story, "코드 기준 기능 확인", styles)
    flag_rows = [
        ["전체화면", "구현됨" if flags["fullscreen"] else "확인 필요"],
        ["정답 소리", "구현됨" if flags["sound"] else "확인 필요"],
        ["학생별 아이콘", "구현됨" if flags["student_icons"] else "확인 필요"],
        ["단원 종합", "구현됨" if flags["unit_review"] else "확인 필요"],
        ["학기 종합", "구현됨" if flags["semester_review"] else "확인 필요"],
        ["학생별 오답 PDF", "구현됨" if flags["wrong_pdf"] else "확인 필요"],
        ["분석 Excel", "구현됨" if flags["excel"] else "확인 필요"],
        ["2학년 용어 검수", "테스트 포함" if flags["grade2_language"] else "확인 필요"],
        ["시각자료 문항", "구현됨" if flags["visuals"] else "확인 필요"],
    ]
    story.append(make_simple_table(["점검 항목", "상태"], flag_rows, styles, [48, 48]))
    story.append(PageBreak())

    add_section(story, "4. 수업 활용 매뉴얼", styles)
    add_subsection(story, "수업 전 준비", styles)
    story.append(
        bullets(
            [
                "전자칠판 또는 교사용 PC에서 게임을 실행합니다.",
                "브라우저 확대/축소가 100%인지 확인하고, 필요하면 앱의 전체화면 버튼을 누릅니다.",
                "수업 목표에 따라 학기, 단원, 차시 또는 단원 종합/학기 종합을 정합니다.",
                "참여 학생 수를 1-5명 중 선택하고 학습 시간을 30초, 60초, 120초 중 선택합니다.",
                "난이도 배정 기준을 미리 정합니다. 예: 보충 학생은 하, 일반 학생은 중, 도전 학생은 상.",
            ],
            styles["body"],
        )
    )
    add_subsection(story, "학생 시작 절차", styles)
    story.append(
        make_simple_table(
            ["순서", "학생 행동", "교사 확인"],
            [
                ["1", "자기 자리의 출석번호를 누릅니다.", "번호 중복이 없는지 확인합니다."],
                ["2", "난이도 상/중/하를 선택합니다.", "학생 수준에 맞는지 확인합니다."],
                ["3", "모든 학생이 준비 완료가 되면 자동으로 게임이 시작됩니다.", "시작 전 전자칠판 앞 간격을 확보합니다."],
                ["4", "문제를 보고 선택지를 누릅니다.", "답 선택 영역이 학생 손이 닿는 위치인지 확인합니다."],
                ["5", "오답 시 짧은 도움을 읽고 다음 문제로 넘어갑니다.", "해설을 길게 읽히기보다 핵심만 확인하게 합니다."],
            ],
            styles,
            [16, 88, 56],
        )
    )

    add_subsection(story, "게임 중 교사 운영", styles)
    story.append(
        bullets(
            [
                "학생이 풀이 중일 때 교사용 분석 버튼을 열면 수업 흐름을 끊지 않고 기록을 확인할 수 있습니다.",
                "오답이 반복되는 학생은 즉시 난이도를 낮추기보다 수업 후 오답 PDF로 보충하도록 안내합니다.",
                "정답 소리와 아이콘은 성공감을 주는 장치이므로 스피커 볼륨을 적당히 맞춥니다.",
                "시간이 끝나면 팝업 대신 결과 화면에서 학생별 푼 문제, 정답, 오답 수를 확인합니다.",
            ],
            styles["body"],
        )
    )

    add_subsection(story, "수업 후 정리", styles)
    story.append(
        bullets(
            [
                "교사용 분석을 열어 전체 정답률과 학생별 취약 유형을 확인합니다.",
                "분석 Excel을 내려받아 학급 기록 또는 보충 지도 자료로 저장합니다.",
                "오답이 있는 학생은 학생 카드의 PDF 버튼으로 개인별 오답지를 만듭니다.",
                "다음 수업에서 오답 유형이 많은 차시를 단원 종합으로 다시 운영합니다.",
            ],
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "5. 화면별 사용 설명", styles)
    screen_rows = [
        ["설정 화면", "학기, 단원, 차시, 인원수, 시간 선택", "수업 시작 전 교사가 전체 설정을 마치는 화면입니다. 학생 준비 영역은 화면 아래쪽에 있어 전자칠판 앞 학생이 직접 누르기 쉽습니다."],
        ["출석번호 선택", "1-30번 번호 버튼", "학생은 자기 번호만 누릅니다. 중복 선택된 번호는 다른 학생이 사용할 수 없도록 관리됩니다."],
        ["난이도 선택", "상, 중, 하 세로형 큰 버튼", "상은 위, 하는 아래로 배치되어 학생이 직관적으로 선택합니다."],
        ["문제 풀이 화면", "문제, 시각자료, 선택지", "한 화면에 최대한 모든 내용이 보이도록 구성되어 있으며, 선택지는 화면 아래에 고정됩니다."],
        ["오답 도움 화면", "핵심, 볼 곳, 정답, 이유", "학생에게는 긴 해설 대신 즉시 행동할 수 있는 짧은 도움을 제공합니다."],
        ["결과 화면", "푼 문제, 정답, 오답", "다른 학생의 자세한 기록은 공개하지 않고 점수 수준의 결과만 확인합니다."],
        ["교사용 분석", "학생별 기록, 취약 유형, Excel, PDF", "자세한 분석은 교사만 팝업으로 확인합니다."],
    ]
    story.append(make_simple_table(["화면", "주요 요소", "활용 방법"], screen_rows, styles, [28, 42, 90]))

    add_subsection(story, "오답 PDF 형식", styles)
    story.append(
        para(
            "학생별 오답 PDF는 한쪽을 2단으로 나누고, 한 페이지에 최대 6문항을 배치합니다. 문제 페이지가 모두 끝난 뒤 다음 쪽부터 정답과 풀이가 이어집니다. "
            "학생에게는 문제를 다시 풀 기회를 주고, 교사는 다음 페이지의 풀이를 보며 개별 피드백을 준비할 수 있습니다.",
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "6. 차시별 운영 예시", styles)
    examples = [
        ["차시 도입 5분", "단원 도입 또는 오늘 차시를 선택하고 30초로 운영합니다.", "선수 지식 확인, 흥미 유발"],
        ["개념 확인 10분", "차시를 선택하고 하/중 중심으로 60초 운영합니다.", "차시 핵심 개념 이해 여부 확인"],
        ["형성평가 10분", "차시를 선택하고 학생 수준별 난이도를 다르게 설정합니다.", "수업 중 즉시 평가와 오답 유형 파악"],
        ["단원 정리", "차시 목록의 단원 종합을 선택합니다.", "단원 내 전 차시를 섞어 복습"],
        ["학기 복습", "단원 선택에서 학기 종합을 선택합니다.", "학기 전체 핵심 개념 종합 점검"],
        ["보충 지도", "오답 PDF를 학생별로 출력하거나 화면 공유합니다.", "개별 취약 문항 재풀이"],
    ]
    story.append(make_simple_table(["상황", "운영 방법", "목적"], examples, styles, [34, 80, 46]))

    add_subsection(story, "추천 시간 설정", styles)
    story.append(
        bullets(
            [
                "30초: 도입, 집중도 깨우기, 빠른 확인 문제에 적합합니다.",
                "60초: 일반적인 형성평가와 활동 정리에 적합합니다.",
                "120초: 상 난이도, 시각자료가 많은 도형/그래프 문제, 설명이 필요한 복습에 적합합니다.",
            ],
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "7. 교사용 분석 활용", styles)
    analytics_rows = [
        ["전체 정답률", "수업 전체의 난이도 적절성과 학급 이해도를 빠르게 봅니다."],
        ["평균 풀이 시간", "학생들이 문제를 너무 빨리 찍는지, 너무 오래 막히는지 판단합니다."],
        ["학생별 푼 문제 수", "활동 참여량과 조작 속도를 확인합니다."],
        ["학생별 정답/오답", "개별 성취 정도를 간단히 비교합니다."],
        ["취약 유형", "자리값, 도형, 측정, 자료 해석 등 반복되는 어려움을 확인합니다."],
        ["취약 전략", "문제 읽기, 조건 함께 보기, 시각자료 해석 등 어떤 사고 과정에서 막히는지 봅니다."],
        ["풀이 시간", "정답이어도 시간이 길면 개념 안정성이 낮을 수 있고, 오답인데 시간이 짧으면 성급한 선택일 수 있습니다."],
        ["오답 PDF", "학생에게 다시 풀릴 문제지만, 정답과 풀이는 뒤쪽에 있어 자기 점검 자료로 쓰기 좋습니다."],
        ["분석 Excel", "수업 기록 보관, 학부모 상담, 보충반 편성, 단원별 누적 분석에 사용할 수 있습니다."],
    ]
    story.append(make_simple_table(["분석 항목", "해석 방법"], analytics_rows, styles, [38, 122]))

    add_subsection(story, "평가 자료 활용 원칙", styles)
    story.append(
        bullets(
            [
                "정답률만 보지 말고 풀이 시간과 오답 유형을 함께 봅니다.",
                "학생 공개 화면에는 자세한 비교를 보여 주지 않고, 교사용 팝업에서만 상세 분석을 확인합니다.",
                "오답 PDF는 벌점 자료가 아니라 다시 생각해 보는 학습 자료로 안내합니다.",
                "같은 유형 오답이 여러 학생에게 반복되면 다음 차시 시작 전에 3분 미니 설명으로 보완합니다.",
            ],
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "8. 문항 품질 관리", styles)
    story.append(
        para(
            "문항 품질은 수학 게임의 핵심입니다. 이 앱은 차시 목표와 문항 유형을 연결하고, 난이도별로 문제 성격을 구분하며, 시각자료를 적극적으로 사용하도록 설계되어 있습니다.",
            styles["body"],
        )
    )
    qa_rows = [
        ["차시 적합성", "문제가 현재 차시 목표와 연결되는지 확인합니다."],
        ["난이도 분리", "하 난이도에는 한 단계 기본 확인, 중에는 적용, 상에는 조건 함께 보기와 자료 해석을 배치합니다."],
        ["시각자료", "도형, 쌓기나무, 배열, 자, 시계, 그림그래프, 자리값표, 무늬 자료를 사용합니다."],
        ["오답 보기", "정답과 숫자가 중복되지 않도록 보기 생성 테스트가 있습니다."],
        ["선행학습 방지", "2학년 범위를 넘는 용어와 수 범위가 테스트로 검수됩니다."],
        ["도형 정확성", "도형 그림과 문제 조건이 맞는지 별도 테스트로 확인합니다."],
    ]
    story.append(make_simple_table(["관리 항목", "현재 반영 내용"], qa_rows, styles, [38, 122]))
    add_subsection(story, "교사가 직접 확인하면 좋은 기준", styles)
    story.append(
        bullets(
            [
                "문제를 풀기 위해 필요한 정보만 들어 있는가?",
                "시각자료와 문장 조건이 정확히 일치하는가?",
                "하 난이도에 복합 조건 문제가 섞이지 않았는가?",
                "상 난이도는 단순 계산 반복이 아니라 조건 판단과 설명이 필요한가?",
                "학생 오답 도움은 짧고 직관적인가?",
            ],
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "9. 운영 시나리오", styles)
    scenario_rows = [
        ["기본형", "3명, 60초, 오늘 차시, 난이도 중", "수업 후반 형성평가에 적합합니다."],
        ["보충형", "2-4명, 60초, 같은 차시, 난이도 하", "개념이 불안정한 학생의 핵심 확인에 적합합니다."],
        ["도전형", "1-3명, 120초, 같은 차시, 난이도 상", "고차원 문항과 설명 중심 수업에 적합합니다."],
        ["단원 복습형", "5명, 60초, 단원 종합", "단원 전체 차시를 섞어 빠르게 확인합니다."],
        ["학기 총정리형", "5명, 120초, 학기 종합", "방학 전 복습, 단원 간 연결 확인에 적합합니다."],
        ["오답 클리닉형", "수업 후 PDF 출력", "학생별 틀린 문제만 다시 풀며 개별 보충합니다."],
    ]
    story.append(make_simple_table(["시나리오", "설정", "활용"], scenario_rows, styles, [35, 55, 70]))

    add_subsection(story, "전자칠판 앞 학생 배치", styles)
    story.append(
        bullets(
            [
                "5명 동시 플레이에서는 학생들이 서로 팔이 겹치지 않도록 화면 앞에 일렬로 섭니다.",
                "출석번호와 난이도 선택은 화면 아래쪽에서 진행되므로 키가 작은 학생도 직접 조작할 수 있습니다.",
                "문제 풀이 중 답 선택지는 화면 아래에 고정되므로 학생이 문제를 읽은 뒤 바로 선택할 수 있습니다.",
            ],
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "10. 문제 해결 및 유지보수", styles)
    troubleshoot_rows = [
        ["화면이 안 보임", "개발 서버가 실행 중인지 확인하고 브라우저 주소가 http://127.0.0.1:5173/인지 확인합니다."],
        ["전체화면에서 버튼이 안 보임", "브라우저 확대율을 100%로 맞추고 앱 전체화면 버튼을 사용합니다."],
        ["소리가 안 남", "브라우저 자동재생 제한 또는 스피커 볼륨을 확인합니다. 첫 클릭 이후 소리가 정상 재생되는지 확인합니다."],
        ["PDF가 안 내려받아짐", "교사용 분석에서 해당 학생의 오답이 있는지 확인합니다. 오답이 없으면 PDF 버튼은 비활성화됩니다."],
        ["Excel이 열리지 않음", "다운로드된 .xls 파일을 Excel 또는 호환 스프레드시트 앱으로 엽니다."],
        ["학생 번호 중복", "이미 선택된 번호는 다른 자리에서 선택할 수 없으므로, 해당 학생 카드에서 다시 선택을 누릅니다."],
    ]
    story.append(make_simple_table(["문제", "확인 방법"], troubleshoot_rows, styles, [40, 120]))

    add_subsection(story, "유지보수 체크리스트", styles)
    story.append(
        bullets(
            [
                "새 단원이나 문항을 추가한 뒤 `pnpm test`를 실행합니다.",
                "빌드 전 `pnpm build`를 실행해 타입 오류와 번들 오류를 확인합니다.",
                "도형이나 시각자료를 수정한 뒤 실제 브라우저 화면에서 그림과 문장이 맞는지 확인합니다.",
                "새로운 용어를 추가할 때 2학년 교육과정 수준에 맞는지 검토합니다.",
                "PDF와 Excel 다운로드 기능은 브라우저에서 실제 클릭으로 확인합니다.",
            ],
            styles["body"],
        )
    )
    story.append(PageBreak())

    add_section(story, "부록 A. 전체 차시 맵", styles)
    story.append(
        para(
            "아래 표는 현재 앱 데이터에 들어 있는 전체 차시와 목표입니다. 교사는 이 표를 보고 차시 선택, 단원 종합, 학기 종합 운영 계획을 세울 수 있습니다.",
            styles["body"],
        )
    )
    lesson_rows = []
    for lesson in lessons:
        lesson_rows.append(
            [
                str(lesson["semester"]),
                f"{lesson['unit_no']}. {lesson['unit_title']}",
                f"{lesson['lesson_no']}차시",
                str(lesson["title"]),
                str(lesson.get("objective", "")),
                ", ".join(lesson.get("tags", [])),
            ]
        )
    story.append(make_simple_table(["학기", "단원", "차시", "차시명", "학습 목표", "태그"], lesson_rows, styles, [15, 29, 15, 35, 58, 24]))
    story.append(PageBreak())

    add_section(story, "부록 B. 빠른 운영 체크리스트", styles)
    checklist_rows = [
        ["수업 전", "차시 선택, 인원수 선택, 시간 선택, 전체화면 확인, 음량 확인"],
        ["학생 준비", "자리 확인, 출석번호 선택, 난이도 선택, 자동 시작 확인"],
        ["수업 중", "학생이 문제와 선택지를 직접 읽고 누르게 하기, 오답 도움은 짧게 확인시키기"],
        ["수업 종료", "결과 화면에서 학생별 푼 문제/정답/오답 확인"],
        ["분석", "교사용 분석 열기, 학생별 취약 유형 확인, Excel 저장"],
        ["보충", "학생별 오답 PDF 저장 또는 출력, 다음 수업 미니 보충 계획 수립"],
    ]
    story.append(make_simple_table(["단계", "체크 내용"], checklist_rows, styles, [28, 132]))

    add_subsection(story, "수업 기록 해석 예시", styles)
    story.append(
        make_simple_table(
            ["관찰 결과", "가능한 해석", "교사 행동"],
            [
                ["정답률 높고 풀이 시간 짧음", "개념이 안정적이거나 문제가 쉬웠을 가능성", "난이도 중/상 또는 단원 종합으로 확장"],
                ["정답률 낮고 풀이 시간 짧음", "문제를 충분히 읽지 않고 선택했을 가능성", "문제에서 묻는 말 표시하기 지도"],
                ["정답률 낮고 풀이 시간 김", "핵심 개념이 불안정할 가능성", "해당 차시 하 난이도와 오답 PDF로 보충"],
                ["특정 유형 오답 반복", "자리값, 측정, 도형 등 특정 개념 취약", "다음 수업 도입에서 해당 개념 3분 재지도"],
            ],
            styles,
            [42, 58, 60],
        )
    )

    doc.build(story)
    return PDF_PATH


if __name__ == "__main__":
    print(build_pdf())

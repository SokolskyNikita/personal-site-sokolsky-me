#!/usr/bin/env bash
# Render the CV Markdown to PDF and publish both to the site's static files.
set -euo pipefail

cd "$(dirname "$0")"

for tool in pandoc weasyprint; do
  if ! command -v "$tool" >/dev/null; then
    echo "$tool is required but not installed" >&2
    exit 1
  fi
done

keywords="Senior Software Engineer,Distributed Systems,AWS,Java,Rust,Go,Scala,DynamoDB,Kinesis,Kafka,Lambda,LLM,agentic development,MCP,RAG,Amazon,Alexa,AWS WAF,Amazon Bar Raiser"

render() {
  local source_md=$1 css=$2 html=$3 pdf=$4 title=$5 description=$6

  pandoc "$source_md" \
    --from=markdown --to=html5 --standalone \
    --template=cv-template.html --section-divs --css="$css" \
    --metadata title="$title" \
    --metadata author="Nikita Sokolsky" \
    --metadata lang=en \
    --metadata description="$description" \
    --metadata keywords="$keywords" \
    -o "$html"

  # --pdf-tags emits the structure tree that ATS and LLM parsers rely on for reading order
  weasyprint --pdf-tags --custom-metadata "$html" "$pdf"
}

render Nikita_Sokolsky_Full_CV_2026.md cv-print.css cv.html Nikita_Sokolsky_CV_2026.pdf \
  "Nikita Sokolsky, Senior Software Engineer" \
  "Senior Software Engineer with 15 years of experience in distributed systems and high-scale AWS infrastructure. 8 years at Amazon and AWS. Seattle, WA."

render Nikita_Sokolsky_OnePage_CV_2026.md cv-onepage-print.css cv-onepage.html Nikita_Sokolsky_OnePage_CV_2026.pdf \
  "Nikita Sokolsky, Senior Software Engineer, one-page CV" \
  "One-page CV. Senior Software Engineer with 15 years of experience in distributed systems and high-scale AWS infrastructure. 8 years at Amazon and AWS. Seattle, WA."

if python3 -c "import weasyprint" 2>/dev/null; then
  pages=$(python3 -c "from weasyprint import HTML; print(len(HTML('cv-onepage.html').render().pages))")
  if [ "$pages" != "1" ]; then
    echo "the one-page CV rendered $pages pages, trim it before sending it out" >&2
    exit 1
  fi
fi

cp -f Nikita_Sokolsky_CV_2026.pdf ../public/files/Sokolsky-Nikita-CV-2026.pdf
cp -f Nikita_Sokolsky_Full_CV_2026.md ../public/files/Sokolsky-Nikita-CV-2026.md
cp -f Nikita_Sokolsky_OnePage_CV_2026.pdf ../public/files/Sokolsky-Nikita-CV-2026-Short.pdf
cp -f Nikita_Sokolsky_OnePage_CV_2026.md ../public/files/Sokolsky-Nikita-CV-2026-Short.md

echo "Built both CVs and published them to public/files/"

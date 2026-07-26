#!/usr/bin/env bash
# Render the CV Markdown to PDF and publish both to the site's static files.
set -euo pipefail

cd "$(dirname "$0")"

source_md="Nikita_Sokolsky_Full_CV_2026.md"
pdf="Nikita_Sokolsky_CV_2026.pdf"
published_pdf="../public/files/Sokolsky-Nikita-CV-2026.pdf"
published_md="../public/files/Sokolsky-Nikita-CV-2026.md"

for tool in pandoc weasyprint; do
  if ! command -v "$tool" >/dev/null; then
    echo "$tool is required but not installed" >&2
    exit 1
  fi
done

pandoc "$source_md" \
  --from=markdown --to=html5 --standalone \
  --template=cv-template.html --section-divs --css=cv-print.css \
  --metadata title="Nikita Sokolsky, Senior Software Engineer" \
  --metadata author="Nikita Sokolsky" \
  --metadata lang=en \
  --metadata description="Senior Software Engineer with 15 years of experience in distributed systems and high-scale AWS infrastructure. 8 years at Amazon and AWS. Seattle, WA." \
  --metadata keywords="Senior Software Engineer,Distributed Systems,AWS,Java,Rust,Go,Scala,DynamoDB,Kinesis,Kafka,Lambda,LLM,agentic development,MCP,RAG,Amazon,Alexa,AWS WAF,Amazon Bar Raiser" \
  -o cv.html

# --pdf-tags emits the structure tree that ATS and LLM parsers rely on for reading order
weasyprint --pdf-tags --custom-metadata cv.html "$pdf"

cp -f "$pdf" "$published_pdf"
cp -f "$source_md" "$published_md"

echo "Built $pdf and published it to public/files/"

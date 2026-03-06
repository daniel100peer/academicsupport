# Run from inside C:\Users\danie\OneDrive\Desktop\academicsupport
# Fix _config.yml
@"
title: Academic Help
description: Comprehensive guides and resources to help students improve academic performance
url: "https://academicsupport.co.il"
baseurl: ""

permalink: pretty

markdown: kramdown
kramdown:
  input: GFM

plugins:
  - jekyll-sitemap
  - jekyll-seo-tag

defaults:
  - scope:
      path: "academic-writing"
    values:
      layout: "default"
  - scope:
      path: "study-skills"
    values:
      layout: "default"
  - scope:
      path: "student-resources"
    values:
      layout: "default"

exclude:
  - README.md
  - Gemfile
  - Gemfile.lock
  - index.md
"@ | Set-Content _config.yml -Encoding UTF8

# Fix blog.html - replace all post-template.html links
$blog = Get-Content blog.html -Raw -Encoding UTF8
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1456513080510)', 'href="/academic-writing/research-paper-writing/"$1'
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1434030216411)', 'href="/study-skills/study-techniques/"$1'
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1455390582262)', 'href="/academic-writing/citation-styles-guide/"$1'
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1521737711867)', 'href="/student-resources/choosing-a-major/"$1'
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1551288049)', 'href="/academic-writing/literature-review-guide/"$1'
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1486312338219)', 'href="/study-skills/overcome-procrastination/"$1'
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1484480974693)', 'href="/study-skills/time-management/"$1'
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1532619675605)', 'href="/academic-writing/thesis-statement-writing/"$1'
$blog = $blog -replace 'href="post-template.html"([\s\S]*?photo-1507679799987)', 'href="/student-resources/college-admissions/"$1'
[System.IO.File]::WriteAllText("$PWD\blog.html", $blog)

# Fix index.html - replace post-template.html links
$idx = Get-Content index.html -Raw -Encoding UTF8
$idx = $idx -replace 'href="post-template.html"([\s\S]*?photo-1456513080510)', 'href="/academic-writing/research-paper-writing/"$1'
$idx = $idx -replace 'href="post-template.html"([\s\S]*?photo-1434030216411)', 'href="/study-skills/study-techniques/"$1'
[System.IO.File]::WriteAllText("$PWD\index.html", $idx)

# Remove conflicting index.md
if (Test-Path index.md) { Remove-Item index.md }

Write-Host "All fixes applied!" -ForegroundColor Green

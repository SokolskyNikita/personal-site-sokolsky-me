# Nikita Sokolsky

Senior Software Engineer · 15 years of experience

Distributed systems · high-scale AWS infrastructure · LLM and agent systems

Seattle, WA · sokolx@gmail.com · +1 206 458 4791  
[www.linkedin.com/in/nsokolsky](https://www.linkedin.com/in/nsokolsky) · [github.com/SokolskyNikita](https://github.com/SokolskyNikita) · [sokolsky.me](https://sokolsky.me)

US Green Card holder, no sponsorship required · open to relocation anywhere in the US · available immediately

## Summary

Backend and distributed systems engineer with 15 years in the industry, 8 of them at Amazon and AWS. Most recently owned read and write paths in the device data store that every Alexa device in the world reads from: hundreds of millions of endpoints, over 100,000 requests per second, single-digit-millisecond reads. That work included the scaling that let Alexa+, Amazon's generative-AI Alexa, ship. Before that, two years inside the AWS WAF request path, which evaluates customer security rules on billions of HTTP requests a day in every AWS region. Java, Rust, Go and Scala on the backend, React when the frontend needs it. Building with LLMs since mid-2022, before ChatGPT shipped. Certified Amazon Bar Raiser with 200+ interviews conducted and mentor to multiple SDEs. M.Sc. in Artificial Intelligence.

## Experience

### Career break · Apr 2026 – Jul 2026

Planned time off after eight years at Amazon, spent time building personal projects.

### Amazon Web Services, Alexa AI · Seattle, WA

**Software Development Engineer II**, Alexa Device Intelligence · Nov 2024 – Apr 2026  
Java, DynamoDB, Kinesis, Lambda, EC2

- Owned read and write paths in the DynamoDB-backed store that holds device state, configuration and session data for every Alexa device in the world: hundreds of millions of endpoints, over 100,000 requests per second sustained, single-digit-millisecond reads. Every Alexa interaction blocks on a read from this store. One of the largest stateful systems inside Amazon.
- Scaled the store for the launch of Alexa+, Amazon's generative-AI Alexa, which needed more throughput and tighter read latency than the original design allowed.
- Redesigned read and write access patterns across the DynamoDB services to take hot-partition risk out of the peak device-traffic path.
- Cut the team's on-call load by automating the runbooks and CloudWatch alarms for the failure modes that were waking people up.

### Amazon Web Services, AWS WAF · Seattle, WA

**Software Development Engineer II**, AWS Web Application Firewall · Nov 2022 – Nov 2024  
Java, Rust, Kafka, Kinesis, EC2

- Halved p50 latency and raised throughput in the WAF request-processing pipeline, which enforces customer security rules on billions of HTTP and HTTPS requests a day in every AWS region.
- Cut the service fleet to a third of its size by moving the rule-evaluation engine's hottest component from Java to Rust. Profiling ruled out the cheaper fixes first, and the team took over the component once I had written the design review and walked them through the code.
- Built and operated the Kafka (MSK) and Kinesis pipelines carrying real-time rule telemetry and customer log delivery.
- Drove capacity planning and load-shedding strategy with the org's principal engineers to hold sub-millisecond rule-evaluation SLAs at peak traffic.

### Flexport · Seattle, WA

**Senior Software Engineer**, Freight Forwarding Platform · Feb 2022 – Nov 2022  
Scala, PostgreSQL (RDS), React

- Led design and delivery of the freight forwarding application that more than 2,000 Flexport cargo operators work in every day to move customer shipments.
- Replaced a legacy monolith with event-driven Scala services on PostgreSQL (RDS), and drew the service boundaries and event contracts myself. Migrated one workflow at a time so operators kept working through the cutover. Reliability and deploy cadence both improved.
- Built the React frontend with product and design, and got operators through the same work in fewer steps than the tool it replaced.

### Amazon Web Services, Networking · Seattle, WA

**Software Development Engineer**, AWS Networking · May 2021 – Feb 2022  
Go, ECS, Lambda

- Founding engineer on the service that launched as [Amazon CloudWatch Internet Monitor](https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-amazon-cloudwatch-internet-monitor/), which scores internet availability and performance for customer workloads on AWS, broken down by client location and ISP.
- Designed the monitoring backend as event-driven Go services on Lambda and ECS, with automatic failover between regions.
- Owned it from the first design document through operational runbooks and Amazon's internal launch review to release.

### Amazon, Business Payments · Seattle, WA

**Software Development Engineer**, Amazon Business Payments · May 2019 – May 2021  
Java, EC2, Lambda

- Led the multi-year architectural refactor of invoice generation for Amazon Business, then a roughly $25B-a-year gross-sales business, and wrote most of the replacement pipeline myself.
- Broke a brittle monolithic billing pipeline into independently deployable services, each with its own metrics and alarms, so one failing step stopped taking the whole pipeline with it and the team's on-call load dropped.
- Added regression-test automation and monitoring dashboards that let the team ship billing changes without a manual verification pass.

### Amazon, Business Credit · Vancouver, BC

**Software Development Engineer**, Amazon Business Credit Card · Jan 2018 – May 2019  
Java, Spring, React, EC2, Lambda

- Delivered the Amazon Business credit card for small businesses, a partnership with American Express, on schedule in late 2018.
- Owned both sides of the product: the React frontend customers apply and manage the card in, and the backend REST APIs behind it.
- Wrote the UI and backend integration test suites from scratch.

### Earlier experience

- **Moravia** · Brno, Czech Republic · Oct 2017 – Jan 2018. Software Development Consultant (C#, .NET, MVC). Built new workflow features and reliability fixes in an enterprise SaaS platform for corporate translation management.
- **ArexPharma GmbH** · Munich, Germany · Jun 2017 – Oct 2017. Software Development Consultant (C#, .NET, MVC). Rebuilt supplier workflows in a B2B marketplace for cross-border pharmaceutical trade in the EU.
- **ACTUM Digital** · Prague, Czech Republic · Nov 2016 – May 2017. Software Developer (Sitecore, C#, .NET). Delivered enterprise client websites and production warranty support.
- **Creditinfo Solutions** · Prague, Czech Republic · Apr 2013 – Oct 2016. Software Developer, internal platforms (C#, .NET, SQL Server, Dynamics CRM). Owned the Dynamics CRM integration layer serving the company's global offices, working with product managers across several European locations.
- **moodAway** · London, UK, remote · Jun 2015 – Sep 2015. Built AngularJS frontend features.
- **Internships and freelance:** University of Paderborn GET Lab, Germany (2012), algorithms for the GetBot autonomous rescue robot · Lappeenranta University of Technology, Finland (2013) · freelance web app for visual analysis of commercial websites (2011).

## Technical skills

- **Languages:** Java, Rust, Go, Scala, TypeScript, C#/.NET, SQL
- **AWS:** DynamoDB, Kinesis, MSK (Kafka), Lambda, EC2, ECS, S3, RDS, Elasticsearch, CloudWatch
- **Systems:** Distributed systems, event-driven architecture, stream processing, microservices, REST API design, capacity planning, load shedding, observability, on-call operations
- **AI systems:** LLM application design, agent harnesses and orchestration, MCP servers, RAG, context engineering
- **Data stores:** DynamoDB, PostgreSQL, SQL Server, Cloudflare D1
- **Frontend:** React, TypeScript, AngularJS
- **Delivery:** CI/CD, GitHub Actions, automated testing, Cloudflare Workers
- **Spoken languages:** English, Russian and Czech, fluent in all three

## Projects

### sokolsky.me · May 2026 – present

- Personal site that has become my personal SaaS: tools built for my own needs, including a custom flight search engine and a custom hotel search engine. Full list at [sokolsky.me/sitemap](https://sokolsky.me/sitemap).
- 90 pages in ten weeks, built with heavy coding-agent assistance.

### [rankmyweather.com](https://rankmyweather.com) · July 2026

- Ranks world cities by how the weather actually feels outdoors. Five years of ERA5 hourly reanalysis, 1,826 days on a 0.25° global grid, reduced to daily Steadman apparent temperature and scored per urban center, behind an interactive map.

## Recognition and mentoring

**Amazon Bar Raiser.** Certified to hold Amazon's hiring bar across all technical disciplines. 200+ interviews conducted, up to principal and senior principal level, across several AWS organizations.

**Mentoring.** Mentored multiple SDEs at Amazon and AWS over five years.

## Education

**M.Sc. in Artificial Intelligence** · Czech Technical University in Prague · 2015 – 2017  
**B.Sc. in Computer Software Engineering** · Czech Technical University in Prague · 2011 – 2014

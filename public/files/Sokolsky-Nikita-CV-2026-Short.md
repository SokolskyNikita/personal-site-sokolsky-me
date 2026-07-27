# Nikita Sokolsky

Senior Software Engineer · 15 years of experience

Distributed systems · high-scale AWS infrastructure · LLM and agent systems

Seattle, WA · sokolx@gmail.com · +1 206 458 4791  
[www.linkedin.com/in/nsokolsky](https://www.linkedin.com/in/nsokolsky) · [github.com/SokolskyNikita](https://github.com/SokolskyNikita) · [sokolsky.me](https://sokolsky.me)

US Green Card holder, no sponsorship required · open to relocation anywhere in the US · available immediately

## Summary

Backend and distributed systems engineer, 15 years in the industry and 8 at Amazon and AWS: worked on the AWS WAF evaluation engine, then the data store behind every Alexa device in the world. Java, Rust, Go and Scala, building with LLMs since mid-2022.

## Experience

### Amazon Web Services, Alexa AI · Seattle, WA

**Software Development Engineer II**, Alexa Device Intelligence · Nov 2024 – Apr 2026 · Java, DynamoDB, Kinesis, Lambda

- Owned read and write paths in the DynamoDB-backed store that holds device state, configuration and session data for every Alexa device in the world: hundreds of millions of endpoints, over 100,000 requests per second at single-digit-millisecond reads. Every Alexa interaction blocks on a read from this store.
- Scaled the store for the launch of Alexa+, Amazon's generative-AI Alexa, and redesigned access patterns to take hot-partition risk out of the peak device-traffic path.

### Amazon Web Services, AWS WAF · Seattle, WA

**Software Development Engineer II** · Nov 2022 – Nov 2024 · Java, Rust, Kafka, Kinesis

- Halved p50 latency in the pipeline enforcing customer security rules on billions of HTTP requests a day in every AWS region.
- Cut the service fleet to a third of its size by moving the rule-evaluation engine's hottest component from Java to Rust. Profiling ruled out the cheaper fixes first, and the team took over the component once I had walked them through the code.

### Flexport · Seattle, WA

**Senior Software Engineer**, Freight Forwarding Platform · Feb 2022 – Nov 2022 · Scala, PostgreSQL, React

- Led design and delivery of the freight forwarding application that more than 2,000 cargo operators work in every day. Replaced a legacy monolith with event-driven Scala services, one workflow at a time, with no operator downtime.
- Built the React frontend with product and design, and got operators through the same work in fewer steps than the old tool.

### Amazon Web Services, Networking · Seattle, WA

**Software Development Engineer** · May 2021 – Feb 2022 · Go, ECS, Lambda

- Founding engineer on the service that launched as [Amazon CloudWatch Internet Monitor](https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-amazon-cloudwatch-internet-monitor/): designed and built the event-driven Go backend, and carried it from scoping through Amazon's internal launch review.

### Amazon, Business Payments and Business Credit · Seattle, WA and Vancouver, BC

**Software Development Engineer** · Jan 2018 – May 2021 · Java, Spring, React

- Led the architectural refactor of invoice generation for Amazon Business, then a roughly $25B-a-year gross-sales business, and broke a brittle monolith into independently deployable services. Wrote most of the replacement myself.
- Delivered the Amazon Business credit card with American Express on schedule in 2018, and owned frontend and backend.

### Earlier · 2011 – 2018

Developer and consultant in Prague, Munich and London: C#/.NET platforms, Dynamics CRM, AngularJS.

## Technical skills

- **Languages:** Java, Rust, Go, Scala, TypeScript, C#/.NET, SQL
- **AWS and data:** DynamoDB, Kinesis, MSK (Kafka), Lambda, EC2, ECS, S3, RDS, CloudWatch, PostgreSQL
- **Systems:** Distributed systems, event-driven architecture, stream processing, capacity planning, load shedding, observability
- **AI systems:** LLM application design, agent orchestration and custom harnesses, MCP servers, RAG, context engineering

## Projects, recognition and education

- **[sokolsky.me](https://sokolsky.me)** · personal SaaS: custom flight and hotel search engines, 90 pages in ten weeks with coding agents.
- **[rankmyweather.com](https://rankmyweather.com)** · ranks world cities by how the weather feels outdoors, from five years of ERA5 reanalysis data.
- **Amazon Bar Raiser** · certified to hold Amazon's hiring bar, 200+ interviews conducted, multiple SDEs mentored.
- **M.Sc. Artificial Intelligence** and **B.Sc. Computer Software Engineering** · Czech Technical University, Prague · 2011 – 2017

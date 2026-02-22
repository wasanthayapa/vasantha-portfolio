// lib/data.ts
export const caseStudies = [
  {
    title: "Multi-Tenant Workforce SaaS Platform",
    tags: ["Spring Boot", "Microservices", "PostgreSQL", "MongoDB"],
    problem:
      "Needed a scalable platform integrating roster, time tracking, forecasting, and user management with strong tenant isolation.",
    approach:
      "Designed service boundaries, implemented shared platform capabilities, optimized data access patterns, and introduced reliability patterns for production scaling.",
    outcome:
      "Improved maintainability and scalability for multi-module delivery while enabling faster feature rollout across tenants.",
  },
  {
    title: "API Gateway Security & Global Error Handling",
    tags: ["API Gateway", "OAuth2/JWT", "Auth0"],
    problem:
      "Required a consistent security layer and predictable error responses across multiple microservices.",
    approach:
      "Implemented centralized policy enforcement, JWT/OAuth2 validation, Auth0 integration, and global exception handling patterns.",
    outcome:
      "Reduced integration issues and improved client experience with standardized error contracts and secure access control.",
  },
  {
    title: "Distributed Scheduling Across Pods",
    tags: ["Distributed Locking", "ShedLock", "Kubernetes"],
    problem:
      "Background jobs were executing multiple times in multi-pod deployments, causing duplicate processing.",
    approach:
      "Implemented distributed locks using ShedLock (Mongo provider) and hardened retry + observability patterns.",
    outcome:
      "Ensured single-instance execution in clustered environments and improved operational reliability.",
  },
  {
    title: "CI/CD Optimization for Container Deployments",
    tags: ["Azure DevOps", "Docker", "CI/CD"],
    problem:
      "Build and deployment processes were slow and inconsistent across environments.",
    approach:
      "Optimized Azure DevOps pipelines for automated container build/push/deploy, added consistency checks and streamlined release steps.",
    outcome:
      "More reliable deployments, reduced manual effort, and faster delivery cycles.",
  },
];

export const competencies = [
  {
    title: "Backend & Architecture",
    items: [
      "Java, Spring Boot, Spring Security, Hibernate/JPA",
      "Microservices architecture, service boundaries, integration patterns",
      "API design: REST, versioning, standard response contracts",
      "Distributed systems: locks, scheduling, reliability patterns",
    ],
  },
  {
    title: "Security & Platform Engineering",
    items: [
      "JWT/OAuth2, Auth0 integration, secure gateway patterns",
      "Centralized error handling and policy enforcement",
      "Multi-tenant SaaS design considerations",
      "Operational robustness for production workloads",
    ],
  },
  {
    title: "Data & Performance",
    items: [
      "PostgreSQL/MySQL schema design and optimization",
      "MongoDB modeling and query tuning",
      "Indexing, performance improvements, scalability planning",
      "Data modeling aligned to business domains",
    ],
  },
  {
    title: "Cloud & Delivery",
    items: [
      "Azure DevOps CI/CD pipelines",
      "Docker, Kubernetes deployment workflows",
      "AWS exposure: EC2, S3, RDS",
      "Engineering leadership: code reviews, mentoring, Agile delivery",
    ],
  },
];
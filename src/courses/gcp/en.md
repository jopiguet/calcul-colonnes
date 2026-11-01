# Google Cloud — the essentials of the test

## How to use this course

This course goes with the Google Cloud test. It is organised like a platform team's checklist: who owns what, who may do what, how traffic flows, where workloads run and how data is kept. The commands use `gcloud`; run them in Cloud Shell on a test project.

| Level | What it asks |
|---|---|
| Beginner | Projects, regions and zones, roles, VPCs, Compute Engine and Cloud Storage |
| Intermediate | IAM in practice, service accounts, firewall rules, Cloud Run, storage classes |
| Advanced | Inheritance, impersonation, organisation policies, load balancing, GKE, Terraform |
| Expert | Deny policies, workload identity federation, VPC Service Controls, hierarchical firewalls, availability design |

## Part 1 — The resource hierarchy

Resources sit in **projects**; projects sit in **folders**, under one **organisation** tied to a domain. Billing is linked per project. Policies set on a node are inherited by everything below it. Organisation policies restrict what may be configured — for example `constraints/iam.allowedPolicyMemberDomains` limits sharing to your own domain, and `constraints/gcp.resourceLocations` limits regions. A landing zone sets up this hierarchy, shared networking, logging and guardrails before the first workload arrives.

## Part 2 — IAM

A binding grants a **role** to a **principal** on a **resource**. Basic roles (Owner, Editor, Viewer) are too broad; predefined roles such as `roles/storage.objectViewer` fit one service; custom roles list exact permissions. Allow policies are inherited and add up: a grant on the folder cannot be removed on the project. Deny policies are evaluated before allow policies and win. Conditions restrict a grant by time, resource name or tag.

```bash
gcloud projects add-iam-policy-binding my-project \
  --member="group:data-readers@example.com" \
  --role="roles/bigquery.dataViewer"
```

Grant to groups, not to individual users, and prefer the narrowest role at the lowest level.

## Part 3 — Service accounts

A service account is an identity for code. Attach it to the workload — a VM, a Cloud Run service — and the code gets short-lived credentials from the metadata server; avoid downloadable keys. A user with `roles/iam.serviceAccountTokenCreator` can **impersonate** a service account to act as it, which is auditable and needs no key. Workloads outside Google Cloud — GitHub Actions, AWS, an on-premises cluster — use **workload identity federation** to exchange their own tokens for Google credentials.

## Part 4 — Security

Cloud Audit Logs record admin activity (always on), data access (to turn on) and policy denials. Security Command Center gathers findings. Secret Manager stores secrets with versions and IAM; Cloud KMS manages encryption keys, including customer-managed keys for storage and databases. **VPC Service Controls** draw a perimeter around services such as Cloud Storage and BigQuery, so data cannot be copied out even with valid credentials.

## Part 5 — Networking

A VPC network is global; its **subnets** are regional, each with an IP range. A `/24` gives 256 addresses, of which Google reserves 4, so 252 are usable. Firewall rules apply to the whole network, select instances by tag or service account, and are evaluated by priority (lower number first); the implied rules allow all egress and deny all ingress. Hierarchical firewall policies apply from the organisation or a folder and may delegate to the VPC rules with `goto_next`.

Connectivity: VPC peering joins two networks, Shared VPC lets service projects use a host project's network, Cloud VPN and Interconnect reach on-premises, Cloud NAT gives private VMs outbound access. The global external Application Load Balancer serves HTTP(S) from one anycast IP; network load balancers pass TCP and UDP through.

## Part 6 — Compute

| Service | When |
|---|---|
| Compute Engine | Full control of a VM, any software |
| Cloud Run | A container that answers requests and scales to zero |
| GKE | Many containers, Kubernetes features, long-running services |
| Cloud Run functions | A small function triggered by an event |

Managed instance groups recreate failed VMs and autoscale. Cloud Run scales by concurrent requests per instance; a minimum instance count avoids cold starts. GKE Autopilot manages the nodes for you; Standard leaves them to you.

## Part 7 — Storage and data protection

Cloud Storage classes trade storage price against access price: Standard, Nearline (30 days minimum), Coldline (90), Archive (365). Lifecycle rules move or delete objects by age. Use uniform bucket-level access so IAM alone controls access, and signed URLs for temporary sharing. Object versioning and retention policies protect against deletion; a locked retention policy cannot be shortened. Databases: Cloud SQL for PostgreSQL and MySQL, Spanner for global scale, Firestore for documents, BigQuery for analytics.

## Part 8 — Operations

`gcloud config set project`, `gcloud auth login` and `gcloud auth application-default login` set up the tools. Terraform describes infrastructure as code; keep its state in a Cloud Storage bucket with versioning. Cloud Monitoring and Cloud Logging collect metrics and logs; alerting policies notify on thresholds. Reliability is designed per region: zonal resources fail with their zone, regional ones survive a zone, and multi-region designs survive a region. An SLO with an error budget decides when to ship and when to fix.

## Sources

| Topic | Free reference |
|---|---|
| All services | [Google Cloud documentation](https://cloud.google.com/docs) |
| IAM | [IAM overview](https://cloud.google.com/iam/docs/overview) |
| Networking | [VPC overview](https://cloud.google.com/vpc/docs/overview) |
| Architecture | [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework) |
| Reliability | [Google SRE books](https://sre.google/books/) |

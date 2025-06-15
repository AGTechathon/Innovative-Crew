📌 Overview
Factory Management System (FMS) is a web-based tool designed to help factories track and manage their resources effectively. It centralizes:

🧍‍♂️ Worker Data & Performance

📦 Order Management & Fulfillment

🧰 Inventory Levels & Movements

📈 Operational Efficiency Insights

Unlike traditional ERPs, this platform leverages real-time sync, cloud scalability, and a modern tech stack to deliver a fast, responsive, and intelligent user experience.

⚙️ Tech Stack
Layer	Tech Used
Frontend	React, TypeScript, TailwindCSS
Backend	Node.js (for custom APIs and integrations)
Auth	Firebase Authentication
Database	Firebase Firestore (Realtime NoSQL)
Hosting	Firebase Hosting
Functions	Firebase Cloud Functions (TypeScript)
Storage	Firebase Storage (documents, logs, images)
DevOps	GitHub Actions, Firebase CLI

🧩 Core Modules
👷 Worker Management

Register workers, assign roles & shifts

Track attendance & performance

Performance score based on output & quality

📦 Order Management

Create and track production orders

Assign orders to workers/machines

Real-time status updates (Pending, In-Progress, Complete)

🏪 Inventory System

Manage raw material and finished goods

Real-time stock updates

Automatic low-stock alerts and reorder triggers

📊 Efficiency Dashboard

Track production speed, error rates, downtime

View per-worker, per-order, or factory-wide efficiency

Export reports to PDF or CSV

🧠 How We’re Different
Feature	FMS (Our Website)	Traditional ERP
💡 Real-time data sync	✅ Firestore + Listeners	❌ Refresh required or delayed
🧪 Type-safe development	✅ Full TypeScript stack	❌ Often PHP/Java-based
🔄 Serverless, scalable backend	✅ Firebase Cloud Functions	❌ On-premise, hard to scale
🎯 Focused on efficiency metrics	✅ Live dashboard + analysis	❌ Basic reports
📱 Mobile-friendly interface	✅ PWA with offline support	⚠️ Not mobile-optimized
🔐 Fine-grained role permissions	✅ Firebase Auth + Claims	⚠️ Limited role control

📈 System Architecture Diagram
plaintext
Copy
Edit
🔐 Role-Based Access (RBAC)
Role	Permissions
Admin	Full access to all modules, add/remove users, manage settings
Manager	View/edit orders, assign workers, monitor inventory
Worker	View assigned tasks, submit logs, update status
Auditor	Read-only access to all modules (for quality control or external reviewers)     


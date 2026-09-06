# MarketWorld — Master Implementation Prompt for Cursor / Claude Code

## ROLE

Act as a senior principal software architect, security engineer, backend engineer, frontend engineer, PostgreSQL/RLS specialist, DevOps engineer, QA engineer, and production-readiness auditor.

You are continuing an EXISTING MarketWorld Marketplace SaaS project.

## NON-NEGOTIABLE RULE

DO NOT restart, recreate, replace, or scaffold a new application.

Do not delete working functionality simply because you would personally structure it differently.

FIRST audit the current repository thoroughly. Then continue development from the current implementation.

The architecture and API reference in `ARCHITECTURE.md` are the target architecture. Adapt the existing implementation toward it incrementally.

---

# 1. FIRST: COMPLETE PROJECT AUDIT

Before changing code, inspect:

- frontend
- backend
- database
- migrations
- controllers
- services
- routes
- middleware
- models/repositories
- validators
- Pinia stores
- Vue views/components
- Socket.io
- payment integration
- subscription system
- RLS
- uploads
- notifications
- analytics
- tests
- environment configuration
- scripts
- documentation
- package files
- Docker/deployment files
- CI/CD

Search for:

- TODO
- FIXME
- duplicate files
- duplicate controllers
- duplicate routes
- unused imports
- dead code
- broken imports
- missing environment variables
- insecure defaults
- hard-coded secrets
- client-trusted authorization
- client-trusted pricing
- client-trusted payment status
- missing RLS
- missing ownership checks
- cross-tenant queries
- unhandled promises
- inconsistent error handling

Create an internal implementation matrix:

| Feature | Existing | Partial | Missing | Broken | Risk |
|---|---|---|---|---|---|

Do not invent missing functionality before determining what already exists.

---

# 2. READ ARCHITECTURE.md

Treat `ARCHITECTURE.md` as the master target for:

- database architecture
- RLS
- API structure
- authorization
- tenant isolation
- domain boundaries
- security
- payment flow
- subscription flow
- support
- messaging
- shipping
- tax
- wallet
- commissions
- administration

If the existing code differs, preserve working behavior unless the change is necessary for correctness, security, maintainability, or the requirements below.

---

# 3. DESTRUCTIVE CHANGE GATE

STOP and request explicit confirmation before:

- deleting files
- deleting tables
- dropping columns
- destructive migrations
- changing authentication behavior
- changing password/token mechanisms
- changing payment behavior
- changing subscription behavior
- changing financial calculations
- changing production data semantics
- irreversible storage changes

Safe additions, bug fixes, tests, validation improvements, and non-destructive refactors may proceed.

---

# 4. TARGET ARCHITECTURE

Use a modular monolith:

Vue 3
→ Express/Node.js
→ Services
→ Data Access
→ PostgreSQL/RLS

Supporting systems:

- Redis
- Socket.io
- Paystack
- Cloudinary
- SendGrid/SMTP
- optional SMS/push
- background workers
- monitoring
- CI/CD

Do not introduce microservices unless there is a concrete requirement.

---

# 5. DATABASE IMPLEMENTATION

Audit all existing migrations first.

Do not blindly create duplicate tables.

Ensure the final database supports:

Identity:
- users
- refresh_tokens
- roles
- permissions
- role_permissions
- user_permissions

Seller:
- sellers
- stores
- domains
- seller_agents
- agent_permissions
- agent_activity

Customer:
- customers
- seller_customers
- customer_addresses

Catalog:
- categories
- brands
- products
- product_tags
- product_variants
- product_media

Inventory:
- inventory
- inventory_movements

Commerce:
- carts
- cart_items
- orders
- order_items
- order_status_history

Payments:
- payments
- payment_events

Shipping:
- shipping_methods
- shipping_zones
- shipments
- shipment_events

Tax:
- tax_rules
- tax_exemptions

Returns:
- return_requests
- return_items
- refunds

Finance:
- commission_rules
- commissions
- wallets
- wallet_transactions
- payout_requests

Reviews:
- reviews
- review_reports

Communication:
- support_tickets
- support_ticket_messages
- support_ticket_attachments
- conversations
- conversation_participants
- messages
- message_attachments

Notifications:
- notifications
- notification_preferences

Subscriptions:
- subscription_plans
- subscriptions
- subscription_events

Verification:
- seller_verifications
- verification_documents

Security:
- fraud_events
- audit_logs
- impersonation_sessions

Configuration:
- feature_flags
- system_settings

Operations:
- background_jobs
- analytics_daily_seller
- analytics_daily_platform

Add only what is genuinely missing.

---

# 6. POSTGRESQL RLS

RLS is a hard security boundary.

For every tenant-scoped table:

1. enable RLS;
2. define SELECT policy;
3. define INSERT policy;
4. define UPDATE policy;
5. define DELETE policy where applicable;
6. test policies directly;
7. ensure admin policies are explicit;
8. ensure customer policies restrict ownership;
9. ensure agent policies restrict seller assignment.

Request context should safely establish:

- `app.current_user_id`
- `app.current_seller_id`
- `app.current_role`

Use `SET LOCAL` inside transactions where appropriate.

Never concatenate tenant values into SQL.

---

# 7. AUTHENTICATION

Maintain or implement:

- email/password
- bcrypt
- email verification
- password reset
- short-lived access JWT
- random hashed refresh tokens
- httpOnly cookies
- refresh token rotation/revocation
- Google OAuth
- logout
- session management
- rate limiting
- suspicious login detection

Never expose refresh tokens to JavaScript.

---

# 8. AUTHORIZATION

Implement:

Authentication
→ RBAC
→ Tenant context
→ Resource ownership
→ Agent assignment
→ Subscription entitlement
→ Validation
→ RLS

Every protected endpoint must perform appropriate checks.

Never trust:

- role from frontend
- seller_id from request body
- customer_id from request body
- product owner from request body
- payment status from frontend
- subscription status from frontend
- client-provided price
- commission amount
- wallet balance

---

# 9. SELLER ISOLATION

A seller must NEVER access another seller's:

- products
- customers
- orders
- payments
- subscriptions
- shipments
- tickets
- conversations
- messages
- analytics
- wallets
- payouts
- uploaded files
- verification data

Test deliberate cross-seller attacks.

---

# 10. CUSTOMER ISOLATION

Customers may only access:

- own profile
- own orders
- own invoices
- own addresses
- own wishlist
- own wallet
- own tickets
- own conversations

Customers may communicate only with:

- sellers they legitimately purchased from
- customer-care agents belonging to those sellers

Do not allow arbitrary seller/customer/conversation IDs to bypass ownership.

---

# 11. AGENT ISOLATION

Customer-care agents must be associated with exactly the seller scope they are authorized to serve.

Agents must not access another seller's:

- tickets
- customers
- orders
- products
- analytics
- messages
- reports
- files

Implement:

- invitations
- activation
- deactivation
- removal
- permissions
- password reset
- activity history
- performance
- assignment
- reassignment

---

# 12. STORE BRANDING

Complete:

- logo
- banner
- favicon
- theme colors
- fonts
- homepage configuration
- SEO
- social links
- contact information
- business hours

Implement seller subdomains and custom-domain support only where infrastructure supports it.

Never allow arbitrary hostname-to-seller mapping without verification.

---

# 13. PRODUCTS

Ensure complete product functionality:

- SKU
- pricing
- discount
- categories
- brands
- tags
- variants
- specifications
- images
- videos
- shipping information
- stock thresholds
- import/export
- moderation
- SEO

Uploads must be validated and tenant-scoped.

---

# 14. INVENTORY

Ensure transactional inventory updates.

Prevent:

- overselling
- negative stock
- double deduction
- duplicate webhook deduction

Maintain inventory movement history.

---

# 15. CHECKOUT

Never trust frontend totals.

Recalculate server-side:

- products
- variants
- quantity
- price
- discounts
- taxes
- shipping
- commission where applicable
- final total

Create a pending order before payment where the existing design requires it.

---

# 16. PAYSTACK

Implement securely:

- initialization
- verification
- webhook signature validation
- idempotency
- payment records
- reconciliation
- subscription payments
- customer payments
- refunds where provider support is available

The frontend must never mark an order as paid.

---

# 17. SUBSCRIPTIONS

Ensure:

- 30-day trial
- trial expiry
- active subscription
- cancellation
- renewal
- failed payment handling
- reconciliation
- entitlement checks
- administrative premium override

Expired trial state must be enforced server-side.

---

# 18. ORDERS

Complete lifecycle:

Pending
→ Paid
→ Processing
→ Shipped
→ Out for Delivery
→ Delivered
→ Returned/Refunded/Cancelled as appropriate

Every status transition should be validated and audited.

---

# 19. SHIPPING

Implement:

- shipping methods
- zones
- fees
- estimated delivery
- carriers
- tracking
- shipment events
- delivery proof
- returns

Keep shipping provider integration behind services/interfaces.

---

# 20. TAX

Implement a tax service supporting:

- VAT
- GST
- sales tax
- country rules
- regional rules
- exemptions
- effective dates
- tax reports

Store tax snapshots on orders.

Historical orders must not change because a tax rule later changes.

---

# 21. RETURNS AND REFUNDS

Implement:

Customer request
→ Seller review
→ Approval/rejection
→ Return
→ Inspection
→ Refund/replacement
→ Completion

Protect against duplicate refunds.

---

# 22. WALLET AND FINANCE

Implement immutable wallet transactions.

Seller flow:

Payment
→ Commission
→ Tax
→ Pending earnings
→ Available balance
→ Withdrawal
→ Payout

Never update wallet balance without a corresponding transaction record.

---

# 23. COMMISSION ENGINE

Support:

- percentage
- flat
- category
- seller-specific
- subscription-plan
- withdrawal fee

Store a rate snapshot on financial records.

Do not recalculate historical commission from current configuration.

---

# 24. SUPPORT

Implement complete ticket workflow.

Customer:
- create
- reply
- attachment
- close
- reopen

Agent:
- claim
- reply
- assign
- transfer
- escalate
- resolve
- internal notes

Seller:
- oversee
- assign
- reassign
- monitor

Admin:
- platform monitoring according to permissions

Internal notes must never reach customers.

---

# 25. SOCKET.IO

Implement:

- authenticated sockets
- secure rooms
- presence
- typing
- delivery
- read receipts
- message history
- notifications
- attachment authorization

Never allow:

`socket.join(clientProvidedRoom)`

without server-side authorization.

---

# 26. NOTIFICATIONS

Create event-driven notifications for:

- order
- payment
- shipment
- ticket
- message
- review
- promotion
- subscription
- trial expiration
- inventory

Use background workers for slow delivery.

---

# 27. ANALYTICS

Seller analytics:

- revenue
- profit
- conversion
- returning customers
- LTV
- products
- forecasting
- inventory

Platform analytics:

- MRR
- ARR
- churn
- active sellers
- active customers
- revenue
- growth

All seller analytics must be tenant-scoped.

---

# 28. FRAUD

Implement basic risk detection:

- failed logins
- suspicious login patterns
- duplicate accounts
- suspicious payments
- abnormal purchase behavior

Do not build unsafe automatic blocking rules that can lock legitimate users without review.

---

# 29. VERIFICATION

Implement seller verification:

- business documents
- identity documents
- review
- approval
- rejection
- verified badge

Private documents require strict access controls.

---

# 30. BACKGROUND JOBS

Move long operations into jobs:

- email
- notifications
- image optimization
- exports
- reports
- analytics
- subscription reconciliation
- trial reminders
- backups

Jobs must be idempotent and tenant-safe.

---

# 31. OBSERVABILITY

Implement:

- request IDs
- structured logging
- health checks
- database health
- dependency health
- error monitoring
- performance metrics
- slow query detection
- memory/CPU monitoring
- storage monitoring

Never expose secrets through health endpoints.

---

# 32. SEO

Implement:

- sitemap
- robots.txt
- canonical URLs
- Open Graph
- Twitter cards
- structured data
- product metadata
- store metadata

Prevent private dashboard pages from being indexed.

---

# 33. ACCESSIBILITY

Review:

- keyboard navigation
- semantic HTML
- ARIA
- forms
- error messages
- focus states
- contrast
- dialogs
- tables
- navigation
- screen reader support

---

# 34. PWA

Optional but implementable:

- manifest
- service worker
- installability
- offline cart
- push
- background sync

Never permit offline state to falsely confirm payments/orders.

---

# 35. AI FEATURES

If provider credentials and infrastructure exist, add behind feature flags:

- product descriptions
- SEO suggestions
- support replies
- sales insights
- review summaries

AI must not bypass permissions or directly perform sensitive actions without authorization.

---

# 36. ADMINISTRATION

Complete:

- seller management
- user management
- customer management
- agent management
- product moderation
- subscriptions
- plans
- refunds
- reviews
- verification
- fraud
- audit logs
- analytics
- system settings
- feature flags

---

# 37. SUPER ADMIN IMPERSONATION

Implement secure impersonation of sellers and agents.

Requirements:

- no target password
- short-lived session
- visible impersonation state
- return-to-admin
- audit log
- target identity
- initiating admin identity
- reason
- expiration

Never permit silent/unlogged impersonation.

---

# 38. API DOCUMENTATION

Maintain OpenAPI documentation for every endpoint.

Document:

- method
- path
- authentication
- roles
- tenant scope
- parameters
- request
- response
- errors
- examples
- webhook signatures

---

# 39. TESTING

Run:

### Unit
- services
- validators
- calculations
- authorization

### Integration
- APIs
- database
- RLS
- payments
- subscriptions
- support
- notifications

### Security
- cross-seller
- cross-customer
- privilege escalation
- RLS bypass
- socket abuse
- file access
- payment manipulation
- subscription bypass

### E2E
Customer:
register → browse → cart → checkout → payment → order → support → return

Seller:
register → trial → store → product → inventory → order → shipping → customer support → analytics → subscription

Agent:
invite → activate → ticket → conversation → assignment → resolution

Admin:
seller management → verification → moderation → refund → analytics → audit

Super Admin:
system config → commissions → feature flags → impersonation → audit

---

# 40. QUALITY GATES

Before completion:

```text
npm test
npm run lint
npm run build
npm run check
database migration verification
RLS security tests
E2E tests
```

Use the actual package scripts discovered during the audit. Do not invent commands that the repository does not define.

---

# 41. FINAL AUDIT

Search again for:

- TODO
- FIXME
- broken imports
- duplicate logic
- dead routes
- unused imports
- missing validation
- missing authorization
- missing RLS
- hard-coded secrets
- insecure URLs
- console errors
- failed API requests

Verify all implemented functionality end-to-end.

---

# 42. FINAL REPORT

At completion provide:

1. Implementation summary.
2. Files/modules changed.
3. Controllers fixed.
4. Services created/refactored.
5. Database migrations.
6. RLS changes.
7. API changes.
8. Security improvements.
9. Performance improvements.
10. Tests executed and results.
11. Environment variables added.
12. Documentation updated.
13. Known limitations.
14. Deployment recommendations.

Do NOT claim production-ready unless the verification evidence supports it.

If external services cannot be tested because credentials are unavailable, explicitly state that limitation.

---

# 43. MOST IMPORTANT RULE

Do not stop at "the build passes."

MarketWorld is complete only when the implemented workflows work end-to-end and tenant isolation, authorization, payments, subscriptions, database security, realtime communication, and production behavior have been verified.

Proceed carefully, incrementally, and non-destructively.

# Requirements Document

## Introduction

GhostMilk is a spooky-themed SaaS prototype that digitizes dairy milk collection records. It replaces traditional paper slips with a modern PWA built on Next.js and Supabase. The system allows dairy owners to manage customers, record milk entries (FAT, SNF, liters, amount), and generate analytical dashboards. Customers can log in to view daily entries, monthly summaries, and historical reports. The application supports theme switching between a Halloween spooky theme and a clean professional SaaS theme.

## Glossary

- **GhostMilk System**: The web application that manages dairy milk collection records
- **Dairy Owner**: A user who owns/operates a dairy and manages customers and milk entries
- **Customer**: A person who supplies milk to a dairy and can view their own records
- **Milk Entry**: A record containing FAT percentage, SNF percentage, liters collected, and calculated amount
- **FAT**: Fat content percentage in milk (typically 3.0-6.0%)
- **SNF**: Solid-Not-Fat content percentage in milk (typically 8.0-9.5%)
- **Rate**: Price per liter based on FAT/SNF combination
- **Tenant**: A dairy organization; all data is isolated per tenant (dairy_id)
- **Spooky Theme**: Halloween-themed UI with neon purple, ghost animations, fog effects
- **Clean Theme**: Professional SaaS UI with clean blue styling

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to securely authenticate into the system, so that I can access my dairy or customer account.

#### Acceptance Criteria

1. WHEN a user submits valid credentials THEN the GhostMilk System SHALL authenticate the user and create a session
2. WHEN a user submits invalid credentials THEN the GhostMilk System SHALL display an error message and prevent access
3. WHEN an authenticated user requests logout THEN the GhostMilk System SHALL terminate the session and redirect to the login page
4. WHEN a user session expires THEN the GhostMilk System SHALL require re-authentication before allowing access
5. WHEN a new dairy owner registers THEN the GhostMilk System SHALL create a new tenant (dairy) and associate the user as owner

### Requirement 2: Customer Management

**User Story:** As a dairy owner, I want to manage my customers, so that I can track who supplies milk to my dairy.

#### Acceptance Criteria

1. WHEN a dairy owner adds a new customer with valid details THEN the GhostMilk System SHALL create the customer record associated with the dairy tenant
2. WHEN a dairy owner views the customer list THEN the GhostMilk System SHALL display only customers belonging to that dairy tenant
3. WHEN a dairy owner updates customer information THEN the GhostMilk System SHALL persist the changes and display updated data
4. WHEN a dairy owner deletes a customer THEN the GhostMilk System SHALL remove the customer and associated milk entries from the active view
5. WHEN a dairy owner searches for a customer by name THEN the GhostMilk System SHALL return matching customers from that dairy tenant only

### Requirement 3: Milk Entry Recording

**User Story:** As a dairy owner, I want to record milk entries, so that I can track daily milk collection from each customer.

#### Acceptance Criteria

1. WHEN a dairy owner submits a milk entry with FAT, SNF, and liters THEN the GhostMilk System SHALL calculate the amount based on configured rates and save the entry
2. WHEN a dairy owner submits a milk entry with FAT value outside 0.0-15.0 range THEN the GhostMilk System SHALL reject the entry and display a validation error
3. WHEN a dairy owner submits a milk entry with SNF value outside 0.0-15.0 range THEN the GhostMilk System SHALL reject the entry and display a validation error
4. WHEN a dairy owner submits a milk entry with liters value less than or equal to zero THEN the GhostMilk System SHALL reject the entry and display a validation error
5. WHEN a milk entry is successfully saved THEN the GhostMilk System SHALL display a ghost pop-up animation confirming success
6. WHEN a dairy owner views milk entries for a date THEN the GhostMilk System SHALL display all entries for that date belonging to the dairy tenant

### Requirement 4: Rate Configuration

**User Story:** As a dairy owner, I want to configure milk rates, so that the system calculates payment amounts correctly.

#### Acceptance Criteria

1. WHEN a dairy owner sets a rate for a FAT/SNF combination THEN the GhostMilk System SHALL store the rate and use it for future amount calculations
2. WHEN a dairy owner updates an existing rate THEN the GhostMilk System SHALL apply the new rate to subsequent entries only
3. WHEN no rate exists for a FAT/SNF combination THEN the GhostMilk System SHALL use interpolation or display a warning to configure the rate
4. WHEN a dairy owner views the rate table THEN the GhostMilk System SHALL display all configured rates for that dairy tenant

### Requirement 5: Dashboard and Summaries

**User Story:** As a dairy owner, I want to view summaries and analytics, so that I can understand my dairy's performance.

#### Acceptance Criteria

1. WHEN a dairy owner views the dashboard THEN the GhostMilk System SHALL display daily total liters, total amount, and entry count for the current day
2. WHEN a dairy owner selects a date range THEN the GhostMilk System SHALL display aggregated totals for that period
3. WHEN a dairy owner views weekly summary THEN the GhostMilk System SHALL display day-by-day breakdown of liters and amounts
4. WHEN a dairy owner views monthly summary THEN the GhostMilk System SHALL display week-by-week breakdown and monthly totals

### Requirement 6: Customer Portal

**User Story:** As a customer, I want to view my milk entries, so that I can verify my daily submissions and track my earnings.

#### Acceptance Criteria

1. WHEN a customer logs in THEN the GhostMilk System SHALL display only that customer's milk entries
2. WHEN a customer views daily entries THEN the GhostMilk System SHALL show FAT, SNF, liters, and amount for each entry
3. WHEN a customer views monthly summary THEN the GhostMilk System SHALL display total liters and total amount for the month
4. WHEN a customer views historical data THEN the GhostMilk System SHALL display entries grouped by month with totals

### Requirement 7: Theme System

**User Story:** As a user, I want the application to support theme switching, so that the dairy can use spooky mode for hackathon or clean mode for production.

#### Acceptance Criteria

1. WHEN the application loads with THEME_MODE set to spooky THEN the GhostMilk System SHALL apply the Halloween theme with neon purple glow, ghost animations, and fog overlay
2. WHEN the application loads with THEME_MODE set to clean THEN the GhostMilk System SHALL apply the professional blue theme without animations
3. WHEN theme mode changes THEN the GhostMilk System SHALL update all UI components to reflect the selected theme
4. WHEN spooky theme is active THEN the GhostMilk System SHALL display ghost floating animation, flickering neon text, and skeleton loaders

### Requirement 8: Multi-Tenant Data Isolation

**User Story:** As a system administrator, I want data to be isolated per dairy, so that each dairy's information remains private and secure.

#### Acceptance Criteria

1. WHEN any database query executes THEN the GhostMilk System SHALL filter results by the authenticated user's dairy_id
2. WHEN a user attempts to access another dairy's data THEN the GhostMilk System SHALL deny access and return an authorization error
3. WHEN Row-Level Security policies are evaluated THEN the GhostMilk System SHALL enforce tenant isolation at the database level

### Requirement 9: PWA Support

**User Story:** As a user, I want to install the application on my device, so that I can access it offline and receive a native app experience.

#### Acceptance Criteria

1. WHEN a user visits the application on a supported browser THEN the GhostMilk System SHALL offer PWA installation
2. WHEN the application is installed as PWA THEN the GhostMilk System SHALL provide offline access to cached pages
3. WHEN network connectivity is restored THEN the GhostMilk System SHALL sync any pending data with the server

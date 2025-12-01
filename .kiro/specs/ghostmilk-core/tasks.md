# Implementation Plan

## Phase 1: Foundation Spirit (Project Setup)

- [x] 1. Set up project foundation
  - [x] 1.1 Configure Supabase client and environment variables
    - Create `src/lib/supabase/client.ts` for browser client
    - Create `src/lib/supabase/server.ts` for server-side client
    - Set up `.env.local` with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
    - _Requirements: 1.1, 8.1_
  - [x] 1.2 Create shared TypeScript types and interfaces
    - Create `src/types/index.ts` with User, Customer, MilkEntry, Rate, Summary types
    - Create `src/types/validation.ts` with ValidationError types
    - _Requirements: 2.1, 3.1, 4.1, 5.1_
  - [x] 1.3 Create database migration for all tables
    - Create `supabase/migrations/001_initial_schema.sql`
    - Define dairies, users, customers, milk_entries, rates tables
    - Add CHECK constraints and RLS policies
    - _Requirements: 2.1, 3.1, 4.1, 8.1, 8.2, 8.3_

- [x] 2. Foundation Checkpoint
  - Ensure Supabase connection works, ask the user if questions arise.

---

## Phase 2: Auth Spirit (Authentication)

- [x] 3. Implement authentication backend
  - [x] 3.1 Create auth service
    - Implement `src/services/auth.ts` with signIn, signUp, signOut, getSession, getUser
    - Handle dairy owner registration with automatic tenant (dairy) creation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 3.2 Create auth middleware
    - Implement `src/middleware.ts` for protected route handling
    - Handle session validation and expiry redirect
    - _Requirements: 1.4_

- [x] 4. Implement authentication UI
  - [x] 4.1 Create login page
    - Implement `src/app/login/page.tsx` with email/password form
    - Display error messages for invalid credentials
    - Redirect to dashboard on success
    - _Requirements: 1.1, 1.2_
  - [x] 4.2 Create registration page
    - Implement `src/app/register/page.tsx` for dairy owner signup
    - Include dairy name field for tenant creation
    - _Requirements: 1.5_
  - [x] 4.3 Implement logout functionality
    - Add logout action to terminate session
    - Redirect to login page after logout
    - _Requirements: 1.3_

- [ ]* 5. Auth Spirit Tests
  - [ ]* 5.1 Write unit tests for auth service
    - Test signIn with valid/invalid credentials
    - Test signUp creates dairy and user
    - Test session management
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Auth Spirit Checkpoint
  - Ensure all auth tests pass, ask the user if questions arise.

---

## Phase 3: Spirit Registry (Customer Management)

- [x] 7. Implement customer backend
  - [x] 7.1 Create customer service
    - Implement `src/services/customer.ts` with create, getById, list, update, delete, search
    - Ensure dairy_id is automatically set from authenticated user context
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8. Implement customer UI
  - [x] 8.1 Create customer list page
    - Implement `src/app/dashboard/customers/page.tsx`
    - Display customer table with name, phone, address
    - Add search input for filtering
    - _Requirements: 2.2, 2.5_
  - [x] 8.2 Create customer add form
    - Implement customer creation modal or page
    - Validate required fields (name)
    - _Requirements: 2.1_
  - [x] 8.3 Create customer edit functionality
    - Implement inline edit or edit modal
    - Persist changes and refresh display
    - _Requirements: 2.3_
  - [x] 8.4 Implement customer deletion
    - Add delete button with confirmation dialog
    - Remove customer from active view
    - _Requirements: 2.4_

- [ ]* 9. Spirit Registry Tests
  - [ ]* 9.1 Write property test for customer tenant association
    - **Property 1: Customer Creation Tenant Association**
    - **Validates: Requirements 2.1**
  - [ ]* 9.2 Write property test for customer update round-trip
    - **Property 3: Customer Update Round-Trip**
    - **Validates: Requirements 2.3**
  - [ ]* 9.3 Write property test for customer deletion exclusion
    - **Property 4: Customer Deletion Exclusion**
    - **Validates: Requirements 2.4**
  - [ ]* 9.4 Write property test for customer search filtering
    - **Property 5: Customer Search Tenant Filtering**
    - **Validates: Requirements 2.5**

- [x] 10. Spirit Registry Checkpoint
  - Ensure all customer tests pass, ask the user if questions arise.

---

## Phase 4: Rate Cauldron (Rate Configuration)

- [x] 11. Implement rate backend
  - [x] 11.1 Create rate service
    - Implement `src/services/rate.ts` with setRate, getRate, listRates, deleteRate, calculateAmount
    - Handle missing rate warning/interpolation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 12. Implement rate UI
  - [x] 12.1 Create rate table page
    - Implement `src/app/dashboard/rates/page.tsx`
    - Display FAT/SNF rate grid
    - _Requirements: 4.4_
  - [x] 12.2 Create rate add/edit form
    - Implement rate input with FAT, SNF, rate_per_liter fields
    - Handle create and update operations
    - _Requirements: 4.1, 4.2_

- [ ]* 13. Rate Cauldron Tests
  - [ ]* 13.1 Write property test for rate storage round-trip
    - **Property 9: Rate Storage Round-Trip**
    - **Validates: Requirements 4.1**

- [x] 14. Rate Cauldron Checkpoint
  - Ensure all rate tests pass, ask the user if questions arise.

---

## Phase 5: Ghostly Measurements (Milk Entry Recording)

- [x] 15. Implement milk entry backend
  - [x] 15.1 Create validation utilities
    - Implement `src/lib/validation.ts` with validateMilkEntry function
    - Validate FAT (0-15), SNF (0-15), liters (>0)
    - Return structured validation errors
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 15.2 Create milk entry service
    - Implement `src/services/milk-entry.ts` with create, getById, listByDate, listByCustomer, update, delete
    - Integrate validation before save
    - Calculate amount using rate service
    - _Requirements: 3.1, 3.6_

- [x] 16. Implement milk entry UI
  - [x] 16.1 Create milk entry form
    - Implement `src/app/dashboard/entries/page.tsx`
    - Add customer selector, date picker, FAT, SNF, liters inputs
    - Show real-time validation errors
    - Display calculated amount preview
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 16.2 Implement success animation
    - Create ghost pop-up animation component
    - Display on successful entry save
    - _Requirements: 3.5_
  - [x] 16.3 Create entries list by date
    - Display entries table filtered by selected date
    - Show customer name, FAT, SNF, liters, amount
    - _Requirements: 3.6_

- [ ]* 17. Ghostly Measurements Tests
  - [ ]* 17.1 Write property test for milk entry validation
    - **Property 7: Milk Entry Validation**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  - [ ]* 17.2 Write property test for amount calculation
    - **Property 6: Milk Entry Amount Calculation**
    - **Validates: Requirements 3.1**
  - [ ]* 17.3 Write property test for date filtering
    - **Property 8: Milk Entry Date Filtering**
    - **Validates: Requirements 3.6**
  - [ ]* 17.4 Write property test for rate non-retroactivity
    - **Property 10: Rate Update Non-Retroactivity**
    - **Validates: Requirements 4.2**

- [x] 18. Ghostly Measurements Checkpoint
  - Ensure all milk entry tests pass, ask the user if questions arise.

---

## Phase 6: Haunted Overview (Dashboard & Summaries)

- [x] 19. Implement summary backend
  - [x] 19.1 Create summary service
    - Implement `src/services/summary.ts` with getDailySummary, getWeeklySummary, getMonthlySummary, getDateRangeSummary
    - Aggregate liters, amount, entry_count from milk_entries
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 20. Implement dashboard UI
  - [x] 20.1 Create dashboard layout
    - Implement `src/app/dashboard/layout.tsx` with sidebar navigation
    - Add links to Customers, Entries, Rates, Reports
    - _Requirements: 5.1_
  - [x] 20.2 Create dashboard overview page
    - Implement `src/app/dashboard/page.tsx`
    - Display today's total liters, total amount, entry count
    - _Requirements: 5.1_
  - [x] 20.3 Create weekly summary view
    - Display day-by-day breakdown for current week
    - _Requirements: 5.3_
  - [x] 20.4 Create monthly summary view
    - Display week-by-week breakdown and monthly totals
    - _Requirements: 5.4_
  - [x] 20.5 Create date range selector
    - Add date picker for custom range
    - Display aggregated totals for selected period
    - _Requirements: 5.2_

- [ ]* 21. Haunted Overview Tests
  - [ ]* 21.1 Write property test for summary aggregation
    - **Property 11: Summary Aggregation Correctness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 22. Haunted Overview Checkpoint
  - Ensure all summary tests pass, ask the user if questions arise.

---

## Phase 7: Customer Portal (Customer View)

- [-] 23. Implement customer portal backend
  - [x] 23.1 Create customer-specific entry queries
    - Add listByCustomer method filtering by authenticated customer_id
    - Create customer summary aggregation functions
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 24. Implement customer portal UI
  - [x] 24.1 Create portal layout
    - Implement `src/app/portal/layout.tsx` for customer view
    - Simpler navigation than owner dashboard
    - _Requirements: 6.1_
  - [x] 24.2 Create customer entries view
    - Implement `src/app/portal/page.tsx`
    - Display customer's own entries with FAT, SNF, liters, amount
    - _Requirements: 6.1, 6.2_
  - [x] 24.3 Create customer monthly summary
    - Display total liters and amount for current month
    - _Requirements: 6.3_
  - [x] 24.4 Create customer historical view
    - Display entries grouped by month with totals
    - _Requirements: 6.4_

- [ ]* 25. Customer Portal Tests
  - [ ]* 25.1 Write property test for customer entry isolation
    - **Property 12: Customer Portal Entry Isolation**
    - **Validates: Requirements 6.1**
  - [ ]* 25.2 Write property test for entry display completeness
    - **Property 13: Customer Entry Display Completeness**
    - **Validates: Requirements 6.2**
  - [ ]* 25.3 Write property test for customer summary aggregation
    - **Property 14: Customer Summary Aggregation**
    - **Validates: Requirements 6.3, 6.4**

- [x] 26. Customer Portal Checkpoint
  - Ensure all portal tests pass, ask the user if questions arise.

---

## Phase 8: Theme Enchantment (Theme System)

- [-] 27. Implement theme system
  - [x] 27.1 Create theme provider
    - Implement `src/components/theme/ThemeProvider.tsx`
    - Read THEME_MODE from environment variable
    - Apply CSS variables based on mode
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 27.2 Create theme CSS files
    - Create `src/styles/spooky.css` with neon purple, dark background
    - Create `src/styles/clean.css` with professional blue theme
    - _Requirements: 7.1, 7.2_
  - [x] 27.3 Create spooky animations
    - Implement ghost floating animation component
    - Create fog overlay component
    - Add flickering neon text styles
    - Create skeleton loader component
    - _Requirements: 7.4_
  - [x] 27.4 Apply theme to all UI components
    - Update all pages to use theme-aware styling
    - Ensure animations only active in spooky mode
    - _Requirements: 7.3_

- [x] 28. Theme Enchantment Checkpoint
  - Verify theme switching works correctly, ask the user if questions arise.

---

## Phase 9: Tenant Isolation (Security)

- [ ]* 29. Tenant isolation tests
  - [ ]* 29.1 Write property test for tenant data isolation
    - **Property 2: Tenant Data Isolation**
    - **Validates: Requirements 2.2, 8.1**
  - [ ]* 29.2 Write property test for cross-tenant access denial
    - **Property 15: Cross-Tenant Access Denial**
    - **Validates: Requirements 8.2**

- [ ] 30. Security Checkpoint
  - Ensure all tenant isolation tests pass, ask the user if questions arise.

---

## Phase 10: PWA Spirit (Progressive Web App)

- [ ] 31. Implement PWA support
  - [ ] 31.1 Configure PWA manifest
    - Create `public/manifest.json` with app name, icons, theme colors
    - Add manifest link to layout
    - _Requirements: 9.1_
  - [ ] 31.2 Set up service worker
    - Configure next-pwa or workbox
    - Cache static assets and key pages
    - _Requirements: 9.1, 9.2_
  - [ ] 31.3 Implement offline support
    - Cache API responses for offline viewing
    - Display offline indicator
    - _Requirements: 9.2_
  - [ ] 31.4 Implement data sync
    - Queue pending operations when offline
    - Sync when connectivity restored
    - _Requirements: 9.3_

- [ ] 32. Final Checkpoint
  - Ensure all tests pass and PWA works correctly, ask the user if questions arise.

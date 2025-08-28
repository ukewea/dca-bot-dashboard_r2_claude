# Crypto DCA Dashboard - Implementation TODO

## Phase 1: Core Infrastructure ✅
- [x] Project setup with React + TypeScript + Vite
- [x] Basic folder structure (src/components, src/pages, src/lib, src/types)
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] ESLint configuration

## Phase 2: Data Layer ✅
- [x] Define TypeScript interfaces for all data contracts
- [x] Implement JSON/NDJSON file readers
- [x] Error handling for missing/malformed data
- [x] Configuration system (build-time + runtime)
- [x] Utility functions for formatting

## Phase 3: Core Pages - Basic Implementation ✅
- [x] Dashboard page with basic KPIs and positions table
- [x] Charts page with portfolio performance visualization
- [x] Basic navigation between pages

## Phase 4: Enhanced Dashboard (Current Priority)
- [ ] **Fix Dashboard to match design spec exactly:**
  - [ ] Add market value calculation and display
  - [ ] Add P/L calculation and color coding
  - [ ] Add last price column
  - [ ] Improve responsive table design
  - [ ] Add loading states for individual positions

## Phase 5: Enhanced Charts
- [ ] **Per-symbol chart filtering:**
  - [ ] Multi-select symbol filter
  - [ ] Individual asset performance charts
- [ ] **Chart performance optimizations:**
  - [ ] Lazy loading of chart data
  - [ ] Data downsampling for large datasets (>1k points)
  - [ ] Memory caching with ETag revalidation

## Phase 6: Optional Features (Drilldowns)
- [ ] **Transactions page:**
  - [ ] Transactions list (filterable by asset)
  - [ ] Transaction history table
- [ ] **Price history page:**
  - [ ] Price data visualization
  - [ ] Per-asset price charts
- [ ] **Operations page:**
  - [ ] Iterations timeline
  - [ ] Bot status and performance metrics

## Phase 7: UX Enhancements
- [ ] **Theme system:**
  - [ ] Light/Dark mode toggle
  - [ ] Persistent theme preference
- [ ] **Accessibility:**
  - [ ] Semantic HTML improvements
  - [ ] Keyboard navigation
  - [ ] High contrast theme
  - [ ] Screen reader compatibility
- [ ] **Responsive design refinements:**
  - [ ] Mobile-first approach
  - [ ] Tablet optimization
  - [ ] Better breakpoint handling

## Phase 8: Performance & Resilience
- [ ] **Error handling improvements:**
  - [ ] Retry mechanism with exponential backoff
  - [ ] Better empty states
  - [ ] Network error handling
- [ ] **Performance optimizations:**
  - [ ] Code splitting
  - [ ] Bundle size optimization
  - [ ] Streaming NDJSON parsing
- [ ] **Data validation:**
  - [ ] Robust parsing for partial writes
  - [ ] Version field handling
  - [ ] Unknown field tolerance

## Phase 9: Internationalization
- [ ] **i18n framework setup:**
  - [ ] Locale detection
  - [ ] Number formatting by locale
  - [ ] Date formatting by locale
  - [ ] Currency formatting
- [ ] **Timezone handling:**
  - [ ] UTC internal storage
  - [ ] Local timezone display
  - [ ] Timezone toggle

## Phase 10: Testing & Quality Assurance
- [ ] **Unit tests:**
  - [ ] Data reader/parser tests
  - [ ] Utility function tests
  - [ ] Component logic tests
- [ ] **Integration tests:**
  - [ ] API integration tests
  - [ ] Chart rendering tests
- [ ] **E2E tests:**
  - [ ] User workflow tests
  - [ ] Cross-browser compatibility
- [ ] **Performance tests:**
  - [ ] Large dataset handling
  - [ ] Load time benchmarks

## Phase 11: Deployment & CI/CD
- [ ] **GitHub Actions workflow:**
  - [ ] Automated testing
  - [ ] Build pipeline
  - [ ] Deploy to GitHub Pages
- [ ] **Docker containerization:**
  - [ ] NGINX-based container
  - [ ] Multi-stage build
  - [ ] Production optimizations
- [ ] **Monitoring:**
  - [ ] Error tracking
  - [ ] Performance monitoring
  - [ ] Usage analytics

## Current Status
- ✅ Basic website is functional with Dashboard and Charts
- ⚠️ Dashboard needs P/L calculations and market values
- ⚠️ Charts work but need per-symbol filtering
- 🔄 Ready to enhance core functionality

## Next Steps
1. Fix Dashboard calculations to show market values and P/L
2. Add per-symbol chart filtering
3. Implement optional drilldown pages
4. Add theme system and accessibility features
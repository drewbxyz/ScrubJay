# scrubjay

## 0.1.1

### Patch Changes

- cc2eeff: ci fixes

## 0.1.0

### Minor Changes

- 42c7640: Add RSS feed subscription and alerting system

  - Add RSS feed ingestion with automatic fetching every 5 minutes
  - Add RSS dispatcher service to send RSS alerts to Discord channels
  - Add database schema for RSS sources, items, and channel subscriptions
  - Integrate RSS dispatcher into the dispatch job alongside eBird alerts
  - Add RSS service, repository, fetcher, and transformer for feed processing

- 0ff7ef3: Adds voting on messages to add species to channel eBird filters

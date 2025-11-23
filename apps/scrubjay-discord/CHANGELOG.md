# scrubjay-discord

## 0.1.8

### Patch Changes

- 15df5eb: bugfix: create composite primary key on channelId and sourceId for channelRssSubscriptions table
- 146fd69: refactor to create a global service for drizzle

## 0.1.7

### Patch Changes

- e0be080: fix max length for rss description

## 0.1.6

### Patch Changes

- a73f4b5: fix issue where channel rss subscriptions to sources were ignored

## 0.1.5

### Patch Changes

- 885b91a: update readme

## 0.1.4

### Patch Changes

- de75388: update readme

## 0.1.3

### Patch Changes

- 1683bd1: update scrubjay package name

## 0.1.2

### Patch Changes

- a0d7e1f: update configuration

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

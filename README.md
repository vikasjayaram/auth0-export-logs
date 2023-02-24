# Auth0 Export Logs to filesystem

Scans through [Auth0 logs](https://auth0.com/docs/logs) and writes to local file the after N minutes.

## Auth0 client

To run this project, you require an Auth0 client that has access to the Auth0 Management API and the scopes defined as `read:logs`.

# Setup Guide

## Requirements

* node.js

## Steps

### 1) Auth0 Client
Add an M2M client with `read:logs` APIv2 access to your Auth0 tenant. Copy `client_id` and `client_secret` to step 2.

### 2) Env Setup
First, copy [`.env.sample`] to `.env` 

```bash
cp .env.sample .env
vim .env
```
Pupulate the variables.

### 3) Create a logs folder in the project directory if it doesnt exist

```bash
mkdir logs
```

#### 4) Install And Run

```bash
npm install && node main.js
```

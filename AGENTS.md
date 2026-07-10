# AGENTS.md

# Festens Midtpunkt – Development Specification

## Purpose

This document defines the engineering rules that govern this repository.

These instructions have higher priority than convenience refactoring or stylistic preferences.

Every modification shall comply with this specification unless explicitly instructed otherwise by the repository owner.

---

# Project Background

This repository represents the recovered baseline of the project after a newer development version was permanently lost.

The current implementation is therefore considered the canonical starting point for all future work.

Do not attempt to recreate unknown functionality by making assumptions.

Only implement functionality that has been explicitly requested.

---

# Primary Objective

Develop a maintainable, self-hosted web application for digital party games.

Core functionality includes:

- Multiple card decks
- Official decks
- Custom decks
- Player management
- Random card selection
- Placeholder replacement
- Mobile friendly interface
- Docker deployment
- Long-term maintainability

---

# Technology Stack

Unless explicitly approved otherwise, use only the existing technology stack.

Frontend

- HTML5
- CSS3
- Vanilla JavaScript

Backend

- Node.js
- Express

Storage

- JSON

Deployment

- Docker
- docker-compose

Do not introduce:

- React
- Vue
- Angular
- TypeScript
- Database systems
- Build pipelines
- Additional frameworks

unless specifically instructed.

---

# Development Philosophy

The project prioritizes:

1. Stability
2. Readability
3. Maintainability
4. Simplicity

Never increase architectural complexity unless it provides measurable long-term value.

---

# Existing Code

Existing working code shall be treated as production code.

Do not rewrite working implementations solely because an alternative solution exists.

Refactoring is permitted only when at least one of the following is true:

- fixes a bug
- improves maintainability
- improves performance
- improves security
- removes duplicated logic
- enables requested functionality

Personal coding preference is not sufficient justification.

---

# Architectural Preservation

Preserve the existing architecture whenever practical.

New functionality should integrate with existing systems instead of replacing them.

Avoid introducing parallel implementations.

---

# Before Writing Code

Before implementing any feature:

1. Read the affected files completely.
2. Understand the existing architecture.
3. Identify dependencies.
4. Verify assumptions from the current implementation.

Never infer behavior that can be verified by reading the code.

---

# Large Changes

For modifications that affect architecture or application flow:

Provide:

- technical motivation
- implementation strategy
- advantages
- disadvantages
- possible side effects

Do not implement until approved.

---

# Small Changes

Bug fixes, documentation improvements and isolated features may be implemented immediately.

---

# Project Structure

Keep the repository organized.

Avoid unnecessary new directories.

Avoid duplicate utility functions.

Reuse existing modules whenever possible.

---

# JSON Compatibility

Existing JSON formats are considered stable.

Maintain backwards compatibility.

If a breaking format change becomes necessary:

- explain why
- propose migration strategy
- wait for approval

---

# API Compatibility

Existing API endpoints should remain compatible.

Avoid changing:

- endpoint names
- request formats
- response formats

unless required.

If breaking changes are necessary, document them.

---

# User Interface

The interface should remain:

- responsive
- touch friendly
- simple
- intuitive

Avoid unnecessary animations.

Avoid excessive visual complexity.

Prioritize usability over appearance.

---

# Docker

Docker support is mandatory.

Every completed feature shall remain compatible with Docker deployment.

Do not introduce platform-specific solutions.

---

# Git Workflow

Development shall be incremental.

Each task should produce one logical commit.

Do not combine unrelated changes.

Never perform Git commits automatically.

Instead propose:

- commit message
- summary of changes

The repository owner performs commits manually.

---

# Documentation

Whenever behavior changes:

Update documentation.

Documentation shall always reflect implementation.

Outdated documentation is considered a defect.

---

# Code Style

Prefer:

- descriptive identifiers
- small functions
- modular code
- explicit control flow

Avoid:

- deeply nested logic
- unnecessary abstraction
- premature optimization
- magic numbers

Comments should explain intent rather than implementation.

---

# Error Handling

Never silently ignore errors.

Handle failures predictably.

Provide meaningful error messages.

Prefer graceful degradation.

---

# Performance

Do not optimize prematurely.

When optimization is performed:

- explain why
- identify bottleneck
- describe measurable benefit

---

# Security

Never introduce insecure defaults.

Validate all external input.

Avoid unnecessary privileges.

Avoid exposing internal implementation details.

---

# Decision Making

When multiple implementations are possible:

Select the solution that maximizes:

- readability
- maintainability
- predictability

rather than the shortest implementation.

---

# Communication

After completing work provide:

1. What was changed.
2. Why it was changed.
3. Files modified.
4. How to test.
5. Possible side effects.

Keep explanations concise and technical.

---

# General Engineering Rule

Assume this project will continue to evolve for many years.

Every implementation should make future maintenance easier rather than harder.

Prefer extending existing systems over replacing them.

Engineering quality is more important than implementation speed.

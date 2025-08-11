# Singleton Fury: AI Development Agent Handover

## Project Overview

Welcome, AI Development Agents, to the Singleton Fury project! You are joining a team focused on building a unique asymmetric conflict game with a strong emphasis on community building and user-generated content.

The core concept revolves around asymmetric battles, initially featuring "One Powerful Gorilla vs. A Team of 100 Men." However, the vision extends beyond this single scenario, establishing "Singleton Fury" as a franchise brand for various asymmetric conflict simulations.

## Singleton Fury Brand and Narrative

The brand name, "Singleton Fury," represents the core conflict: the "Singleton" (the one) against the "Fury" (the many). This name will be used for a series of games exploring different asymmetric scenarios (e.g., Primal, Uprising, Anomaly).

A key narrative hook is the mystery surrounding the identity of the "Singleton" across shifting timelines and scenarios. The "Singleton" could be the gorilla, one of the men, an AI, or something else entirely. This ambiguity creates deep lore, encourages community discussion, and fuels the desire for players to create and explore their own theories through user-generated content.

Community building is a central pillar of this project. We aim to foster a vibrant community through engaging gameplay and empowering players to contribute to the game's ecosystem.

## Technical Architecture Plan

The technical architecture is designed for scalability, flexibility, and to support our community and user-generated content goals:

*   **Core Game Data (Cloud Spanner):** Structured game data such as player progression, game sessions, statistics, abilities, and attributes will be stored in Cloud Spanner. This provides a highly scalable, globally distributed, and strongly consistent relational database for the core game loop.
*   **User-Generated Content & Real-time Features (Firestore):** Unstructured or semi-structured data like player-created scenarios, user profiles, and real-time updates (e.g., leaderboards, in-game events related to user content) will be managed in Firestore. Its flexibility and real-time capabilities are well-suited for this.
*   **Microservices on GKE:** The game's backend logic will be structured as microservices deployed on Google Kubernetes Engine (GKE). This allows for independent development, scaling, and management of different functionalities (core game, AI/GenAI, Creem.io integration, Polar.sh integration).
*   **Authentication (Firebase Authentication):** User authentication will be handled by Firebase Authentication, providing a secure and easy-to-integrate solution for managing player accounts and creators.
*   **Generative AI (Vertex AI & Genkit):** Vertex AI will power our GenAI features, starting with dynamic scenario generation. Genkit will be used to orchestrate and deploy these AI workflows.
*   **Platform Integration (Polar.sh & Creem.io):** The architecture is designed to integrate with Polar.sh (for open-source collaboration and funding) and Creem.io (for the creator platform and user-generated content). Dedicated microservices will handle communication and data flow with these platforms.

## Bootstrapping Strategy

We are currently in a bootstrapping phase, optimizing resource usage to operate within an initial $1000 Google Cloud credit (with potential for more from the Google AI startups program). Our strategy involves:

*   **Maximizing Free Tiers:** Leveraging the free tiers of Firebase services (Authentication, Firestore, Hosting) as much as possible.
*   **Strategic Cloud Spanner Usage:** Running a small Cloud Spanner instance for development and testing, potentially shutting it down when not in active use to manage costs.
*   **Cost-Effective GenAI:** Utilizing Google AI Studio for prompt engineering and experimentation, and starting with CPU-based inference on Vertex AI for integrated GenAI features.
*   **Lean GKE Deployment:** Deploying backend services on a small, cost-optimized GKE cluster.

The goal is to build the core game, implement key features (especially those related to user-generated content), and establish the technical foundation for scalability within this initial budget.

## Role of User-Generated Content

User-generated content, facilitated through the Creem.io integration and stored in Firestore, is vital to the Singleton Fury ecosystem. It allows players to create new scenarios, potentially influence the lore, and contribute to the game's longevity and community engagement. Your development efforts should prioritize features that empower creators and seamlessly integrate their content into the game experience.

Your tasks will involve working on specific microservices, implementing database interactions (both Spanner and Firestore), integrating with Firebase and Google Cloud services, and developing the logic for GenAI features and platform integrations, all while keeping the bootstrapping cost constraints and the community-centric vision in mind.

Let's build Singleton Fury!
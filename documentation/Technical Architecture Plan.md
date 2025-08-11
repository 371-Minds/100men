# Technical Architecture Plan for Singleton Fury

## Overview

The technical architecture for Singleton Fury is designed for scalability, flexibility, and leveraging cloud-native services to support a viral game with rich GenAI-powered features and integration with creator and open-source platforms. The core philosophy is a microservices approach deployed on Google Cloud Platform (GCP), utilizing a combination of managed services.

## Core Components

1.  **Cloud Spanner (Core Game Data):**
    *   **Purpose:** To store all core, structured game data requiring high availability, strong consistency, and transactional integrity.
    *   **Data Stored:** Player profiles, progression (levels, experience, skills, attributes), abilities, achievements, game sessions, and detailed game statistics.
    *   **Schema:** Relational schema with carefully designed primary keys and interleaved tables to optimize read performance for related data (e.g., player progression interleaved with player data).

2.  **Firestore (User-Generated Content & Real-time Features):**
    *   **Purpose:** To store flexible, less structured data, particularly user-generated content (from Creem.io) and to power real-time features like leaderboards (depending on final design).
    *   **Data Stored:** Player-created scenarios, custom game modes (if implemented), user settings (alternative to Cloud Spanner `settings` table depending on flexibility needs), potentially real-time leaderboard data.
    *   **Model:** NoSQL document database with collections and subcollections. Data modeling will prioritize denormalization for efficient reads of related content.

3.  **Microservices Architecture:**
    *   **Purpose:** To break down the application into smaller, independent, and manageable services, enabling better scalability, resilience, and development velocity.
    *   **Key Services (Initial):**
        *   **Authentication Service:** Handles user registration, login, and session management (integrates with Firebase Authentication).
        *   **Player Service:** Manages player profiles and interacts with Cloud Spanner for core player data.
        *   **Progression Service:** Manages player progression (levels, experience, skills, attributes) and interacts with Cloud Spanner.
        *   **Game Session Service:** Records and retrieves game session data and statistics, interacting with Cloud Spanner.
        *   **Content Service:** Manages user-generated content, interacting with Firestore.
        *   **GenAI Service:** Orchestrates interactions with Vertex AI for dynamic content generation (scenarios, AI behavior).
        *   **Creem.io Integration Service:** Handles communication with the Creem.io API for pushing and pulling user-created content.
        *   **Polar.sh Integration Service:** Handles communication with the Polar.sh API for open-source related features.
    *   **Communication:** Services will communicate primarily via gRPC for high performance internal calls and REST APIs for external interactions or between certain services. A message queue (e.g., Google Cloud Pub/Sub) will be used for asynchronous communication and decoupling services.

4.  **Google Kubernetes Engine (GKE):**
    *   **Purpose:** To deploy, manage, and scale the containerized microservices.
    *   **Deployment:** Docker containers for each microservice deployed on a GKE cluster.
    *   **Scalability:** GKE's auto-scaling capabilities will automatically adjust the number of service replicas based on traffic and resource utilization.

5.  **Firebase Authentication:**
    *   **Purpose:** To provide a secure and easy-to-integrate user authentication system.
    *   **Integration:** Used by the Authentication Service (or directly by frontend/backend where appropriate) to handle user sign-ups and logins. Supports various authentication providers.

6.  **Vertex AI and Genkit (GenAI Features):**
    *   **Purpose:** To power the dynamic and unique aspects of the game using generative AI.
    *   **Vertex AI:** Provides access to large language models (LLMs) and other AI capabilities for tasks like dynamic scenario generation, adaptive AI behavior, and procedural content details.
    *   **Genkit:** Used to build, deploy, and monitor the AI-powered workflows, integrating different models and services. The GenAI Service will utilize Genkit.

7.  **Frontend Application:**
    *   **Purpose:** The player-facing client application (Web, Mobile, Desktop).
    *   **Deployment:** Static assets hosted on Firebase Hosting or Cloud Storage.
    *   **Communication:** Interacts with the backend microservices via their public APIs.

## Integration with External Platforms

*   **Creem.io:** The Creem.io Integration Service will facilitate the flow of user-created game content (scenarios, potentially custom rules) from Creem.io into the game's Firestore database and potentially trigger updates or notifications within the game or other services.
*   **Polar.sh:** The Polar.sh Integration Service will connect the game's development and community aspects with the Polar.sh platform, potentially for showcasing open-source contributions, managing funding for community-driven features, or providing transparency into development milestones. Communication between services (e.g., using Cloud Pub/Sub) will be key for synchronizing relevant data or triggering actions across both platforms.

## Data Flow

*   Player actions trigger calls to backend microservices.
*   Backend services interact with Cloud Spanner for core game state and progression.
*   Backend services interact with Firestore for user-generated content and real-time updates.
*   The GenAI Service interacts with Vertex AI based on requests from core game logic to generate dynamic content.
*   Integration services communicate with Creem.io and Polar.sh APIs.
*   Frontend receives real-time updates from Firestore (potentially) or through backend push notifications.

## Scalability and Resilience

*   **Cloud Spanner:** Horizontally scalable and globally distributed.
*   **Firestore:** Scales automatically.
*   **GKE:** Provides automatic scaling and self-healing for microservices.
*   **Microservices:** Services can be scaled independently based on demand.
*   **Managed Services:** Relying on managed GCP services reduces operational overhead and leverages Google's infrastructure scalability.

## Future Considerations

*   Implementing a robust CI/CD pipeline using Cloud Build.
*   Setting up comprehensive monitoring and logging (Cloud Monitoring, Cloud Logging).
*   Implementing robust security measures at all layers (IAM, VPC, service-to-service authentication).
*   Exploring advanced GenAI use cases (adaptive NPC behavior, dynamic lore).
*   Optimizing database schemas and queries based on performance monitoring.
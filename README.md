# SOREDIS - Supabase Vector Search Integration

Ce projet contient la configuration et les migrations nécessaires pour utiliser la recherche vectorielle avec Supabase dans un workflow n8n.

## Structure de la base de données

### Tables
- **documents** : Table originale pour le stockage de documents avec embeddings
- **soredis** : Table dédiée pour le projet SOREDIS avec la même structure que documents

### Colonnes communes
- `id` (uuid) : Identifiant unique
- `content` (text) : Contenu du document
- `embedding` (vector) : Vecteur d'embedding pour la recherche sémantique
- `metadata` (jsonb) : Métadonnées additionnelles
- `created_at` (timestamp) : Date de création
- `updated_at` (timestamp) : Date de dernière modification

## Fonctions RPC

### match_documents
Fonction de recherche vectorielle pour la table `documents`.

### match_soredis
Fonction de recherche vectorielle pour la table `soredis`.

```sql
match_soredis(
  query_embedding vector(1536),
  filter jsonb DEFAULT '{}',
  match_count integer DEFAULT 10
)
```

## Installation

1. Créer les tables si nécessaire (voir `supabase/migrations/`)
2. Appliquer les migrations pour créer la fonction `match_soredis`
3. Configurer n8n pour utiliser la fonction `match_soredis` au lieu de `match_documents`

## Configuration n8n

Dans votre workflow n8n, assurez-vous d'utiliser :
- Table : `soredis`
- Fonction RPC : `match_soredis`

## Configuration MCP

Créez un fichier `.mcp.json` à la racine du projet avec votre configuration Supabase (non versionné pour des raisons de sécurité).
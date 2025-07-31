-- Migration: Create match_soredis function
-- Description: Fonction de recherche vectorielle pour la table soredis

CREATE OR REPLACE FUNCTION match_soredis(
  query_embedding vector(1536),
  filter jsonb DEFAULT '{}',
  match_count integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    soredis.id,
    soredis.content,
    soredis.metadata,
    1 - (soredis.embedding <=> query_embedding) AS similarity
  FROM soredis
  WHERE (soredis.metadata @> filter OR filter = '{}')
  ORDER BY soredis.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
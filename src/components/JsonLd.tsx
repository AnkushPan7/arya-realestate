import { JsonLdScript, type JsonLdValue } from "@/lib/seo";

type JsonLdProps = {
  data: JsonLdValue;
};

/**
 * Server Component wrapper around `JsonLdScript` — single import surface
 * for embedding structured data (`@/lib/structured-data`) in a page.
 */
export function JsonLd({ data }: JsonLdProps) {
  return <JsonLdScript data={data} />;
}

// Renders a JSON-LD structured-data <script>. Server component (no client JS).
export function JsonLd({ data }: { data: unknown }) {
  const json = Array.isArray(data) ? data : [data]
  return (
    <>
      {json.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}
